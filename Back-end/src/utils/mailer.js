import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"E-2 Market" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Mail send error:", err.message);
  }
};

export const sendOTPEmail = async (to, otp, purpose = "verification") => {
  const subject = `E-2 Market - Your OTP for ${purpose}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
      <h2 style="color:#a855f7;text-align:center;margin-bottom:8px;">E-2 Market</h2>
      <p style="text-align:center;color:#94a3b8;margin-bottom:24px;">Your OTP for ${purpose}</p>
      <div style="background:#1e293b;border:1px solid #7c3aed;border-radius:8px;padding:24px;text-align:center;">
        <p style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#c084fc;margin:0;">${otp}</p>
      </div>
      <p style="color:#64748b;font-size:13px;margin-top:20px;text-align:center;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  await sendMail({ to, subject, html });
};

export const sendOrderConfirmationEmail = async (to, { productTitle, quantity, totalPrice, otp, orderId }) => {
  const subject = "E-2 Market - Order Placed Successfully";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
      <h2 style="color:#a855f7;text-align:center;">Order Confirmation</h2>
      <p style="text-align:center;color:#94a3b8;">Your order has been placed successfully.</p>
      <div style="background:#1e293b;border:1px solid #7c3aed;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Product:</strong> ${productTitle}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Quantity:</strong> ${quantity}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Total:</strong> Rs.${totalPrice}</p>
      </div>
      <div style="background:#1e293b;border:2px solid #7c3aed;border-radius:8px;padding:20px;text-align:center;">
        <p style="color:#94a3b8;margin-bottom:8px;">Delivery Confirmation OTP</p>
        <p style="color:#64748b;font-size:12px;margin-bottom:12px;">Share this OTP with the seller upon delivery to confirm receipt.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#c084fc;margin:0;">${otp}</p>
      </div>
      <p style="color:#64748b;font-size:12px;margin-top:16px;text-align:center;">Keep this OTP safe. Do not share it until you receive your product.</p>
    </div>
  `;
  await sendMail({ to, subject, html });
};

export const sendSellerNotificationEmail = async (to, { productTitle, quantity, buyerName, buyerPhone, deliveryAddress }) => {
  const subject = "E-2 Market - New Order Received";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
      <h2 style="color:#a855f7;text-align:center;">New Order Received</h2>
      <p style="text-align:center;color:#94a3b8;">A buyer has placed an order for your product.</p>
      <div style="background:#1e293b;border:1px solid #7c3aed;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Product:</strong> ${productTitle}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Quantity Ordered:</strong> ${quantity}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Buyer Name:</strong> ${buyerName}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Buyer Phone:</strong> ${buyerPhone}</p>
        <p style="margin:4px 0;"><strong style="color:#c084fc;">Delivery Address:</strong> ${deliveryAddress}</p>
      </div>
      <p style="color:#94a3b8;text-align:center;">Log in to your seller dashboard to manage this order.</p>
    </div>
  `;
  await sendMail({ to, subject, html });
};

export const sendForgotPasswordEmail = async (to, otp) => {
  await sendOTPEmail(to, otp, "password reset");
};
