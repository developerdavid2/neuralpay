export function otpTemplate({
  otp,
  type,
  expiresInMinutes = 5,
}: {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"; // 👈 add here
  expiresInMinutes?: number;
}) {
  const titles: Record<string, string> = {
    "email-verification": "Verify your email address",
    "sign-in": "Your sign-in code",
    "forget-password": "Reset your password",
    "change-email": "Confirm your email change",
  };

  const messages: Record<string, string> = {
    "email-verification": "Use the code below to verify your email address.",
    "sign-in": "Use the code below to sign in to your account.",
    "forget-password": "Use the code below to reset your password.",
    "change-email": "Use the code below to confirm your email change.",
  };

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titles[type]}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">NeuralPay</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Intelligent Payment Infrastructure</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">${titles[type]}</h2>
                <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">${messages[type]}</p>

                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#f9fafb;border:2px dashed #e5e7eb;border-radius:10px;padding:28px;">
                      <p style="margin:0 0 8px;color:#6b7280;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Your one-time code</p>
                      <p style="margin:0;color:#111827;font-size:40px;font-weight:700;letter-spacing:10px;">${otp}</p>
                    </td>
                  </tr>
                </table>

                <!-- Expiry notice -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                  <tr>
                    <td style="background-color:#fef3c7;border-radius:8px;padding:12px 16px;">
                      <p style="margin:0;color:#92400e;font-size:13px;">
                        ⏱ This code expires in <strong>${expiresInMinutes} minutes</strong>. Do not share it with anyone.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:32px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                  If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">
                  © ${new Date().getFullYear()} NeuralPay. All rights reserved.
                </p>
                <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                  This is an automated message, please do not reply.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

export function resetPasswordTemplate({ url }: { url: string }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">NeuralPay</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Intelligent Payment Infrastructure</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">Reset your password</h2>
                <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                  We received a request to reset your NeuralPay password. Click the button below to choose a new one.
                </p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;color:#6b7280;font-size:13px;text-align:center;">
                  Or copy this link into your browser:
                </p>
                <p style="margin:8px 0 0;color:#6366f1;font-size:12px;text-align:center;word-break:break-all;">${url}</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  <tr>
                    <td style="background-color:#fef3c7;border-radius:8px;padding:12px 16px;">
                      <p style="margin:0;color:#92400e;font-size:13px;">
                        ⏱ This link expires in <strong>1 hour</strong>. If you didn't request a reset, ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} NeuralPay. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
