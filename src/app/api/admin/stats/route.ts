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
    const [waitlistCount, customerCount, communicationCount] = await Promise.all(
      [
        supabaseServer
          .from("waitlist_subscribers")
          .select("id", { count: "exact", head: true }),
        supabaseServer
          .from("customers")
          .select("id", { count: "exact", head: true }),
        supabaseServer
          .from("communications")
          .select("id", { count: "exact", head: true }),
      ]
    );

    return NextResponse.json(
      {
        stats: {
          waitlistCount: waitlistCount.count || 0,
          customerCount: customerCount.count || 0,
          communicationCount: communicationCount.count || 0,
        },
      },
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
