
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import { getFromEmail, getStoreName } from "../utils/storeConfig.js";

// ── Subscribe ──────────────────────────────────────────────
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Please provide a valid email address.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if already subscribed
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (existing.isActive) {
      return res
        .status(200)
        .json(new ApiResponsive(200, null, "You are already subscribed to our newsletter!"));
    }
    // Re-activate if previously unsubscribed
    await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { isActive: true, name: name?.trim() || existing.name },
    });

    return res
      .status(200)
      .json(new ApiResponsive(200, null, "Welcome back! You have been re-subscribed."));
  }

  // Save new subscriber
  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email: normalizedEmail,
      name: name?.trim() || null,
      source: "website",
    },
  });

  // Send emails concurrently (don't await so response is fast)
  Promise.allSettled([
    sendThankYouEmail(normalizedEmail, name),
    sendAdminNotification(normalizedEmail, name),
  ]).catch((err) => console.error("Newsletter email error:", err));

  return res
    .status(201)
    .json(new ApiResponsive(201, { id: subscriber.id }, "Thank you for subscribing!"));
});

// ── Unsubscribe ────────────────────────────────────────────
export const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required.");

  const normalizedEmail = email.trim().toLowerCase();

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (!subscriber) {
    throw new ApiError(404, "This email is not subscribed.");
  }

  await prisma.newsletterSubscriber.update({
    where: { email: normalizedEmail },
    data: { isActive: false },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, null, "You have been unsubscribed successfully."));
});

// ── Admin: Get all subscribers ─────────────────────────────
export const getAllSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, active } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (active !== undefined) where.isActive = active === "true";

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponsive(200, {
      subscribers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    }, "Subscribers fetched.")
  );
});

// ── Email helpers ──────────────────────────────────────────

async function sendThankYouEmail(email, name) {
  const storeName = getStoreName() || "Aashey";
  const displayName = name ? `, ${name.split(" ")[0]}` : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#FDF6E3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF6E3;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(63,31,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:#3F1F00;padding:36px 40px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:42px;font-style:italic;font-weight:bold;color:#C9933A;letter-spacing:4px;">AASHEY</div>
              <div style="font-size:11px;color:#FDF6E3;opacity:0.6;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Pure A2 Cow Ghee</div>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#C9933A,#F0C96B,#C9933A);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="font-family:Georgia,serif;font-size:28px;color:#3F1F00;margin:0 0 12px;">
                Welcome${displayName}! 🙏
              </h1>
              <p style="color:#5C3A1E;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Thank you for joining the <strong>Aashey community</strong>. You're now part of a family that values
                purity, tradition, and authentic nourishment.
              </p>
              <div style="background:#FDF6E3;border-left:4px solid #C9933A;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
                <p style="font-family:Georgia,serif;font-style:italic;color:#3F1F00;font-size:16px;margin:0;">
                  "Made with love, crafted with tradition — from our family's kitchen to your table."
                </p>
              </div>
              <p style="color:#5C3A1E;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Here's what to expect in your inbox:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${["✦ Exclusive seasonal offers & early access to new arrivals",
      "✦ Traditional Ayurvedic ghee recipes & wellness tips",
      "✦ Stories from our farm & production process",
      "✦ Health benefits of pure A2 Bilona Ghee"].map(item => `
                <tr>
                  <td style="padding:6px 0;color:#5C3A1E;font-size:14px;line-height:1.6;">${item}</td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${process.env.FRONTEND_URL || "https://aashey.com"}/products"
                style="display:inline-block;background:#C9933A;color:#3F1F00;font-weight:700;font-size:14px;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:1px;text-transform:uppercase;">
                Shop Pure A2 Ghee →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#3F1F00;padding:20px 40px;text-align:center;">
              <p style="color:#FDF6E3;opacity:0.5;font-size:12px;margin:0 0 6px;">
                © 2026 Aashey Consumer Products Pvt. Ltd. · FSSAI 21526073000396
              </p>
              <p style="color:#FDF6E3;opacity:0.4;font-size:11px;margin:0;">
                You received this because you subscribed at aashey.com ·
                <a href="${process.env.FRONTEND_URL || "https://aashey.com"}" style="color:#C9933A;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    email,
    subject: `Welcome to Aashey – You're in the family now! 🙏`,
    html,
  });
}

async function sendAdminNotification(subscriberEmail, subscriberName) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || getFromEmail();
  const storeName = getStoreName() || "Aashey";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Newsletter Subscriber</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#3F1F00;padding:24px 32px;">
              <div style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#C9933A;font-weight:bold;">AASHEY</div>
              <div style="font-size:12px;color:#FDF6E3;opacity:0.6;margin-top:2px;">Admin Notification</div>
            </td>
          </tr>
          <tr><td style="height:2px;background:linear-gradient(90deg,#C9933A,#F0C96B,#C9933A);"></td></tr>
          <tr>
            <td style="padding:28px 32px;">
              <h2 style="color:#3F1F00;font-size:20px;margin:0 0 16px;">🎉 New Newsletter Subscriber</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
                <tr style="background:#fafafa;">
                  <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;width:35%;">Email</td>
                  <td style="padding:12px 16px;color:#222;font-size:13px;">${subscriberEmail}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;border-top:1px solid #e5e5e5;">Name</td>
                  <td style="padding:12px 16px;color:#222;font-size:13px;border-top:1px solid #e5e5e5;">${subscriberName || "—"}</td>
                </tr>
                <tr style="background:#fafafa;">
                  <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;border-top:1px solid #e5e5e5;">Source</td>
                  <td style="padding:12px 16px;color:#222;font-size:13px;border-top:1px solid #e5e5e5;">Website – Newsletter CTA</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;border-top:1px solid #e5e5e5;">Date</td>
                  <td style="padding:12px 16px;color:#222;font-size:13px;border-top:1px solid #e5e5e5;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#3F1F00;padding:14px 32px;text-align:center;">
              <p style="color:#FDF6E3;opacity:0.5;font-size:11px;margin:0;">${storeName} · Admin Alert System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    email: adminEmail,
    subject: `[Aashey] New Newsletter Subscriber: ${subscriberEmail}`,
    html,
  });
}
