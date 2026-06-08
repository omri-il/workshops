# workshops — `workshops.omri-iram.co.il`

Branded pages for Omri's workshops, hosted free on **GitHub Pages** under the
subdomain `workshops.omri-iram.co.il`. Each workshop gets two pages:

- **During** — agenda, instructions, materials, the live link.
- **After** — bio, ways to connect, a discount voucher, the recording, and an email-capture form.

Everything is static (vanilla HTML/CSS/JS, no build step). Email capture reuses the existing
Google Sheets → n8n → Resend pipeline — see [`SETUP.md`](./SETUP.md).

## Structure

```
workshops/
├── CNAME                # workshops.omri-iram.co.il  (custom-domain mapping for Pages)
├── index.html           # branded landing that lists the workshops
├── assets/
│   ├── style.css        # shared brand styling (Hebrew RTL, Heebo, peach/orange)
│   └── script.js        # shared: countdown + form POST + voucher copy + Clarity
├── _template/           # copy this to start a new workshop — DON'T edit in place
│   ├── during.html
│   └── after.html
└── <workshop-slug>/     # one folder per workshop
    ├── during.html      # → workshops.omri-iram.co.il/<slug>/during.html
    └── after.html       # → workshops.omri-iram.co.il/<slug>/after.html
```

## Add a new workshop

Easiest: just tell Claude Code **"create a workshop page for &lt;name&gt; on &lt;date&gt;"**.
Manually, the steps are:

1. **Copy the template** to a new slug folder (lowercase, dashes, e.g. `classroom-2026-06`):
   ```powershell
   Copy-Item -Recurse "_template" "classroom-2026-06"
   ```
2. **Fill in the `<!-- REPLACE -->` markers** in `during.html` and `after.html`:
   - title, kicker, description, date/time/place tags
   - `#countdown` `data-event-date` (Israel time, `+03:00`) on the During page
   - agenda items + materials links
   - voucher code + redeem link, YouTube `/embed/` URL, connect links on the After page
   - the hidden `#workshop_name` value on the After page (tags the lead in the Sheet/n8n)
3. **Add a row** linking to it in the root `index.html` (optional).
4. **Commit & push** — live within ~1 min:
   ```powershell
   git add . ; git commit -m "Add classroom-2026-06 workshop pages" ; git push
   ```

Share `…/<slug>/during.html` before/at the workshop, and `…/<slug>/after.html` afterward.

## One-time setup

- **DNS + Pages + Apps Script + n8n:** see [`SETUP.md`](./SETUP.md).
- `GOOGLE_SCRIPT_URL` in `assets/script.js` must hold the deployed Apps Script Web App URL
  (one shared backend for every workshop).

## Notes

- The same `assets/` is shared by every workshop — never duplicate it per folder.
- Voucher is shown inline (not email-gated) to keep friction low; the email form is additive.
- Custom domain is a **CNAME** (`→ omri-il.github.io`), independent of the main site's A-record.
