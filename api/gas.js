export default async function handler(req, res) {
  const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbxbOckddtn-hjlNswqr-3vXkpi2CSFtfruVkArKi37Q59aWa3sjjeYgzKKYT1Ed4LCP/exec';
  try {
    if (req.method === 'GET') {
      const qs = new URLSearchParams(req.query).toString();
      const url = `${GAS_BASE_URL}${qs ? `?${qs}` : ''}`;
      const r = await fetch(url);
      const text = await r.text();
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }
    if (req.method === 'POST') {
      const bodyParams = new URLSearchParams();
      for (const [k, v] of Object.entries(req.body || {})) {
        bodyParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
      const r = await fetch(GAS_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      });
      const text = await r.text();
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });  
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
