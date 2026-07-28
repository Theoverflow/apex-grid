# Apex Grid agent contract

## Product direction
Premium motorsport editorial platform: sharp aerodynamic geometry, restrained luxury, high contrast, accessible motion, no generic AI gradients or stock-dashboard appearance.

## Non-negotiable SEO rules
- Preserve SSR or static HTML for all public editorial content.
- Every indexable route must have unique metadata, a self-canonical, one descriptive H1, crawlable links, and valid JSON-LD matching visible content.
- Search, previews, account and API routes remain non-indexable.
- Never create doorway pages, spun city pages, hidden text, keyword stuffing, fake reviews or fabricated race data.
- AI may generate a draft or brief only; publication requires factual and editorial validation.
- New public routes must be added to the sitemap and the automated audit fixture (`seo.routes.json` + sitemap).

## AI SEO automation (allowed)
Run offline: `npm run seo:ai:offline` (briefs + outlines).
Run live: `BASE_URL=https://domain npm run seo:ai` (audit deep, meta drafts, maillage, schema hints, regression).

Daily automation:
- GitHub Actions `seo-ai-daily-commit.yml` commits `reports/latest/` every day at 05:17 UTC when `PRODUCTION_URL` is set.
- Cursor Automation prompt: `.cursor/prompts/daily-seo-ai-agent.md` (create the schedule in Agents Window → Automations).

Optional LLM enrichment: `SEO_AI_PROVIDER=openai|anthropic` + `SEO_AI_API_KEY` (GitHub secret) / `SEO_AI_MODEL` (optional var). Default path is heuristic/free and still produces actionable drafts.

Forbidden automations: auto-publish, link buying, spun pages, fake entities, IndexNow spam.

## Quality gates
Run `npm run check` before merge. For live releases, run `BASE_URL=https://domain npm run seo:agent` (or `seo:ai`) and review `reports/seo-report.md`. Keep `seo.limits.json`, `seo.routes.json` and `scripts/seo-core.mjs` aligned with the AWS Lambda package (`npm run package:seo-lambda`).
