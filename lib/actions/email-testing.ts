"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendTestEmail, sendRegistrationEmail } from "@/lib/services/email";

/**
 * Test endpoint to verify email configuration is working
 * 
 * Usage in development:
 * 1. Add a button in your UI that calls this action
 * 2. Or use it in your test suite
 * 
 * Example usage:
 * const result = await testEmailConfiguration("your-email@example.com");
 */
export async function testEmailConfiguration(testEmailAddress: string) {
  try {
    console.log("Testing email configuration...");

    // Check environment variables
    const hasEmailConfig =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_SERVICE;

    if (!hasEmailConfig) {
      return {
        success: false,
        error: "Missing email environment variables. Check .env.local",
        missingVars: {
          EMAIL_USER: !process.env.EMAIL_USER,
          EMAIL_PASSWORD: !process.env.EMAIL_PASSWORD,
          EMAIL_SERVICE: !process.env.EMAIL_SERVICE,
        },
      };
    }

    // Send test email
    const result = await sendTestEmail(testEmailAddress);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        hint: "Check email provider settings and credentials",
      };
    }

    return {
      success: true,
      message: `Test email sent successfully to ${testEmailAddress}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Email test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a test registration email with mock data
 * Useful for testing the full registration email template
 */
export async function testRegistrationEmail(testEmailAddress: string) {
  try {
    console.log("Sending test registration email...");

    const mockEventData = {
      title: "Tech Conference 2026",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      venue: "Convention Center",
      city: "San Francisco, CA",
    };

    // Generate a mock token
    const mockToken = "test_token_" + Math.random().toString(36).substring(7);

    const result = await sendRegistrationEmail({
      attendeeEmail: testEmailAddress,
      attendeeName: "Test Attendee",
      eventTitle: mockEventData.title,
      eventDate: mockEventData.startDate,
      eventVenue: `${mockEventData.venue}, ${mockEventData.city}`,
      registrationToken: mockToken,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        hint: "Check QR code generation and email configuration",
      };
    }

    return {
      success: true,
      message: `Test registration email sent successfully to ${testEmailAddress}`,
      testData: {
        eventTitle: mockEventData.title,
        eventDate: mockEventData.startDate,
        token: mockToken,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Registration email test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
