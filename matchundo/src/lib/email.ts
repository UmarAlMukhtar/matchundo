import { Resend } from "resend";
import { Screening } from "./db";

import { APP_URL } from "./config";

const resendApiKey = process.env.RESEND_API_KEY;
// Initialize Resend client if key is provided, otherwise log warning
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = "MatchUndo <noreply@matchundo.demosnap.tech>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@matchundo.demosnap.tech";

const getBaseUrl = () => {
  return APP_URL;
};

/**
 * Sends a notification email to the administrator when a new public submission is created.
 */
export async function sendAdminNotification(screening: Screening): Promise<boolean> {
  if (!resend) {
    console.warn("[Email Service] Resend is not configured (missing RESEND_API_KEY). Skipped sending admin notification.");
    return false;
  }

  try {
    const adminLink = `${getBaseUrl()}/admin/submissions?tab=pending`;
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: "New MatchUndo Submission",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1c1917; line-height: 1.5;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">New Watch Screening Submitted</h2>
          <p>A new match screening has been submitted by the community and is waiting for review.</p>
          <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c; width: 120px;">Match Name:</td>
              <td style="padding: 6px 0;">${screening.match_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c;">Venue:</td>
              <td style="padding: 6px 0;">${screening.venue_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c;">City:</td>
              <td style="padding: 6px 0;">${screening.city}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c;">Submitter Name:</td>
              <td style="padding: 6px 0;">${screening.submitted_by_name || "Anonymous"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c;">Submitter Email:</td>
              <td style="padding: 6px 0;">${screening.submitted_by_email || "N/A"}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <div style="margin-top: 24px;">
            <a href="${adminLink}" style="background-color: #18181b; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block;">
              Review Submission
            </a>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("[Email Service] Resend error sending admin notification:", error);
      return false;
    }

    console.log("[Email Service] Admin notification sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send admin notification email:", error);
    return false;
  }
}

/**
 * Sends a notification email to the submitter when their submission is approved.
 */
export async function sendApprovalNotification(
  toEmail: string,
  matchName: string,
  venueName: string,
  screeningId: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email Service] Resend is not configured. Skipped sending approval notification.");
    return false;
  }

  try {
    const publicUrl = `${getBaseUrl()}/screenings/${screeningId}`;
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Your MatchUndo listing has been approved",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1c1917; line-height: 1.5;">
          <h2 style="font-size: 16px; font-weight: bold; color: #15803d; margin-bottom: 16px;">Listing Approved!</h2>
          <p>Hi there,</p>
          <p>Great news! Your watch screening submission has been reviewed and approved by our moderation team. It is now live on MatchUndo.</p>
          <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c; width: 120px;">Match Name:</td>
              <td style="padding: 6px 0;">${matchName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #78716c;">Venue:</td>
              <td style="padding: 6px 0;">${venueName}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <div style="margin-top: 24px;">
            <a href="${publicUrl}" style="background-color: #15803d; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block;">
              View Live Listing
            </a>
          </div>
          <p style="font-size: 11px; color: #78716c; margin-top: 32px;">
            If you did not submit this watch party, you can ignore this email.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("[Email Service] Resend error sending approval email:", error);
      return false;
    }

    console.log("[Email Service] Approval notification sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send approval email:", error);
    return false;
  }
}

/**
 * Sends a notification email to the submitter when their submission is rejected.
 */
export async function sendRejectionNotification(
  toEmail: string,
  matchName: string,
  venueName: string,
  explanation?: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email Service] Resend is not configured. Skipped sending rejection notification.");
    return false;
  }

  try {
    const reasonText = explanation ? explanation : "The details provided did not meet our community standards or formatting guidelines.";
    const submitUrl = `${getBaseUrl()}/submit`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Update on your MatchUndo submission",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1c1917; line-height: 1.5;">
          <h2 style="font-size: 16px; font-weight: bold; color: #b91c1c; margin-bottom: 16px;">Submission Update</h2>
          <p>Hi there,</p>
          <p>Thank you for submitting your watch party schedule to MatchUndo. Our moderation team has reviewed the listing for <strong>${matchName}</strong> at <strong>${venueName}</strong>.</p>
          <p>Unfortunately, we are unable to publish this listing at this time for the following reason:</p>
          <blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 4px solid #b91c1c; background-color: #fef2f2; color: #991b1b; font-size: 13px; border-radius: 0 6px 6px 0;">
            ${reasonText}
          </blockquote>
          <p>You are welcome to submit the watch party again with corrected information or complete details.</p>
          <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <div style="margin-top: 24px;">
            <a href="${submitUrl}" style="background-color: #18181b; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block;">
              Submit Another Watch Party
            </a>
          </div>
          <p style="font-size: 11px; color: #78716c; margin-top: 32px;">
            Thank you for being part of the MatchUndo community.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("[Email Service] Resend error sending rejection email:", error);
      return false;
    }

    console.log("[Email Service] Rejection notification sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send rejection email:", error);
    return false;
  }
}
