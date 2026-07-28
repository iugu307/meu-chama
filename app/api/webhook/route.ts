import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateWebhookSignature, matchesKeyword, parseInstagramMessage } from "@/lib/webhook";

const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || undefined;

  if (!validateWebhookSignature(rawBody, signature, APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const body = JSON.parse(rawBody);

  // Store event
  await supabase.from("events").insert({
    event_type: body.entry?.[0]?.changes?.[0]?.field || "unknown",
    raw_payload: body,
    processed: false,
  });

  // Process async
  processWebhookAsync(body).catch(console.error);

  return NextResponse.json({ ok: true });
}

async function processWebhookAsync(payload: any) {
  try {
    const entry = payload.entry?.[0];
    if (!entry) return;

    const changes = entry.changes || [];

    for (const change of changes) {
      const field = change.field;
      const value = change.value || {};

      if (field === "comments") {
        await handleComment(value);
      } else if (field === "messages") {
        await handleMessage(value);
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
  }
}

async function handleComment(value: any) {
  const parsed = parseInstagramMessage(value);
  const from = parsed.from;
  const text = parsed.message || "";
  const commentId = parsed.comment_id;

  if (!from?.id || !text || !commentId) return;

  // Get active automations with comment trigger
  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("active", true)
    .contains("triggers", ["comment"]);

  if (!automations || automations.length === 0) return;

  // Check if comment matches any automation
  for (const automation of automations) {
    if (!matchesKeyword(text, automation.keywords, automation.match_type)) {
      continue;
    }

    // Skip if post-specific and doesn't match
    if (automation.post_id && automation.post_id !== value.post_id) {
      continue;
    }

    // Get or create contact
    let { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("instagram_id", from.id)
      .single();

    if (!contact) {
      const result = await supabase
        .from("contacts")
        .insert({
          instagram_id: from.id,
          instagram_username: from.username,
          first_contact_at: new Date().toISOString(),
        })
        .select()
        .single();

      contact = result.data;
    }

    if (!contact) continue;

    // Queue private reply (breaks 24h window, valid for 7 days)
    if (automation.public_reply_variations.length > 0) {
      const randomReply = automation.public_reply_variations[
        Math.floor(Math.random() * automation.public_reply_variations.length)
      ];

      await supabase.from("queue").insert({
        contact_id: contact.id,
        automation_id: automation.id,
        message_type: "welcome",
        recipient_type: "comment",
        recipient_id: commentId,
        content: randomReply,
        status: "pending",
      });
    }

    // Trigger follow-ups if button pressed
    // (they'll be enqueued when person responds within 24h)
  }
}

async function handleMessage(value: any) {
  const parsed = parseInstagramMessage(value);
  const from = parsed.from;
  const text = parsed.message || "";
  const isStoryReply = parsed.reply_to?.story;

  if (!from?.id || !text) return;

  // Get active automations with dm or story trigger
  const triggers = isStoryReply ? ["story", "dm"] : ["dm"];

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("active", true);

  if (!automations) return;

  const matchedAutomations = automations.filter(
    (a: any) => triggers.some((t: string) => a.triggers.includes(t)) && matchesKeyword(text, a.keywords, a.match_type)
  );

  if (matchedAutomations.length === 0) return;

  // Get or create contact
  let { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("instagram_id", from.id)
    .single();

  if (!contact) {
    const result = await supabase
      .from("contacts")
      .insert({
        instagram_id: from.id,
        instagram_username: from.username,
        first_contact_at: new Date().toISOString(),
        last_response_at: new Date().toISOString(),
      })
      .select()
      .single();

    contact = result.data;
  }

  if (!contact) return;

  // Update last response (opens 24h window)
  await supabase
    .from("contacts")
    .update({ last_response_at: new Date().toISOString() })
    .eq("id", contact.id);

  // Queue welcome DM and follow-ups for each matched automation
  for (const automation of matchedAutomations) {
    // Queue welcome
    await supabase.from("queue").insert({
      contact_id: contact.id,
      automation_id: automation.id,
      message_type: "welcome",
      recipient_type: "user",
      recipient_id: from.id,
      content: automation.welcome_dm,
      status: "pending",
    });

    // Queue follow-ups
    const { data: followups } = await supabase
      .from("followups")
      .select("*")
      .eq("automation_id", automation.id)
      .order("order", { ascending: true });

    if (followups) {
      for (const followup of followups) {
        await supabase.from("queue").insert({
          contact_id: contact.id,
          automation_id: automation.id,
          followup_id: followup.id,
          message_type: followup.type,
          recipient_type: "user",
          recipient_id: from.id,
          content: followup.content,
          status: "pending",
        });
      }
    }
  }
}
