#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path != '/' and '.' not in path.rsplit('/', 1)[-1] and not path.startswith('/api/'):
            self.path = '/index.html'
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
ThreadingHTTPServer(('0.0.0.0', 8000), Handler).serve_forever()
