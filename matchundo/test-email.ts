/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("DEBUG DATABASE_URL in test script:", process.env.DATABASE_URL);

process.env.IS_TESTING = "true";

import { Resend } from "resend";

// 1. Mock Resend client before importing server actions or dependencies
process.env.RESEND_API_KEY = "re_mock_key_12345";
process.env.ADMIN_EMAIL = "admin@matchundo.com";
process.env.NEXT_PUBLIC_APP_URL = "https://matchundo.com";
process.env.NEXT_PUBLIC_BASE_URL = "https://matchundo.com";

let sentEmails: any[] = [];
let mockEmailFailure = false;

Object.defineProperty(Resend.prototype, "emails", {
  get() {
    return {
      send: async (options: any) => {
        if (mockEmailFailure) {
          throw new Error("Simulated Resend API failure");
        }
        sentEmails.push(options);
        return { data: { id: "mock-id-" + Math.random() }, error: null };
      }
    };
  },
  set(val) {
    // Prevent the constructor from overriding the prototype property
  },
  configurable: true,
  enumerable: true
});

async function runTests() {
  // Dynamically import dependencies so they execute AFTER process.env is configured
  const { submitScreeningAction, approveScreeningAction, rejectScreeningAction } = await import("./src/app/actions");
  const { prisma } = await import("./src/lib/prisma");

  console.log("=== STARTING EMAIL NOTIFICATION INTEGRATION TESTS ===");
  const testIds: string[] = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Submission sends admin email & approval sends submitter email (notifyByEmail: true)
    // ----------------------------------------------------
    console.log("\n[Test 1] Testing submission + approval with notifyByEmail = true");
    sentEmails = [];
    mockEmailFailure = false;

    const submissionResult = await submitScreeningAction({
      match_name: "Test Match 1",
      venue_name: "Test Venue 1",
      city: "Kochi",
      address: "Test Address 1",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 1",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test1",
      submitted_by_name: "Submitter 1",
      submitted_by_email: "submitter1@example.com",
      sport: "Football",
      competition: "Test League",
      notify_by_email: true
    });

    if (!submissionResult.success || !submissionResult.screening) {
      throw new Error("Failed to submit screening in Test 1: " + submissionResult.error);
    }

    const screeningId1 = submissionResult.screening.id;
    testIds.push(screeningId1);

    // Verify submission triggered admin email
    if (sentEmails.length !== 1) {
      throw new Error(`Expected 1 admin email sent, got ${sentEmails.length}`);
    }
    const adminEmail = sentEmails[0];
    if (adminEmail.to !== "admin@matchundo.com" || adminEmail.subject !== "New MatchUndo Submission") {
      throw new Error(`Admin email mismatch: to=${adminEmail.to}, subject=${adminEmail.subject}`);
    }
    if (!adminEmail.html.includes("Test Match 1") || !adminEmail.html.includes("Submitter 1")) {
      throw new Error("Admin email HTML missing match or submitter details");
    }
    console.log("✓ Submission admin email sent correctly.");

    // Now approve it
    sentEmails = []; // Reset email array
    const approvalResult = await approveScreeningAction(screeningId1);
    if (!approvalResult.success) {
      throw new Error("Failed to approve screening in Test 1: " + approvalResult.error);
    }

    // Verify submitter received approval email
    if (sentEmails.length !== 1) {
      throw new Error(`Expected 1 approval email sent, got ${sentEmails.length}`);
    }
    const approvalEmail = sentEmails[0];
    if (approvalEmail.to !== "submitter1@example.com" || approvalEmail.subject !== "Your MatchUndo listing has been approved") {
      throw new Error(`Approval email mismatch: to=${approvalEmail.to}, subject=${approvalEmail.subject}`);
    }
    if (!approvalEmail.html.includes("Test Match 1") || !approvalEmail.html.includes("Test Venue 1")) {
      throw new Error("Approval email HTML missing match or venue details");
    }
    console.log("✓ Approval submitter email sent correctly.");

    // ----------------------------------------------------
    // TEST 2: Rejection sends submitter email (notifyByEmail: true)
    // ----------------------------------------------------
    console.log("\n[Test 2] Testing submission + rejection with notifyByEmail = true");
    sentEmails = [];
    const submissionResult2 = await submitScreeningAction({
      match_name: "Test Match 2",
      venue_name: "Test Venue 2",
      city: "Kochi",
      address: "Test Address 2",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 2",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test2",
      submitted_by_name: "Submitter 2",
      submitted_by_email: "submitter2@example.com",
      sport: "Football",
      competition: "Test League",
      notify_by_email: true
    });

    if (!submissionResult2.success || !submissionResult2.screening) {
      throw new Error("Failed to submit screening in Test 2");
    }

    const screeningId2 = submissionResult2.screening.id;
    testIds.push(screeningId2);
    sentEmails = []; // Reset admin email

    const rejectionResult = await rejectScreeningAction(screeningId2, "Incomplete details provided");
    if (!rejectionResult.success) {
      throw new Error("Failed to reject screening in Test 2: " + rejectionResult.error);
    }

    // Verify submitter received rejection email
    if (sentEmails.length !== 1) {
      throw new Error(`Expected 1 rejection email sent, got ${sentEmails.length}`);
    }
    const rejectionEmail = sentEmails[0];
    if (rejectionEmail.to !== "submitter2@example.com" || rejectionEmail.subject !== "Update on your MatchUndo submission") {
      throw new Error(`Rejection email mismatch: to=${rejectionEmail.to}, subject=${rejectionEmail.subject}`);
    }
    if (!rejectionEmail.html.includes("Test Match 2") || !rejectionEmail.html.includes("Incomplete details provided")) {
      throw new Error("Rejection email HTML missing details or notes");
    }
    console.log("✓ Rejection submitter email sent correctly.");

    // ----------------------------------------------------
    // TEST 3: Disabled notifications prevent user emails (notifyByEmail: false)
    // ----------------------------------------------------
    console.log("\n[Test 3] Testing submission + review with notifyByEmail = false");
    sentEmails = [];
    const submissionResult3 = await submitScreeningAction({
      match_name: "Test Match 3",
      venue_name: "Test Venue 3",
      city: "Kochi",
      address: "Test Address 3",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 3",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test3",
      submitted_by_name: "Submitter 3",
      submitted_by_email: "submitter3@example.com",
      sport: "Football",
      competition: "Test League",
      notify_by_email: false
    });

    if (!submissionResult3.success || !submissionResult3.screening) {
      throw new Error("Failed to submit screening in Test 3");
    }

    const screeningId3 = submissionResult3.screening.id;
    testIds.push(screeningId3);

    // Verify admin email is still sent on submission
    if (sentEmails.length !== 1) {
      throw new Error(`Expected admin email, got ${sentEmails.length}`);
    }
    console.log("✓ Submission admin email sent correctly even when user opt-out.");

    // Approve the screening
    sentEmails = [];
    const approvalResult3 = await approveScreeningAction(screeningId3);
    if (!approvalResult3.success) {
      throw new Error("Failed to approve screening in Test 3");
    }
    // Verify no approval email sent to user
    if (sentEmails.length !== 0) {
      throw new Error(`Expected 0 approval emails to be sent, got ${sentEmails.length}`);
    }
    console.log("✓ Approval email blocked correctly due to notify_by_email = false.");

    // ----------------------------------------------------
    // TEST 3a: Notifications OFF + no email -> Submission succeeds
    // ----------------------------------------------------
    console.log("\n[Test 3a] Testing submission with notifyByEmail = false and no email");
    sentEmails = [];
    const submissionResult3a = await submitScreeningAction({
      match_name: "Test Match 3a",
      venue_name: "Test Venue 3a",
      city: "Kochi",
      address: "Test Address 3a",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 3a",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test3a",
      submitted_by_name: "Submitter 3a",
      submitted_by_email: "",
      sport: "Football",
      competition: "Test League",
      notify_by_email: false
    });

    if (!submissionResult3a.success || !submissionResult3a.screening) {
      throw new Error("Failed to submit screening in Test 3a: " + submissionResult3a.error);
    }
    testIds.push(submissionResult3a.screening.id);
    console.log("✓ Submission succeeded with notifications OFF and no email.");

    // ----------------------------------------------------
    // TEST 3b: Notifications ON + no email -> Submission fails (validation)
    // ----------------------------------------------------
    console.log("\n[Test 3b] Testing submission with notifyByEmail = true and no email");
    const submissionResult3b = await submitScreeningAction({
      match_name: "Test Match 3b",
      venue_name: "Test Venue 3b",
      city: "Kochi",
      address: "Test Address 3b",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 3b",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test3b",
      submitted_by_name: "Submitter 3b",
      submitted_by_email: "",
      sport: "Football",
      competition: "Test League",
      notify_by_email: true
    });

    if (submissionResult3b.success) {
      if (submissionResult3b.screening) testIds.push(submissionResult3b.screening.id);
      throw new Error("Expected submission to fail when notifications are ON and no email is provided, but it succeeded.");
    }
    
    if (submissionResult3b.error !== "Email is required if review notifications are enabled.") {
      throw new Error("Expected error 'Email is required if review notifications are enabled.', got: " + submissionResult3b.error);
    }
    console.log("✓ Submission correctly blocked and returned validation error.");

    // ----------------------------------------------------
    // TEST 4: Reliability check (Email failures must not block DB writes)
    // ----------------------------------------------------
    console.log("\n[Test 4] Testing reliability: Email failures must not block core flows");
    sentEmails = [];
    mockEmailFailure = true; // Turn on email simulation failure

    // 1. Submit screening should succeed even if admin notification fails
    const submissionResult4 = await submitScreeningAction({
      match_name: "Test Match 4",
      venue_name: "Test Venue 4",
      city: "Kochi",
      address: "Test Address 4",
      screening_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "Test description 4",
      poster_image_url: "",
      google_maps_link: "https://maps.google.com/test4",
      submitted_by_name: "Submitter 4",
      submitted_by_email: "submitter4@example.com",
      sport: "Football",
      competition: "Test League",
      notify_by_email: true
    });

    if (!submissionResult4.success || !submissionResult4.screening) {
      throw new Error("Submission failed when email sending failed!");
    }
    const screeningId4 = submissionResult4.screening.id;
    testIds.push(screeningId4);
    console.log("✓ Submission succeeded during email dispatch failure.");

    // 2. Approve screening should succeed even if approval email fails
    const approvalResult4 = await approveScreeningAction(screeningId4);
    if (!approvalResult4.success) {
      throw new Error("Approval failed when email sending failed!");
    }
    console.log("✓ Approval succeeded during email dispatch failure.");

    // Verify in database that it was indeed approved
    const screeningInDb = await prisma.screening.findUnique({
      where: { id: screeningId4 }
    });
    if (screeningInDb?.status !== "approved") {
      throw new Error("Expected screening status to be 'approved' in database");
    }
    console.log("✓ Status was successfully updated to 'approved' in database.");

    console.log("\n=== ALL EMAIL NOTIFICATION TESTS PASSED SUCCESSFULLY ===");

  } catch (err: any) {
    console.error("\n❌ TEST FAILURE:", err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup test data from DB
    console.log("\nCleaning up test data from DB...");
    if (testIds.length > 0) {
      try {
        await prisma.moderationEvent.deleteMany({
          where: { screeningId: { in: testIds } }
        });
        await prisma.report.deleteMany({
          where: { screeningId: { in: testIds } }
        });
        await prisma.screening.deleteMany({
          where: { id: { in: testIds } }
        });
        console.log("✓ Cleaned up screenings:", testIds);
      } catch (err) {
        console.error("Failed to clean up test screenings from database:", err);
      }
    }
    await prisma.$disconnect();
    console.log("Done.");
  }
}

runTests();
