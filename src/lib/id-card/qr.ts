import "server-only";
import QRCode from "qrcode";

/**
 * QR code as an inline SVG string, rendered on the server (the `/id` page
 * is statically generated), so no QR library ships to the client (master
 * plan Section 8.2).
 */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#282830", light: "#ffffff" },
  });
}
