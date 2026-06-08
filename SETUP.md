# One-time setup

Do these once. After that, every new workshop is just an HTML folder + `git push`.

---

## 1. Custom subdomain (Hostinger DNS → GitHub Pages)

1. In **Hostinger → DNS / Nameservers** for `omri-iram.co.il`, add a record:
   - **Type:** `CNAME`
   - **Name / Host:** `workshops`
   - **Target / Value:** `omri-il.github.io`
   - **TTL:** default
2. This is independent of the root `@` A-record (which still points at the VPS / WordPress —
   the main site is unaffected).
3. In the GitHub repo → **Settings → Pages**, the custom domain should auto-fill from the
   `CNAME` file (`workshops.omri-iram.co.il`). Once DNS propagates (minutes–1 hr), tick
   **Enforce HTTPS**.

Verify: `https://workshops.omri-iram.co.il/` loads the index page over HTTPS.

---

## 2. Google Sheet + Apps Script (form backend — shared by all workshops)

One sheet captures every workshop's signups; the `workshop_name` column tells them apart.

1. Create a Google Sheet named **`Workshop Attendees`** with a header row:

   | שם | אימייל | workshop_name | תאריך |
   |----|--------|---------------|-------|

2. In the sheet: **Extensions → Apps Script**, paste this, then **Deploy → New deployment →
   Web app**, *Execute as me*, *Who has access: Anyone*. Copy the Web App URL.

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Workshop Attendees")
                 || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.name || "",
       data.email || "",
       data.workshop_name || "",
       data.timestamp || new Date().toLocaleString("he-IL")
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({ result: "ok" }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Paste the Web App URL into [`assets/script.js`](./assets/script.js) →
   `const GOOGLE_SCRIPT_URL = "…";`  Commit & push.

Verify: open any workshop's `after.html`, submit the form, confirm a new row appears in the sheet.

---

## 3. n8n workflow (recap email + Resend contact)

Follow the rules in the `workshop-signup-system` skill (`~/.claude/skills/workshop-signup-system/SKILL.md`):
**all branches parallel from the trigger.** Base URL `https://n8n.srv1038526.hstgr.cloud/api/v1`,
key in a local `.env` (never committed).

```
New Row (Google Sheets Trigger on "Workshop Attendees", event "Row Added", polls 1 min)
  ├─→ Send recap email   (HTTP Request → Resend API, from omri@mail.omri-iram.co.il)
  │     subject + body include the voucher code + recording link.
  │     Pick the right copy per workshop by branching on {{ $json['workshop_name'] }}.
  └─→ Add to Resend Contacts (HTTP Request → Resend Contacts API)
        properties: { workshop_name, signup_source: 'workshop_after' }
        segments: [ <master_segment_id> ]
```

Resend contact body (Code/HTTP node):
```javascript
{{ JSON.stringify({
  email: $json['אימייל'],
  first_name: $json['שם'],
  properties: { workshop_name: $json['workshop_name'], signup_source: 'workshop_after' },
  segments: ['<master_segment_id>']
}) }}
```

After creating/updating via API, click **Publish** in the n8n UI if the change didn't take effect.

Verify: submit the form → recap email arrives from `omri@mail.omri-iram.co.il`, and the contact
appears in Resend with the correct `workshop_name`.

---

## Checklist

- [ ] CNAME record `workshops → omri-il.github.io` added in Hostinger
- [ ] GitHub Pages custom domain set + Enforce HTTPS on
- [ ] `Workshop Attendees` sheet + Apps Script deployed
- [ ] `GOOGLE_SCRIPT_URL` pasted into `assets/script.js` and pushed
- [ ] n8n workflow built, published, and test-fired
- [ ] Main site `omri-iram.co.il` still loads normally
