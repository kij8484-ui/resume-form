// /api/gas.js
module.exports = async function (req, res) {
  const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbwZrYAb19rrJRc9872MvXHxWyp5OZAeU8SxOrx_8z16Ur06KLQle0awKgsdPWgwL4C0/exec';

  const setCache = (action) => {
    if (action === 'config') {
      // CDN 60초 캐시 + 백그라운드 갱신
      const v = 'public, s-maxage=60, stale-while-revalidate=300';
      res.setHeader('Cache-Control', v);
      res.setHeader('Vercel-CDN-Cache-Control', v);
      res.setHeader('CDN-Cache-Control', v);
    } else {
      // 유저별 데이터는 캐시 금지
      res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
      res.setHeader('Pragma','no-cache');
      res.setHeader('Expires','0');
      res.setHeader('Vercel-CDN-Cache-Control','no-store');
      res.setHeader('CDN-Cache-Control','no-store');
    }
  };

  try {
    const method = req.method || 'GET';
    if (method === 'GET') {
      const qs = new URLSearchParams(req.query || {});
      const action = (qs.get('action') || 'config').trim();
      const url = `${GAS_BASE_URL}${qs.toString() ? `?${qs}` : ''}`;
      const r = await fetch(url);
      const text = await r.text();
      setCache(action);
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }

    if (method === 'POST') {
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
      setCache('post'); // 캐시 금지
      try { res.status(r.status).json(JSON.parse(text)); }
      catch { res.status(r.status).send(text); }
      return;
    }

    setCache('other');
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ ok:false, error:'Method Not Allowed' });
  } catch (err) {
    setCache('error');
    res.status(500).json({ ok:false, error:String(err) });
  }
};

