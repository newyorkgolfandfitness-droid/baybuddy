export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { memberName, hostName, bayName, sessionDate, startTime, status, facilityName, currentCount, maxPlayers } = req.body;

  const statusLabel = status === 'accepted' ? '✅ Accepted' : '❌ Declined';
  const statusColor = status === 'accepted' ? '#4ade80' : '#f87171';
  const spotsLeft = status === 'accepted' ? maxPlayers - currentCount : null;
  const sessionFull = status === 'accepted' && currentCount >= maxPlayers;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
      <tr><td style="background:#1a1a1a;padding:24px;border-bottom:1px solid #2a2a2a;">
        <p style="margin:0 0 4px;font-size:12px;color:#D4A800;text-transform:uppercase;letter-spacing:1px;">${facilityName} — Session Update</p>
        <h1 style="margin:0;font-size:20px;font-weight:600;color:#fff;">${statusLabel} ${memberName}</h1>
      </td></tr>
      <tr><td style="padding:24px;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;margin-bottom:16px;border:1px solid #2a2a2a;">
          <tr><td style="padding:16px 18px;">
            <table width="100%">
              <tr>
                <td style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;padding-bottom:4px;">Member</td>
                <td style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;padding-bottom:4px;text-align:right;">Host</td>
              </tr>
              <tr>
                <td style="font-size:15px;font-weight:500;color:#e8e8e8;">${memberName}</td>
                <td style="font-size:15px;font-weight:500;color:#e8e8e8;text-align:right;">${hostName}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
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
          <tr><td colspan="3" style="padding:5px 0;"></td></tr>
          <tr>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid #2a2a2a;">
              <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Time</p>
              <p style="margin:0;font-size:14px;font-weight:500;color:#e8e8e8;">${startTime}</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:12px 16px;border:1px solid ${statusColor};">
              <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.6px;">Status</p>
              <p style="margin:0;font-size:14px;font-weight:500;color:${statusColor};">${statusLabel}</p>
            </td>
          </tr>
        </table>

        ${status === 'accepted' ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr><td style="background:${sessionFull ? '#2a0f0f' : '#0f2a1a'};border-radius:10px;padding:14px 18px;border:1px solid ${sessionFull ? '#5a1a1a' : '#1a5a30'};">
            <p style="margin:0;font-size:14px;font-weight:500;color:${sessionFull ? '#f87171' : '#4ade80'};">
              ${sessionFull ? `⛔ Session is now full — ${bayName} has reached capacity (${maxPlayers} players)` : `${currentCount} of ${maxPlayers} players confirmed — ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining`}
            </p>
          </td></tr>
        </table>` : ''}

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
        to: ['newyorkgolfandfitness@gmail.com'],
        subject: `${memberName} ${status === 'accepted' ? 'accepted' : 'declined'} an invite for ${bayName} — ${sessionDate}`,
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
