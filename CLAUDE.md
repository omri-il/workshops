# CLAUDE.md

workshops is the site at https://workshops.omri-iram.co.il: a "during" page and an "after" page for each of Omri's workshops. Static HTML, CSS and JS, no build step, served by GitHub Pages from the repo root. Repo `omri-il/workshops`, **public**, default branch `master`. `README.md` explains the pages; `SETUP.md` holds the one-time setup (DNS, Apps Script, n8n).

## Commands

There is no build, no test and no dev server. Open a page in the browser, or serve the folder:

```bash
python -m http.server 8000
```

**Push to `master` is the deploy.** Pages serves the new files about 1 minute later.

## Layout

```
index.html      the landing page that lists the workshops
_template/      during.html + after.html. Copy it; never edit it for one workshop
assets/         style.css + script.js, shared by every workshop
<slug>/         one folder per workshop: during.html, after.html
CNAME           workshops.omri-iram.co.il
.nojekyll       turns the Jekyll build off (see Traps)
favicon.svg
```

Adding a workshop = copy `_template/` to a new slug folder (lowercase, dashes, like `classroom-2026-06`), fill the `<!-- REPLACE -->` markers, add a row in `index.html`, push. Never change a shared file for one workshop, and never copy `assets/` into a workshop folder.

## Traps

- ⚠️ **`.nojekyll` must stay.** Pages runs Jekyll by default, and Jekyll refuses a folder that starts with `_`. `_template/` broke every build from 2026-06-08 until this file was added, so the site was never served in that time. The only message was "Page build failed", which never names the cause. A new folder that starts with `_` carries the same risk.
- ⚠️ **`CNAME` must stay**, with `workshops.omri-iram.co.il` in it. Without it the custom domain drops. It happened once (`3e098bd`, then `675300d`). The DNS record is `CNAME workshops` → `omri-il.github.io` at Hostinger, not the apex A records of the main site. HTTPS works since 2026-10-31: the certificate had never been issued, and the fix was to remove the custom domain in Settings → Pages and add it again.
- ⚠️ **The repo is public, and Pages serves every file in it, this one included.** No keys, no personal data, no addresses of private pages.

## State on 2026-11-12

Checked in this repo, not with Omri. Ask him before you change any of it.

- No workshop folder exists. Only `_template/` is here.
- `index.html` links to `./classroom-2026-06/during.html`, which is missing. That link returns 404 on the live site.
- `assets/script.js` holds `GOOGLE_SCRIPT_URL = "REPLACE_WITH_APPS_SCRIPT_URL"`, so the email form on an "after" page saves nothing. `SETUP.md` step 2 is open.

## Rules

- Hebrew, right to left. Logical CSS only (`margin-inline-start`, not `margin-left`). The `hebrew-rtl` skill holds the rules.
- Email capture posts to one Apps Script web app → one Google Sheet → n8n → Resend. The `workshop_name` hidden field tells the workshops apart. The chain is in `SETUP.md`.
- Every page loads Microsoft Clarity (tag `w1ajcl9gof`) from `clarity.ms`, and `trackEvent()` in `assets/script.js` reports funnel steps to it.
- Per-workshop values belong in the HTML: the date on `#countdown[data-event-date]` (Israel time, `+03:00`) and the name in `#workshop_name`. That is what keeps `assets/script.js` the same for every workshop.
