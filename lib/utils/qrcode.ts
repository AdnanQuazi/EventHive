import QRCode from "qrcode";

/**
 * Generate a QR code data URL for a registration token
 */
export async function generateQRCode(registrationToken: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkInUrl = `${baseUrl}/check-in/${registrationToken}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate a QR code as a buffer (for backend use)
 */
export async function generateQRCodeBuffer(
  registrationToken: string
): Promise<Buffer> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkInUrl = `${baseUrl}/check-in/${registrationToken}`;

    const buffer = await QRCode.toBuffer(checkInUrl, {
      width: 300,
      margin: 2,
    });

    return buffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Get the check-in URL for a registration token
 */
export function getCheckInUrl(registrationToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/check-in/${registrationToken}`;
}
