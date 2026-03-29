# Deploy this repo to Cloudflare Workers (including from GitHub)

## Do you need `index.html`?

**No, not for the live app.** The Worker entry is [`src/worker.js`](../src/worker.js). A `GET /` request is handled in code by [`renderAppPage()`](../src/ui/page.js), which returns the full HTML shell. Wrangler bundles that script; there is no separate static site root required for the Worker to serve the UI.

The repository may include a root [`index.html`](../index.html) only as a **short note for humans** who open the repo in a browser or expect a static file. It is **not** what users hit in production after a Worker deploy.

## Troubleshooting: `Got HTML instead of JSON` when loading a workspace

If `/api/workspace` or `/api/gemini/ping` returns a full HTML document (often starting with `<!DOCTYPE`), the client cannot parse JSON. Common cases:

- **Local:** Open the app at the **Wrangler dev** URL printed in the terminal (e.g. `http://127.0.0.1:8788`), not the Python transcript proxy port (`8791`) and not a static file server.
- **Cloudflare Pages + static assets:** If the site is deployed as **Pages** with SPA fallback, `/api/*` may return `index.html`. Route API traffic to this **Worker** (same zone, correct routes) or use a Worker-only hostname for the app.
- **Cloudflare edge error HTML:** If the **Worker throws** or the edge returns a **5xx HTML** page (e.g. “Worker threw exception”), the response is still HTML, not `application/json`. Fix the underlying exception in **Workers → Logs**, redeploy, and retry — routing alone will not fix a crashing Worker.

## Where `npm install` runs

Cloudflare Workers **do not** run `npm install` on the edge at request time. Dependencies are installed in **CI or on your laptop** when you run `npm install`, then **Wrangler bundles** `src/worker.js` and its imports into the uploaded script.

So: add packages in [`package.json`](../package.json), run `npm install` locally or in GitHub Actions, then `wrangler deploy`.

## `@google/genai` and this project

[`@google/genai`](https://www.npmjs.com/package/@google/genai) is listed in `package.json` so installs and upgrades are explicit. The Worker’s Gemini calls still use **plain `fetch`** against the Generative Language API in [`src/lib/gemini.js`](../src/lib/gemini.js), which keeps the bundle predictable on Workers. The SDK has had [Worker runtime edge cases](https://github.com/googleapis/js-genai/issues/324); you can migrate to `GoogleGenAI` later (prefer the **web** build, not `@google/genai/node`, if you target Workers).

## Local vs production secrets

- **Local:** keep keys in **`config/gemini.local.json`** (gitignored) or `.dev.vars` (gitignored). See repo README; `npm run dev` runs a sync step that copies `config/gemini.local.json` into `.dev.vars` for Wrangler.
- **Production:** Cloudflare Worker **`env.GEMINI_API_KEY`** — set with `wrangler secret put GEMINI_API_KEY` or the dashboard. Never commit real keys; `config/gemini.local.json` is listed in `.gitignore`.

## One-time Cloudflare setup

1. Install Wrangler: `npm install` (already in devDependencies) and use `npx wrangler login`.
2. Create a Worker in the Cloudflare dashboard or let `wrangler deploy` create it.
3. Set secrets for production (API key), for example:

   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

   Optional: `GEMINI_MODEL` via vars in `wrangler.toml` or dashboard.

## Deploy from your machine

```bash
npm install
npm test
npx wrangler deploy
```

## Deploy from GitHub (recommended)

Use the workflow in [`.github/workflows/deploy-worker.yml`](../.github/workflows/deploy-worker.yml).

Add these **repository secrets** in GitHub (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | API token with **Edit Cloudflare Workers** (and account read) |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard **Workers & Pages** → right column **Account ID** |

Push to `main` runs tests and deploys. Adjust the branch name in the workflow file if you use something else.

## Cloudflare dashboard: Connect Git

You can also use **Workers & Pages** → **Create** → **Connect to Git**, select the repo, and use build command `npm ci` and deploy command `npx wrangler deploy` (or the dashboard’s Wrangler preset). The important part is still **`wrangler.toml`** pointing at `main = "src/worker.js"`, not an `index.html` build output.
