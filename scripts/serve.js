const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};
const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3456);

function responseHeaders(requestPath) {
  const headers = {};
  let matches = false;
  for (const line of fs.readFileSync(path.join(root, '_headers'), 'utf8').split('\n')) {
    if (line.startsWith('/')) {
      matches = line.endsWith('*') ? requestPath.startsWith(line.slice(0, -1)) : requestPath === line.trim();
    } else if (matches && /^\s+[^:]+:/.test(line)) {
      const colon = line.indexOf(':');
      headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
  }
  // Preview must always reflect edits, even for normally cached assets.
  headers['Cache-Control'] = 'no-store';
  return headers;
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  let requestPath;
  let query = '';
  try {
    const rawPath = req.url.split('?')[0];
    requestPath = decodeURIComponent(rawPath);
    query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  if (requestPath.includes('\0') || requestPath.includes('\\') ||
      requestPath.split('/').some(part => part.startsWith('.')) ||
      /^\/(?:scripts|node_modules)(?:\/|$)/.test(requestPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  let status = 200;
  let filePath = requestPath === '/' ? '/index.html' : requestPath;
  const routes = fs.readFileSync(path.join(root, '_redirects'), 'utf8').split('\n');
  for (const line of routes) {
    const [from, to, code] = line.trim().split(/\s+/);
    if (from !== requestPath) continue;
    if (code === '301') {
      res.writeHead(301, { Location: to + query });
      return res.end();
    }
    if (code === '200') filePath = to;
    break;
  }

  let fullPath = path.resolve(root, '.' + filePath);
  if (!fullPath.startsWith(root + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'index.html');
  }
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    fullPath = path.join(root, '404.html');
    status = 404;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Unable to read page');
    }
    const headers = responseHeaders(requestPath);
    headers['Content-Type'] = MIME[path.extname(fullPath)] || 'application/octet-stream';
    if (status === 404) headers['X-Robots-Tag'] = 'noindex';
    res.writeHead(status, headers);
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, '127.0.0.1', () => console.log(`Preview server running at http://localhost:${PORT}/`));
