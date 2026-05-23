export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inviteId, memberName, memberEmail, hostName, bayName, sessionDate, startTime, endTime, facilityName } = req.body;

  if (!inviteId || !memberEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const acceptUrl = `https://baybuddy.vercel.app/accept.html?invite=${inviteId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
              <tr>
                <td style="background:#1a1a1a;padding:24px;text-align:center;border-bottom:1px solid #2a2a2a;">
                  <p style="margin:0 0 6px;font-size:12px;color:#D4A800;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${facilityName}</p>
                  <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;color:#ffffff;">You're invited!</h1>
                  <p style="margin:0;font-size:14px;color:#666;">${hostName} wants you to join their simulator session</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;margin-bottom:20px;border:1px solid #2a2a2a;">
                    <tr>
                      <td style="padding:14px 18px;">
                        <p style="margin:0 0 3px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Invited by</p>
                        <p style="margin:0;font-size:15px;font-weight:500;color:#e8e8e8;">${hostName}</p>
                      </td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Bay</p>
                        <p style="margin:0;font-size:14px;font-weight:500;color:#D4A800;">${bayName}</p>
                      </td>
                      <td width="4%"></td>
                      <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Date</p>
                        <p style="margin:0;font-size:14px;font-weight:500;color:#e8e8e8;">${sessionDate}</p>
                      </td>
                    </tr>
                    <tr><td colspan="3" style="padding:6px 0;"></td></tr>
                    <tr>
                      <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Start</p>
                        <p style="margin:0;font-size:14px;font-weight:500;color:#e8e8e8;">${startTime}</p>
                      </td>
                      <td width="4%"></td>
                      <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">End</p>
                        <p style="margin:0;font-size:14px;font-weight:500;color:#e8e8e8;">${endTime}</p>
                      </td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td align="center" style="background:#D4A800;border-radius:10px;">
                        <a href="${acceptUrl}" style="display:block;padding:14px;font-size:15px;font-weight:600;color:#111;text-decoration:none;text-align:center;">View &amp; Respond to Invite →</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0;font-size:12px;color:#444;text-align:center;">This invite was sent to ${memberEmail}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px;text-align:center;border-top:1px solid #1a1a1a;">
                  <p style="margin:0;font-size:11px;color:#2a2a2a;">Powered by <span style="color:#3a3a3a;">BayBuddy</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BayBuddy <invites@baybuddy.pro>',
        to: [memberEmail],
        subject: `${hostName} invited you to join their session at ${facilityName}`,
        html: html
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data });
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
