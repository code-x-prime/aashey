import { getStoreConfig } from "../../utils/storeConfig.js";

export const getVerificationTemplate = (
    verificationLink,
    storeConfig = null
) => {
    const store = storeConfig || getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button-container {
            text-align: center;
            margin: 25px 0;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background-color: #C9933A;
            color: #3F1F00 !important;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .features {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin-top: 30px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
        .feature-item {
            margin-bottom: 20px;
            padding-left: 30px;
            position: relative;
        }
        .feature-item:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #C9933A;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email</h2>
            <p>Dear Valued Customer,</p>
            <p>Welcome to ${store.storeName} - ${store.storeDescription
        }. Please verify your email address to access your account:</p>
            <div class="button-container">
                <a href="${verificationLink}" class="button">Verify Email Now</a>
            </div>
            <p>If you can't click the button, copy and paste this link in your browser: <br>${verificationLink}</p>
            <p>If you didn't create an account with ${store.storeName
        }, please disregard this email.</p>
            
            <div class="features">
                <h3>What you can do after verification:</h3>
                <div class="feature-item">Shop for pure A2 Bilona ghee</div>
                <div class="feature-item">Track your orders easily</div>
                <div class="feature-item">Receive exclusive offers and updates</div>
                <div class="feature-item">Manage your account and addresses</div>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline
        }<br>
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
`;
};

export const getEmailOtpTemplate = (
    otp,
    expiresInMinutes = 10,
    storeConfig = null
) => {
    const store = storeConfig || getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your One-Time Password (OTP) - ${store.storeName}</title>
    <style>
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; margin:0; padding:0; color:#1a1a1a; }
        .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3F1F00, #5C2E00); color: #FDF6E3; text-align: center; padding: 32px; }
        .content { padding: 32px; }
        h1 { margin: 0; font-size: 24px; font-weight: 700; }
        p { margin: 0 0 16px; font-size: 16px; color: #333; }
        .otp { font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #3F1F00; background: #FDF6E3; padding: 12px 16px; border-radius: 8px; text-align:center; display:inline-block; }
        .note { font-size: 14px; color: #666; }
        .footer { text-align:center; padding: 16px; font-size: 13px; color:#666; background:#f8f8f8; }
    </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Email Verification OTP</h1>
            </div>
            <div class="content">
                <p>Dear Valued Customer,</p>
                <p>Use the following One-Time Password (OTP) to verify your email for ${store.storeName
        }:</p>
                <p style="text-align:center; margin: 24px 0;">
                    <span class="otp">${otp}</span>
                </p>
                <p class="note">This OTP will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline
        }<br/>
                This is an automated message. Please do not reply.
            </div>
        </div>
    </body>
</html>
`;
};

export const getDeleteTemplate = (deletionLink, storeConfig = null) => {
    const store = storeConfig || getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion Request - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alternatives {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin-top: 30px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
        .alternative-item {
            margin-bottom: 20px;
            padding-left: 30px;
            position: relative;
        }
        .alternative-item:before {
            content: '➤';
            position: absolute;
            left: 0;
            color: #C9933A;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Deletion Request</h1>
        </div>
        <div class="content">
            <h2>Confirm Account Deletion</h2>
            <p>Dear Valued Customer,</p>
            <p>We've received a request to delete your ${store.storeName} account. Before proceeding, we want to ensure this is your intended action, as it will permanently remove your order history, saved addresses, and account data.</p>
            <p>If you're certain about deleting your account, please click the button below:</p>
            <a href="${deletionLink}" class="button">Confirm Account Deletion</a>
            <div class="warning">
                <strong>Warning:</strong> This action is irreversible. Once deleted, all your order history, wishlist, and personal data will be permanently removed from our systems.
            </div>
            <div class="alternatives">
                <h3>Consider these alternatives:</h3>
                <div class="alternative-item">
                    Keep your account and simply log out
                </div>
                <div class="alternative-item">
                    Update your profile or email instead
                </div>
                <div class="alternative-item">
                    Contact our support team for assistance
                </div>
            </div>
            <p>If you didn't request this deletion, please contact our support team immediately at ${store.supportEmail || store.storeEmail}.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
`;
};

export const getResetTemplate = (resetLink, storeConfig = null) => {
    const store = storeConfig || getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear Valued Customer,</p>
            <p>We received a request to reset the password for your ${store.storeName
        } account. Click the button below to create a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If you didn't request this password reset, please contact our support team immediately at ${store.supportEmail || store.storeEmail
        }</p>
            <p>This link will expire in 15 minutes for security reasons.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline
        }<br>
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
`;
};

export const getFeeReceiptTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Confirmation</h1>
        </div>
        <div class="content">
            <h2>Payment Receipt</h2>
            <p>Dear ${data.userName},</p>
            <p>Thank you for your payment. Your transaction was successful.</p>
            <div class="payment-details">
                <p><strong>Amount Paid:</strong> ₹${data.amount}</p>
                <p><strong>Payment ID:</strong> ${data.paymentId}</p>
                <p><strong>Date:</strong> ${new Date(
    data.date
).toLocaleDateString()}</p>
            </div>
            <p>Please find your receipt attached to this email. We look forward to serving you.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            This is an automated message. Please do not reply.
        </div>
    </div>
</body>
</html>
`;
};

export const getFeeNotificationTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Fee Assignment - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 30px;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 30px;
        }
        .fee-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .fee-item {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .important {
            color: #5C2E00;
            font-weight: bold;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f8f8;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Fee Assignment</h1>
        </div>
        <div class="content">
            <h2>Fee Details</h2>
            <div class="fee-details">
                <div class="fee-item">
                    <strong>Title:</strong>
                    <span>${data.title}</span>
                </div>
                <div class="fee-item">
                    <strong>Amount:</strong>
                    <span class="important">₹${data.amount}</span>
                </div>
                <div class="fee-item">
                    <strong>Due Date:</strong>
                    <span class="important">${new Date(
    data.dueDate
).toLocaleDateString()}</span>
                </div>
                ${data.description
        ? `
                <div class="fee-item">
                    <strong>Description:</strong>
                    <span>${data.description}</span>
                </div>
                `
        : ""
    }
                ${data.lateFeeDate
        ? `
                <div class="fee-item">
                    <strong>Late Fee After:</strong>
                    <span class="important">${new Date(
            data.lateFeeDate
        ).toLocaleDateString()}</span>
                </div>
                `
        : ""
    }
                ${data.lateFeeAmount
        ? `
                <div class="fee-item">
                    <strong>Late Fee Amount:</strong>
                    <span class="important">₹${data.lateFeeAmount}</span>
                </div>
                `
        : ""
    }
            </div>
            <p>Please ensure timely payment.</p>
            <a href="${process.env.FRONTEND_URL
    }/dashboard/fees" class="btn">View Fee Details</a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getPaymentSuccessTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px;
        }
        .payment-details {
            background-color: #FDF6E3;
            border: 1px solid #C9933A;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #C9933A;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .amount {
            font-size: 24px;
            color: #5C2E00;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f8f8;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Payment Successful!</h1>
        </div>
        <div class="content">
            <p>Dear ${data.userName},</p>
            <p>Your payment has been successfully processed. Here are your transaction details:</p>
            
            <div class="payment-details">
                <div class="detail-row">
                    <strong>Amount Paid:</strong>
                    <span class="amount">₹${data.amount}</span>
                </div>
                <div class="detail-row">
                    <strong>Receipt Number:</strong>
                    <span>${data.receiptNumber}</span>
                </div>
                <div class="detail-row">
                    <strong>Payment ID:</strong>
                    <span>${data.paymentId}</span>
                </div>
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>${new Date(data.date).toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
})}</span>
                </div>
                <div class="detail-row">
                    <strong>Fee Type:</strong>
                    <span>${data.feeTitle}</span>
                </div>
            </div>

            <p>Your payment receipt has been attached to this email for your records.</p>
            <p>Thank you for your payment! We look forward to serving you.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}</p>
            <p>For any queries, contact us at ${store.supportEmail || store.storeEmail}</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getPaymentFailureTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: #ffffff;
            text-align: center;
            padding: 40px;
        }
        .failed-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px;
        }
        .error-box {
            background-color: #fef2f2;
            border: 1px solid #fee2e2;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .retry-button {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f8f8;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="failed-icon">✕</div>
            <h1>Payment Failed</h1>
        </div>
        <div class="content">
            <p>Dear ${data.userName},</p>
            <p>We're sorry, but your recent payment attempt was unsuccessful.</p>
            
            <div class="error-box">
                <h3>Transaction Details:</h3>
                <p><strong>Amount:</strong> ₹${data.amount}</p>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleString(
    "en-IN"
)}</p>
                <p><strong>Fee Type:</strong> ${data.feeTitle}</p>
                <p><strong>Error:</strong> ${data.error || "Transaction could not be completed"
    }</p>
            </div>

            <p>Possible reasons for payment failure:</p>
            <ul>
                <li>Insufficient funds in your account</li>
                <li>Bank server issues</li>
                <li>Network connectivity problems</li>
                <li>Transaction timeout</li>
            </ul>

            <p>Please try again or contact your bank if the issue persists.</p>
            
            <a href="${process.env.FRONTEND_URL
    }/dashboard/fees" class="retry-button">
                Retry Payment
            </a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}</p>
            <p>Need help? Contact us at ${store.supportEmail || store.storeEmail}</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getFeeUpdateTemplate = ({
    name,
    feeTitle,
    oldAmount,
    newAmount,
    oldDate,
    newDate,
    reason,
}) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3F1F00, #5C2E00); color: #FDF6E3; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .amount { font-size: 18px; font-weight: bold; color: #5C2E00; }
        .details { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Fee Update Notification</h2>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>This is to inform you that there has been an update to your fee: <strong>${feeTitle}</strong></p>
            
            <div class="details">
                <h3>Update Details:</h3>
                <p><strong>Amount:</strong> ₹${oldAmount} → ₹${newAmount}</p>
                <p><strong>Due Date:</strong> ${oldDate} → ${newDate}</p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>

            <p>If you have any questions about this update, please contact our support team at ${store.supportEmail || store.storeEmail}.</p>
        </div>
        <div class="footer">
            <p>${store.storeName} | ${store.storeTagline}</p>
            <small>This is an automated message, please do not reply.</small>
        </div>
    </div>
</body>
</html>
`;
};

export const getCertificateGeneratedTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Generated - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .certificate-info {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin-top: 30px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
        .certificate-id {
            font-family: monospace;
            background: #f0f0f0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
            margin: 20px 0;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations!</h1>
        </div>
        <div class="content">
            <h2>Achievement Accomplished</h2>
            <p>Dear ${data.userName},</p>
            <p>We are delighted to inform you that you have successfully completed:</p>
            <h3 style="color: #5C2E00;">${data.courseName}</h3>
            
            <div class="certificate-info">
                <p><strong>Your certificate has been generated!</strong></p>
                <p>Certificate ID: <span class="certificate-id">${data.certificateId
    }</span></p>
                <p>You can now access and download your certificate from your profile.</p>
            </div>

            <center>
                <a href="${process.env.FRONTEND_URL
    }/user-profile" class="button">View Certificate</a>
            </center>

            <p>Thank you for your commitment. We look forward to serving you!</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
`;
};

export const getContactFormTemplate = (data) => {
    const store = getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 30px;
        }
        .content {
            padding: 30px;
        }
        h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        h2 {
            color: #1a1a1a;
            font-size: 22px;
            margin-top: 0;
        }
        .message-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .contact-details {
            margin-top: 30px;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 8px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
        .detail-row {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Inquiry</h1>
        </div>
        <div class="content">
            <h2>${data.subject || "General Inquiry"}</h2>
            
            <div class="message-box">
                <p>${data.message}</p>
            </div>
            
            <div class="contact-details">
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span>${data.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span>${data.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span>${data.phone}</span>
                </div>
            </div>
            
            <p>Please respond to this inquiry at your earliest convenience.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            This is an automated message from your website contact form.
        </div>
    </div>
</body>
</html>
`;
};

export const getOrderConfirmationTemplate = (data, storeConfig = null) => {
    const store = storeConfig || getStoreConfig();
    const hasDiscount = data.discount && parseFloat(data.discount) > 0;
    const hasCoupon = data.couponCode && data.couponCode.trim() !== "";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 30px;
        }
        .content {
            padding: 30px;
        }
        h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        h2 {
            color: #1a1a1a;
            font-size: 22px;
            margin-top: 0;
        }
        .order-details {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 8px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
        .detail-row {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        .order-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-items th {
            background-color: #3F1F00;
            color: #FDF6E3;
            padding: 12px 10px;
            text-align: left;
            font-size: 13px;
        }
        .order-items td {
            padding: 12px 10px;
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
        }
        .product-name {
            font-weight: 600;
            color: #1a1a1a;
        }
        .product-variant {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .original-price {
            text-decoration: line-through;
            color: #999;
            font-size: 12px;
        }
        .sale-price {
            color: #5C2E00;
            font-weight: 600;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .summary-row:last-child {
            border-bottom: none;
        }
        .summary-label {
            color: #666;
        }
        .summary-value {
            font-weight: 500;
        }
        .discount-row {
            color: #5C2E00;
        }
        .discount-row .summary-value {
            color: #5C2E00;
        }
        .total-row {
            font-size: 18px;
            font-weight: bold;
            padding-top: 12px;
            margin-top: 8px;
            border-top: 2px solid #333;
        }
        .total-row .summary-label {
            color: #1a1a1a;
        }
        .total-row .summary-value {
            color: #C9933A;
        }
        .coupon-badge {
            display: inline-block;
            background-color: #FDF6E3;
            color: #5C2E00;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        .savings-box {
            background: linear-gradient(135deg, #FDF6E3, #f5e6c8);
            border: 1px solid #C9933A;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        }
        .savings-text {
            color: #5C2E00;
            font-weight: 600;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin-top: 25px;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #C9933A;
            color: #3F1F00 !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Order Confirmation</h1>
        </div>
        <div class="content">
            <h2>Thank You For Your Order!</h2>
            <p>Dear ${data.userName},</p>
            <p>We've received your order and are working on it. Here's a summary of your purchase:</p>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Order Number:</span>
                    <span><strong>${data.orderNumber}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span>${new Date(data.orderDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span>${data.paymentMethod}</span>
                </div>
                ${hasCoupon
            ? `<div class="detail-row">
                    <span class="detail-label">Coupon Applied:</span>
                    <span class="coupon-badge">🎉 ${data.couponCode}</span>
                </div>`
            : ""
        }
            </div>
            
            <table class="order-items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items
            .map(
                (item) => `
                    <tr>
                        <td>
                            <div class="product-name">${item.name}</div>
                            ${item.variant ? `<div class="product-variant">${item.variant}</div>` : ""}
                        </td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">
                            ${item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price)
                        ? `<div class="original-price">₹${parseFloat(item.originalPrice).toFixed(2)}</div>`
                        : ""
                    }
                            <div class="sale-price">₹${parseFloat(item.price).toFixed(2)}</div>
                        </td>
                    </tr>
                    `
            )
            .join("")}
                </tbody>
            </table>
            
            <div class="order-summary">
                <div class="summary-row">
                    <span class="summary-label">Subtotal</span>
                    <span class="summary-value">₹${parseFloat(data.subtotal).toFixed(2)}</span>
                </div>
                ${hasDiscount
            ? `<div class="summary-row discount-row">
                    <span class="summary-label">Discount ${hasCoupon ? `(${data.couponCode})` : ""}</span>
                    <span class="summary-value">-₹${parseFloat(data.discount).toFixed(2)}</span>
                </div>`
            : ""
        }
                <div class="summary-row">
                    <span class="summary-label">Shipping</span>
                    <span class="summary-value">${parseFloat(data.shipping) > 0 ? `₹${parseFloat(data.shipping).toFixed(2)}` : "FREE"}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Tax</span>
                    <span class="summary-value">₹${parseFloat(data.tax).toFixed(2)}</span>
                </div>
                ${parseFloat(data.codCharge) > 0
            ? `<div class="summary-row">
                    <span class="summary-label">COD Surcharge</span>
                    <span class="summary-value">₹${parseFloat(data.codCharge).toFixed(2)}</span>
                </div>`
            : ""
        }
                <div class="summary-row total-row">
                    <span class="summary-label">Total</span>
                    <span class="summary-value">₹${parseFloat(data.total).toFixed(2)}</span>
                </div>
            </div>
            
            ${hasDiscount
            ? `<div class="savings-box">
                <span class="savings-text">🎉 You saved ₹${parseFloat(data.discount).toFixed(2)} on this order!</span>
            </div>`
            : ""
        }
            
            <div class="order-summary">
                <h3 style="margin-top: 0; color: #1a1a1a;">📍 Shipping Address:</h3>
                <p style="margin-bottom: 0;">
                    <strong>${data.shippingAddress.name}</strong><br>
                    ${data.shippingAddress.street}<br>
                    ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                    ${data.shippingAddress.country}
                    ${data.shippingAddress.phone ? `<br>📞 ${data.shippingAddress.phone}` : ""}
                </p>
            </div>
            
            <p>You can track your order status in your account dashboard:</p>
            <div class="button-container">
                <a href="${process.env.FRONTEND_URL}/account/orders" class="button">Track Your Order</a>
            </div>
            <p style="font-size: 12px; color: #999;">If you can't click the button, copy and paste this link in your browser: <br>${process.env.FRONTEND_URL}/account/orders</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Questions? Email ${store.supportEmail || store.storeEmail} or WhatsApp +91 89990 46484
        </div>
    </div>
</body>
</html>
`;
};

export const getPartnerResetTemplate = (resetLink, storeConfig = null) => {
    const store = storeConfig || getStoreConfig();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Partner Password - ${store.storeName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3F1F00, #5C2E00);
            color: #FDF6E3;
            text-align: center;
            padding: 40px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #C9933A, #B8842F);
            color: #3F1F00;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            background-color: #f8f8f8;
        }
        .security-note {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Reset Partner Password</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear Partner,</p>
            <p>We received a request to reset the password for your ${store.storeName
        } Partner account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button">Reset Partner Password</a>
            </div>
            
            <p>If you can't click the button, copy and paste this link in your browser: <br><strong>${resetLink}</strong></p>
            
            <div class="security-note">
                <strong>Security Note:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please contact our support team immediately.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email or contact our partner support team.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline
        }<br>
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
`;
};
