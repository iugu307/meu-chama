import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;

export const maxDuration = 55; // Leave 5s margin for response

export async function POST(request: NextRequest) {
  try {
    // Get pending items (claim them atomically)
    const { data: queueItems } = await supabase
      .from("queue")
      .select("*, contacts(instagram_id), automations(link_url, quick_reply_button)")
      .eq("status", "pending")
      .is("claimed_at", null)
      .order("created_at", { ascending: true })
      .limit(60); // ~30s worth at 2/sec

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    // Claim them
    const ids = queueItems.map((item) => item.id);
    const now = new Date().toISOString();

    await supabase
      .from("queue")
      .update({ claimed_at: now, status: "sending" })
      .in("id", ids);

    // Process with rate limiting
    const results = { sent: 0, failed: 0, skipped: 0 };
    let sent = 0;

    for (const item of queueItems) {
      try {
        const contact = (item as any).contacts;
        const automation = (item as any).automations;

        if (!contact?.instagram_id) {
          await supabase
            .from("queue")
            .update({ status: "skipped", error_message: "Invalid contact" })
            .eq("id", item.id);
          results.skipped++;
          continue;
        }

        // Check 24h window for non-comment messages
        if (item.recipient_type === "user") {
          const { data: contact_data } = await supabase
            .from("contacts")
            .select("last_response_at")
            .eq("id", item.contact_id)
            .single();

          if (contact_data?.last_response_at) {
            const lastResponse = new Date(contact_data.last_response_at);
            const now = new Date();
            const hours = (now.getTime() - lastResponse.getTime()) / (1000 * 60 * 60);

            if (hours > 24) {
              await supabase
                .from("queue")
                .update({ status: "skipped", error_message: "24h window expired" })
                .eq("id", item.id);
              results.skipped++;
              continue;
            }
          }
        }

        // Send message
        const payload: any = {
          recipient: {
            [item.recipient_type === "comment" ? "comment_id" : "id"]: item.recipient_id,
          },
          message: {
            text: item.content,
          },
        };

        // Add quick reply button if configured
        if (automation?.quick_reply_button && item.message_type === "welcome") {
          payload.message.quick_replies = [
            {
              type: "text",
              title: "Ir para o link",
              payload: "button_click",
            },
          ];
        }

        const response = await fetch(`https://graph.instagram.com/v25.0/${contact.instagram_id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            access_token: ACCESS_TOKEN,
          }),
        });

        const result = await response.json();

        if (result.message_id) {
          await supabase
            .from("queue")
            .update({ status: "sent", attempts: (item.attempts || 0) + 1 })
            .eq("id", item.id);
          results.sent++;
        } else {
          throw new Error(result.error?.message || "Unknown error");
        }
      } catch (error) {
        await supabase
          .from("queue")
          .update({
            status: "failed",
            error_message: String(error),
            attempts: (item.attempts || 0) + 1,
          })
          .eq("id", item.id);
        results.failed++;
      }

      // Rate limit: ~2 per second
      sent++;
      if (sent % 2 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Queue drain error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
