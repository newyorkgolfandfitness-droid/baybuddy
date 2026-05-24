export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestEmail, hostName, bayName, sessionDate, startTime, endTime, facilityName, acceptUrl } = req.body;

  if (!guestEmail || !acceptUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">

      <!-- Header -->
      <tr><td style="background:#1a1a1a;padding:28px 24px;text-align:center;border-bottom:1px solid #2a2a2a;">
        <p style="margin:0 0 8px;font-size:12px;color:#D4A800;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${facilityName}</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">You're invited to play! ⛳</h1>
      </td></tr>

      <!-- Message -->
      <tr><td style="padding:28px 24px;">

        <p style="margin:0 0 20px;font-size:16px;color:#e8e8e8;line-height:1.6;">
          Hey! <strong style="color:#D4A800;">${hostName}</strong> invited you to come play with them at <strong style="color:#D4A800;">${facilityName}</strong>. We'd love to have you — come experience one of the best indoor golf simulators around!
        </p>

        <!-- Session details -->
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

        <!-- Guest fee notice -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td style="background:#1f1f00;border-radius:10px;padding:14px 18px;border:1px solid #3a3000;">
            <p style="margin:0;font-size:14px;color:#D4A800;line-height:1.6;">
              💰 <strong>Guest fee is $25/hr</strong> — no need to pay in advance, we'll collect it after you're done playing. Easy!
            </p>
          </td></tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td align="center" style="background:#D4A800;border-radius:10px;">
            <a href="${acceptUrl}" style="display:block;padding:16px;font-size:16px;font-weight:700;color:#111;text-decoration:none;text-align:center;">I'm in — Let's Play! →</a>
          </td></tr>
        </table>

        <p style="margin:0 0 6px;font-size:14px;color:#888;text-align:center;line-height:1.6;">
          We can't wait to have you. See you on the simulator! 🏌️
        </p>
        <p style="margin:0;font-size:12px;color:#444;text-align:center;">
          17 Grand St, Kingston, NY 12401 · 845-802-0448
        </p>

      </td></tr>

      <!-- Footer -->
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
        to: [guestEmail],
        subject: `${hostName} invited you to play golf at ${facilityName} 🏌️`,
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
