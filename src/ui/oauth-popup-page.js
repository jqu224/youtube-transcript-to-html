import {bootstrapOAuthPopup} from './oauth-popup-runtime.js';

export function renderOAuthPopupPage() {
  return String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>YouTube Transcript Authorization</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      .card {
        max-width: 640px;
        margin: 0 auto;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 12px;
        padding: 16px;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      button {
        border: 1px solid rgba(128, 128, 128, 0.5);
        border-radius: 8px;
        background: transparent;
        padding: 8px 12px;
        cursor: pointer;
      }
      pre {
        margin-top: 12px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>YouTube transcript authorization</h1>
      <p id="subtitle">Authorize and fetch transcript in browser</p>
      <div class="actions">
        <button id="authorize-and-fetch" type="button">Authorize and Fetch</button>
        <button id="close-window" type="button">Close</button>
      </div>
      <pre id="status"></pre>
      <pre id="debug"></pre>
    </div>

    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script>
const __name = (target) => target;
(${bootstrapOAuthPopup.toString()})();
    </script>
  </body>
</html>`;
}
