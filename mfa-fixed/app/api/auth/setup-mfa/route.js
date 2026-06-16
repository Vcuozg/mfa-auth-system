import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// [FIX 4] Mã hóa / giải mã mfa_secret bằng AES-256-GCM
const ENCRYPTION_KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY || "", "hex");

export function encryptSecret(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

export async function POST(req) {
  try {
    // [FIX 5] Yêu cầu JWT để setup MFA — không cho phép ai cũng setup được
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) token = req.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    if (user.mfa_enabled && user.mfa_secret) {
      return Response.json(
        { message: "MFA is already enabled. Please use Verify OTP." },
        { status: 400 }
      );
    }

    const secret = speakeasy.generateSecret({ name: `MFA-System (${user.email})` });

    // [FIX 4] Lưu secret đã mã hóa thay vì plaintext
    const encryptedSecret = encryptSecret(secret.base32);

    await prisma.user.update({
      where: { id: user.id },
      data: { mfa_secret: encryptedSecret, mfa_enabled: false },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return Response.json({
      message: "QR Code generated successfully",
      qrCode,
      // Không trả secret.base32 ra client nữa để tránh lộ
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
