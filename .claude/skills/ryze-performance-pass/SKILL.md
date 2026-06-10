---
name: ryze-performance-pass
description: Use automatically for any Ryze website task involving PageSpeed, PSI score, mobile performance, LCP, FCP, CLS, Core Web Vitals, Cloudinary images, Cloudinary optimisation, hero image, hero section, Google Fonts, GTM deferral, Meta Pixel deferral, analytics loading, third-party scripts, render-blocking resources, bundle size, page load time, mobile landing page speed, or /hsc-maths-program performance optimisation.
---

## Purpose
Improve mobile PageSpeed / Core Web Vitals on Ryze public pages without damaging conversion tracking, lead capture, routing, or visual trust.

**Primary target:** `/hsc-maths-program` — the Google Ads landing page. Any regression here has direct revenue impact.

**This skill's description is deliberately scoped to technical metrics.** For copy, CTA, or offer structure changes on landing pages, use a normal prompt — that's a separate concern.

---

## Step 1 — Identify the actual LCP element (do not skip)

Before changing any code, identify the LCP element for the target route.

- Read the page component and find the first visual element above the fold
- Is the hero a CSS `background-image` or an `<img>` tag?
  - **CSS background** → it cannot receive `fetchpriority` and is often the root cause of high LCP
  - **`<img>` tag** → check for `fetchpriority="high"`, `loading="eager"`, and explicit `width`/`height`
- What is the Cloudinary URL? Does it have `f_auto,q_auto,w_*` transformations?
- What is the rendered size at 390px (iPhone) width?

**Then spawn `ryze-performance-auditor`** to do the full read-only investigation before proposing changes.

---

## Step 2 — Propose the smallest safe change

After the auditor reports, propose ONE change at a time. Priority order by typical PSI impact:

1. **Convert CSS background hero → `<img>`** with `fetchpriority="high"` + `loading="eager"` + explicit `width` and `height` — highest single impact
2. **Add Cloudinary responsive srcSet** — `f_auto,q_auto` + `w_400`, `w_800`, `w_1200` variants
3. **Fix Google Fonts** — ensure `<link rel="preconnect">` + `display=swap`, no render-blocking
4. **Defer non-critical scripts** — GTM and Meta Pixel load order if they're blocking LCP
5. **Add `loading="lazy"`** to all below-fold images (do NOT add to above-fold)
6. **Bundle splitting** — check `vite.config.ts` `manualChunks` for large vendor chunks

Do not combine multiple changes in one PR. Test each change independently on Vercel Preview.

---

## Step 3 — Preserve tracking integrity (non-negotiable)

**Never remove GTM or Meta Pixel.** If deferring:
- GTM must still fire the `gtm.js` dataLayer event — conversion tracking depends on it
- Meta Pixel `fbq('track', 'PageView')` must still fire on every page load
- Lead form `POST /api/leads` must still include UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- Do not initialise GTM or Meta Pixel more than once per page load

---

## Step 4 — Validate on Vercel Preview (not localhost)

Localhost bypasses CDN, compression, and real network latency. Always test on a real Vercel Preview URL:

1. Push to a branch → Vercel Preview URL auto-deploys
2. Run PageSpeed Insights at `pagespeed.web.dev` against the Preview URL
3. Compare mobile PSI score before/after
4. Check mobile LCP element is now the intended image, not a background

---

## Step 5 — Report

Produce:
- **What changed** and the specific files
- **Expected impact** — LCP delta, PSI score delta (estimate or measured)
- **Tracking risk** — none / low / medium, with specific note if deferral was applied
- **Before/after PSI scores** if tested on Vercel Preview
- **Follow-up items** if multiple passes are needed

---

## Hard rules

- Do not remove GTM or Meta Pixel
- Do not initialise GTM or Meta Pixel more than once
- Do not degrade above-the-fold layout or CTA visibility on mobile
- Do not use raw Tailwind colour utilities — use `var(--...)` tokens
- Do not make unrelated refactors in the same change
- Do not test only on localhost — always validate on Vercel Preview
