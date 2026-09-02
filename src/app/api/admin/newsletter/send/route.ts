import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendNewsletterEmail } from "@/lib/email";
import { verifyAdminToken, getAdminTokenFromHeaders } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromHeaders(request.headers);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = verifyAdminToken(token);
  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { subject, htmlContent, plainTextContent, recipientGroup } =
      await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    let recipients: string[] = [];

    if (recipientGroup === "waitlist") {
      const { data, error } = await supabaseServer()
        .from("waitlist_subscribers")
        .select("email")
        .eq("status", "pending");

      if (error) throw error;
      recipients = (data || []).map((r: { email: string }) => r.email);
    } else if (recipientGroup === "customers") {
      const { data, error } = await supabaseServer()
        .from("customers")
        .select("email")
        .eq("status", "active");

      if (error) throw error;
      recipients = (data || []).map((r: { email: string }) => r.email);
    } else if (recipientGroup === "all") {
      const { data: waitlist, error: wError } = await supabaseServer()
        .from("waitlist_subscribers")
        .select("email");

      const { data: customers, error: cError } = await supabaseServer()
        .from("customers")
        .select("email");

      if (wError || cError) throw wError || cError;
      recipients = [
        ...(waitlist || []).map((r: { email: string }) => r.email),
        ...(customers || []).map((r: { email: string }) => r.email),
      ];
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for the selected group" },
        { status: 400 }
      );
    }

    const result = await sendNewsletterEmail(
      recipients,
      subject,
      htmlContent,
      plainTextContent
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send newsletter" },
        { status: 500 }
      );
    }

    const { error: logError } = await supabaseServer()
      .from("communications")
      .insert({
        subject,
        body: plainTextContent || htmlContent,
        type: "email",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (logError) console.error("Failed to log communication:", logError);

    return NextResponse.json(
      {
        success: true,
        message: `Newsletter sent to ${result.sent} recipients`,
        stats: { sent: result.sent, failed: result.failed },
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
