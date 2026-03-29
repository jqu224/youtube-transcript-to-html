from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

import json
import sys

from youtube_transcript_api import YouTubeTranscriptApi


HOST = "127.0.0.1"
PORT = 8791
HOP_BY_HOP_HEADERS = {
    "connection",
    "content-encoding",
    "content-length",
    "host",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}


class LocalFetchProxyHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        self._handle_proxy()

    def do_POST(self):
        self._handle_proxy()

    def log_message(self, format, *args):
        sys.stderr.write("local-fetch-proxy: " + (format % args) + "\n")

    def _handle_proxy(self):
        parsed = urlparse(self.path)
        if parsed.path == "/youtube-transcript":
            self._handle_youtube_transcript(parsed)
            return
        if parsed.path != "/proxy":
            self._send_error(404, b"Not found.")
            return

        target_url = parse_qs(parsed.query).get("url", [""])[0]
        if not target_url:
            self._send_error(400, b"Missing target url.")
            return

        body = None
        if self.command not in {"GET", "HEAD"}:
            content_length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(content_length) if content_length else None

        headers = {
            key: value
            for key, value in self.headers.items()
            if key.lower() not in HOP_BY_HOP_HEADERS
        }
        headers["Accept-Encoding"] = "identity"
        headers.setdefault("User-Agent", "Mozilla/5.0")

        request = Request(target_url, data=body, headers=headers, method=self.command)
        try:
            with urlopen(request, timeout=90) as upstream:
                self._relay_response(upstream.status, upstream.headers.items(), upstream)
        except HTTPError as error:
            self._relay_response(error.code, error.headers.items(), error)
        except URLError as error:
            self._send_error(502, str(error).encode("utf-8", "ignore"))
        except BrokenPipeError:
            return
        except Exception as error:
            self._send_error(502, str(error).encode("utf-8", "ignore"))

    def _handle_youtube_transcript(self, parsed):
        params = parse_qs(parsed.query)
        video_id = params.get("videoId", [""])[0]
        language = params.get("language", [""])[0]
        if not video_id:
            self._send_error(400, b"Missing video id.")
            return

        api = YouTubeTranscriptApi()
        try:
            options = [language] if language else None
            transcript = api.fetch(video_id, languages=options)
        except Exception as error:
            self._send_error(502, str(error).encode("utf-8", "ignore"))
            return

        payload = {
            "language": language or "",
            "source": "local-transcript-proxy",
            "entries": [
                {
                    "id": f"cue-{index + 1}",
                    "startMs": int(float(item.start) * 1000),
                    "durationMs": int(float(item.duration) * 1000),
                    "text": item.text,
                }
                for index, item in enumerate(transcript)
            ],
        }
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def _relay_response(self, status, headers, upstream):
        self.send_response(status)
        for key, value in headers:
            if key.lower() in HOP_BY_HOP_HEADERS:
                continue
            self.send_header(key, value)
        self.send_header("Connection", "close")
        self.end_headers()

        while True:
            chunk = upstream.read(65536)
            if not chunk:
                break
            try:
                self.wfile.write(chunk)
                self.wfile.flush()
            except BrokenPipeError:
                return

    def _send_error(self, status, message):
        try:
            self.send_response(status)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(message)
        except BrokenPipeError:
            return


def main():
    server = ThreadingHTTPServer((HOST, PORT), LocalFetchProxyHandler)
    print(f"local-fetch-proxy listening on http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
