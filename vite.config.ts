import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function localApiPlugin() {
  return {
    name: 'auren-local-api',
    configureServer(server: any) {
      server.middlewares.use('/api/indiamart/search', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next();
        try {
          let body = '';
          for await (const chunk of req) body += chunk;
          let payload: any = {};
          try { payload = body ? JSON.parse(body) : {}; } catch {
            res.statusCode = 400; res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
          }
          const query = typeof payload.query === 'string' ? payload.query.trim() : '';
          const key = process.env.ANAKIN_API_KEY;
          if (!query) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'Search query is required' })); }
          if (!key) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'ANAKIN_API_KEY is not configured in .env.local' })); }
          const upstream = await fetch('https://api.anakin.io/v1/search', {
            method: 'POST',
            headers: { 'X-API-Key': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ prompt: `site:indiamart.com ${query}` }),
          });
          const text = await upstream.text();
          let data: any = null;
          try { data = text ? JSON.parse(text) : null; } catch {}
          if (!upstream.ok) {
            res.statusCode = upstream.status === 429 ? 429 : 502;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: data?.error || data?.message || `Anakin API returned HTTP ${upstream.status}` }));
          }
          if (!data) { res.statusCode = 502; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'Anakin API returned an empty/non-JSON response' })); }
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(data));
        } catch (error: any) {
          res.statusCode = 502; res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: error?.message || 'IndiaMART search request failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);
  return {
    plugins: [react(), localApiPlugin()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    optimizeDeps: { exclude: ['lucide-react'] },
    server: { historyApiFallback: true },
  };
});
