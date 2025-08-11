// /api/gas.js  (CommonJS)
module.exports = async function (req, res) {
  const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbwZrYAb19rrJRc9872MvXHxWyp5OZAeU8SxOrx_8z16Ur06KLQle0awKgsdPWgwL4C0/exec';

  const noStore = () => {
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
    res.setHeader('CDN-Cache-Control','no-store');
    res.setHeader('Vercel-CDN-Cache-Control','no-store');
  };

  try {
    if (req.method === 'GET') {
      const qs = new URLSearchParams(req.query || {}).toString();
      const url = `${GAS_BASE_URL}${qs ? `?${qs}` : ''}`;
      const r = await fetch(url);
      const text = await r.text();
      noStore();
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }

    if (req.method === 'POST') {
      let formBody = '';
      const ctype = (req.headers['content-type'] || '').toLowerCase();
      if (ctype.includes('application/x-www-form-urlencoded') && typeof req.body === 'string') {
        formBody = req.body;
      } else {
        const params = new URLSearchParams();
        const bodyObj = (typeof req.body === 'object' && req.body) ? req.body : {};
        for (const [k, v] of Object.entries(bodyObj)) {
          params.set(k, typeof v === 'string' ? v : JSON.stringify(v));
        }
        formBody = params.toString();
      }

      const r = await fetch(GAS_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });
      const text = await r.text();
      noStore();
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }

    noStore();
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ ok:false, error:'Method Not Allowed' });
  } catch (err) {
    noStore();
    res.status(500).json({ ok:false, error:String(err) });
  }
};

