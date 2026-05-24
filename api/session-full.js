export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { memberEmail, memberName, hostName, bayName, sessionDate, startTime, facilityName } = req.body;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
      <tr><td style="background:#1a1a1a;padding:24px;text-align:center;border-bottom:1px solid #2a2a2a;">
        <p style="margin:0 0 6px;font-size:12px;color:#D4A800;text-transform:uppercase;letter-spacing:1px;">${facilityName}</p>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;color:#fff;">Session is full</h1>
        <p style="margin:0;font-size:14px;color:#666;">Sorry ${memberName}, this session has reached capacity</p>
      </td></tr>
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;margin-bottom:20px;border:1px solid #2a2a2a;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 3px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Host</p>
            <p style="margin:0;font-size:15px;font-weight:500;color:#e8e8e8;">${hostName}</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
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
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#2a1a00;border-radius:10px;margin-bottom:16px;border:1px solid #5a3a00;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#D4A800;line-height:1.5;">This session with ${hostName} at ${bayName} is now full. You can still book your own simulator session at ${facilityName}.</p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:12px;color:#444;text-align:center;">This notification was sent to ${memberEmail}</p>
      </td></tr>
      <tr><td style="padding:16px;text-align:center;border-top:1px solid #1a1a1a;">
        <p style="margin:0;font-size:11px;color:#2a2a2a;">Powered by <span style="color:#3a3a3a;">BayBuddy</span></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

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
        subject: `Session is full — ${hostName}'s ${bayName} session on ${sessionDate}`,
        html: html
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
