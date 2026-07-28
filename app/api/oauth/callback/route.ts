import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const APP_ID = process.env.INSTAGRAM_APP_ID!;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=no_code`);
  }

  try {
    // Step 1: Exchange code for short-lived token
    const shortTokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: `${APP_URL}/api/oauth/callback`,
        code,
      }).toString(),
    });

    const shortTokenData = await shortTokenRes.json();
    console.log("Step 1 - Short token response:", shortTokenData);

    if (!shortTokenData.access_token) {
      throw new Error(`No access token in response: ${JSON.stringify(shortTokenData)}`);
    }

    // Step 2: Exchange short token for long-lived token
    const longTokenParams = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: APP_SECRET,
      access_token: shortTokenData.access_token,
    });

    const longTokenUrl = `https://graph.instagram.com/access_token?${longTokenParams}`;
    const longTokenFetch = await fetch(longTokenUrl);
    const longTokenData = await longTokenFetch.json();
    console.log("Step 2 - Long token response:", longTokenData);

    const accessToken = longTokenData.access_token || shortTokenData.access_token;
    const userId = shortTokenData.user_id!;

    // Step 3: Get user info
    const userRes = await fetch(
      `https://graph.instagram.com/me?fields=user_id,username,name,profile_picture_url&access_token=${accessToken}`
    );

    const userData = await userRes.json();
    console.log("Step 3 - User info response:", userData);

    if (!userData.username) {
      throw new Error(`Failed to get user info: ${JSON.stringify(userData)}`);
    }

    // Step 4: Save to config
    console.log("Step 4 - Starting to save config...");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    console.log("Step 4 - Inserting:", {
      instagram_username: userData.username,
      instagram_user_id: userId,
    });

    const { error } = await supabase.from("config").insert({
      instagram_token: accessToken,
      instagram_user_id: userId,
      instagram_username: userData.username,
      profile_picture_url: userData.profile_picture_url,
      token_expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.log("Step 4 - ERROR:", JSON.stringify(error, null, 2));
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
    console.log("Step 4 - Config saved successfully");

    // Step 5: Subscribe to webhooks
    const webhookRes = await fetch(`https://graph.instagram.com/v25.0/${userId}/subscribed_apps`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        subscribed_fields: "comments,messages",
        access_token: accessToken,
      }).toString(),
    });
    const webhookData = await webhookRes.json();
    console.log("Step 5 - Webhook subscription:", webhookData);

    console.log("✅ OAuth flow completed successfully!");
    return NextResponse.redirect(`${APP_URL}/dashboard?success=connected`);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${APP_URL}/dashboard?error=auth_failed`);
  }
}
