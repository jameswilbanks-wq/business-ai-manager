# workers/

Cloudflare Workers for edge-specific responsibilities (Cloud Architecture —
"Cloudflare Workers"): request normalization, security headers,
geolocation-aware behavior, and lightweight edge API endpoints that don't
belong in the main Next.js app.

Not implemented in M1 — this is a placeholder location plus the wrangler
config shape so a real Worker can be dropped in without restructuring.

Deploy docs: `docs/deployment/10_Cloudflare_Deployment.md`.
