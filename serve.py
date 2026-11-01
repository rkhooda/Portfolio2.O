#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
class Handler(SimpleHTTPRequestHandler):
    def offline_api(self):
        body = b'{"error":"offline"}'
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path.startswith('/api/'):
            return self.offline_api()
        if path != '/' and '.' not in path.rsplit('/', 1)[-1]:
            self.path = '/index.html'
        super().do_GET()
    def do_POST(self):
        if self.path.split('?', 1)[0].startswith('/api/'):
            return self.offline_api()
        self.send_error(404)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
ThreadingHTTPServer(('0.0.0.0', 8000), Handler).serve_forever()
