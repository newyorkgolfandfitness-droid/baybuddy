export default async function handler(req, res) {
  const SUPABASE_URL = 'https://bdedqplcpjlesgqotllm.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZWRxcGxjcGpsZXNncW90bGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjM0MDgsImV4cCI6MjA5NDkzOTQwOH0.BlvMj0NUJAbAFGatsnTF0n0_Fr0zABG9BrN-fh0KEZI';
  const FACILITY_ID = '00000000-0000-0000-0000-000000000001';
  const WIX_MEMBERS_URL = 'https://www.newyorkgolfandfitness.com/_functions/members';

  try {
    // Fetch members from Wix
    const wixRes = await fetch(WIX_MEMBERS_URL);
    const wixData = await wixRes.json();
    console.log('Wix members fetched:', JSON.stringify(wixData).substring(0, 200));

    // Handle both array and object response formats
    const memberList = Array.isArray(wixData) ? wixData : (wixData.members || wixData.items || []);

    if (!memberList.length) {
      return res.status(200).json({ success: false, message: 'No members returned from Wix', raw: wixData });
    }

    // Map Wix members to Supabase format
    const rows = memberList.map(m => ({
      facility_id: FACILITY_ID,
      name: m.name || m.fullName || (m.firstName + ' ' + m.lastName).trim() || 'Unknown',
      email: m.email || m.loginEmail || '',
      handicap: m.handicap != null ? parseInt(m.handicap) : null,
      wix_id: m.id || m._id || m.memberId || null
    }));

    // Upsert into Supabase based on wix_id
    const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(rows)
    });

    const supaText = await supaRes.text();
    console.log('Supabase upsert status:', supaRes.status);
    console.log('Supabase upsert response:', supaText);

    return res.status(200).json({
      success: true,
      memberCount: rows.length,
      supabaseStatus: supaRes.status,
      sample: rows.slice(0, 3)
    });

  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
