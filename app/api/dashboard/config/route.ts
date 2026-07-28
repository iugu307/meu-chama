import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("config")
      .select("id, instagram_username, profile_picture_url, token_expires_at")
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(null);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
