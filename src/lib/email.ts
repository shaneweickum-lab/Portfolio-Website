import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@example.com";

function getResend(): Resend {
  if (!resendApiKey) {
    throw new Error(
      "Missing Resend API key. Please set RESEND_API_KEY in .env.local"
    );
  }
  return new Resend(resendApiKey);
}

export async function sendWaitlistWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to the W.P. Solutions Waitlist",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
          <h2>Welcome to the Waitlist</h2>
          <p>Hi ${name},</p>
          <p>Thanks for joining the waitlist for custom AI solutions sized specifically for your business.</p>
          <p>We're building the foundation for something that doesn't exist yet: AI systems that are sized appropriately for the actual problem they're solving, not oversized just because a bigger option exists.</p>
          <p>We'll reach out when we're ready to onboard the first customers. In the meantime, feel free to explore our consulting services.</p>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            Best,<br>
            Shane & W.P. Solutions
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendNewsletterEmail(
  recipients: string[],
  subject: string,
  htmlContent: string,
  plainTextContent?: string
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  try {
    const resend = getResend();
    let sent = 0;
    let failed = 0;

    for (const email of recipients) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
          text: plainTextContent,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return { success: failed === 0, sent, failed };
  } catch (error) {
    console.error("Failed to send newsletter:", error);
    return {
      success: false,
      sent: 0,
      failed: recipients.length,
      error:
        error instanceof Error ? error.message : "Failed to send newsletter",
    };
  }
}

export async function sendCustomEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const resend = getResend();
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
