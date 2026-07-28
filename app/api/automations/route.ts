import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("automations")
      .select("id, name, active, keywords, match_type, triggers")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching automations:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase.from("automations").insert(body).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
