import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { verifyAdminToken, getAdminTokenFromHeaders } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = getAdminTokenFromHeaders(request.headers);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = verifyAdminToken(token);
  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data: communications, error } = await supabaseServer()
      .from("communications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch communications" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { communications, count: communications?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
