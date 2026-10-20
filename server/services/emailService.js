const nodemailer = require('nodemailer');

const getTransporter = () => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // port 587 uses STARTTLS
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  // 1. If RESEND_API_KEY is available (Render cloud production), send over HTTPS Port 443
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    try {
      const fromAddress = process.env.RESEND_FROM || 'BALLOT <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text
        })
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        throw new Error(resendData.message || JSON.stringify(resendData));
      }

      console.log(`[Email Service - Resend HTTPS] Sent email to ${to} (ID: ${resendData.id})`);
      return { success: true, messageId: resendData.id };
    } catch (resendErr) {
      console.error(`[Email Service - Resend] Error sending to ${to}:`, resendErr.message);
      // Fall through to try Nodemailer if configured
    }
  }

  // 2. Fallback to Nodemailer SMTP (Localhost or custom SMTP)
  const user = (process.env.SMTP_USER || '').trim();
  const from = process.env.SMTP_FROM || (user ? `"BALLOT Platform" <${user}>` : '"BALLOT Platform" <noreply@ballot.org>');
  const transporter = getTransporter();

  if (!transporter) {
    console.error('[Email Service] Error: Neither RESEND_API_KEY nor SMTP credentials configured!');
    throw new Error('Email credentials not configured on server.');
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`[Email Service - SMTP] Sent email to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service - SMTP] Error sending to ${to}:`, err.message);
    throw err;
  }
};

// 1. Organizer Registration OTP
exports.sendOrganizerRegistrationOTP = async (email, otp) => {
  const subject = 'Verify your BALLOT Organizer Account';
  const text = `Welcome to BALLOT!\n\nYour 6-digit email verification code is: ${otp}\n\nThis code will expire in 15 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; background-color: #F3EFE7; color: #171717;">
      <h2 style="color: #C94B36;">BALLOT — Organizer Verification</h2>
      <p>Your 6-digit email verification code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px; background-color: #FFFCF6; border: 1px solid #D6D0C5; display: inline-block; margin: 10px 0;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #74736E;">Valid for 15 minutes.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

// 2. Voter Verification OTP
exports.sendVoterOTP = async (email, pollTitle, otp) => {
  const subject = `Your BALLOT Voting Verification Code: ${otp}`;
  const text = `You requested access to vote in "${pollTitle}".\n\nYour 6-digit voting verification code is: ${otp}\n\nThis code expires in 5 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; background-color: #F3EFE7; color: #171717;">
      <h2 style="color: #171717;">BALLOT — Voter Verification</h2>
      <p>Poll: <b>${pollTitle}</b></p>
      <p>Your 6-digit verification code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px; background-color: #FFFCF6; border: 1px solid #D6D0C5; display: inline-block; margin: 10px 0; color: #C94B36;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #74736E;">Valid for 5 minutes. Do not share this code.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

// 3. Poll Invitation Email
exports.sendPollInvitation = async (email, pollTitle, organizerName, invitationUrl, pollCode) => {
  const subject = `Invitation to Vote: ${pollTitle}`;
  const text = `You have been invited by ${organizerName} to participate in the poll: "${pollTitle}".\n\nPoll Code: ${pollCode}\nAccess Link: ${invitationUrl}\n\nNote: Accessing the link or code will require email OTP verification before you can cast your vote.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; background-color: #F3EFE7; color: #171717;">
      <h2 style="color: #171717;">BALLOT Poll Invitation</h2>
      <p><b>${organizerName}</b> has invited you to participate in a restricted poll:</p>
      <h3 style="color: #C94B36;">${pollTitle}</h3>
      <p><b>Poll Code:</b> <code>${pollCode}</code></p>
      <div style="margin: 20px 0;">
        <a href="${invitationUrl}" style="background-color: #171717; color: #FFFCF6; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Access Poll & Verify OTP →
        </a>
      </div>
      <p style="font-size: 12px; color: #74736E;">Important: This invitation link identifies your access route. You must still verify your email OTP before casting your vote.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};
