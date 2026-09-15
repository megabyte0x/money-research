import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon',
};

function matchSource(pattern, pathname) {
  const source = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  if (source.includes('(.*)') || source.includes(':path*') || source.includes('(.*)')) {
    const prefix = source.replace(/\/?\(.*\)$/, '').replace(/\/:path\*$/, '');
    return path === prefix || path.startsWith(prefix + '/') || pathname.startsWith(prefix + '/');
  }
  return path === source || pathname === source || pathname === source + '/';
}

function applyHeaders(vercel, pathname) {
  const headers = {};
  for (const rule of vercel.headers || []) {
    if (matchSource(rule.source, pathname)) {
      for (const header of rule.headers) headers[header.key] = header.value;
    }
  }
  return headers;
}

function redirectFor(vercel, pathname) {
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  for (const rule of vercel.redirects || []) {
    if (matchSource(rule.source, path)) {
      return { location: rule.destination, status: rule.permanent ? 308 : 307 };
    }
  }
  return null;
}

function fileFor(dist, pathname) {
  const clean = normalize(pathname).replace(/\\/g, '/');
  if (clean.includes('..')) return null;
  const relative = clean.replace(/^\//, '');
  const candidates = relative.endsWith('/') || relative === ''
    ? [join(dist, relative, 'index.html')]
    : [join(dist, relative), join(dist, relative, 'index.html'), join(dist, `${relative}.html`)];
  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

export function createHostServer(dist, vercel) {
  return createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = url.pathname;
    const redirected = redirectFor(vercel, pathname);
    if (redirected) {
      res.writeHead(redirected.status, { Location: redirected.location + url.search });
      res.end();
      return;
    }
    if (vercel.trailingSlash && pathname !== '/' && !pathname.endsWith('/') && !extname(pathname)) {
      res.writeHead(308, { Location: pathname + '/' + url.search });
      res.end();
      return;
    }
    const file = fileFor(dist, pathname);
    const headers = applyHeaders(vercel, pathname);
    if (!file) {
      const notFound = join(dist, '404.html');
      const body = existsSync(notFound) ? readFileSync(notFound) : 'Not found';
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
      res.end(body);
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', ...headers });
    res.end(readFileSync(file));
  });
}

export function listenHost(dist, vercel, port = 0) {
  const server = createHostServer(dist, vercel);
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}
