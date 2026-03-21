import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { mailTemplate } from "@/utils/mailTemplate";

export async function POST(req: Request) {
  try {
    const { name, email, organization, service, message, captchaToken } =
      await req.json();

    if (!name || !email || !message || !captchaToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const formData = new URLSearchParams();
    formData.append(
      "secret",
      process.env.NEXT_SECRET_GOOGLE_RECAPTCHA_SECRET_KEY || "",
    );
    formData.append("response", captchaToken);

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      },
    );

    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      return NextResponse.json(
        { error: "Invalid captcha", details: verifyJson },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_MAIL_USERNAME as string,
        pass: process.env.MAIL_PASSWORD as string,
      },
    });

    const mailOptions = {
      from: `"Volunote" <${process.env.NEXT_PUBLIC_MAIL_USERNAME}>`,
      to: process.env.NEXT_PUBLIC_MAIL_TO as string,
      subject: `New Contact from ${name}`,
      html: mailTemplate(name, email, organization, service, message),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: unknown) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
