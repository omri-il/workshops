/* ============================================================
   Workshops — shared script (omri-iram.co.il)
   ONE file for every workshop. Per-workshop values live in the
   HTML (event date on #countdown[data-event-date], workshop name
   in the hidden #workshop_name field), so this file never changes.

   Backend (shared across ALL workshops):
   GOOGLE_SCRIPT_URL → Apps Script Web App → one Google Sheet → n8n → Resend.
   Paste the deployed Apps Script URL once, below.
   ============================================================ */

// ===== CONFIG (set once, shared by every workshop) =====
const GOOGLE_SCRIPT_URL = "REPLACE_WITH_APPS_SCRIPT_URL";

// ===== ANALYTICS =====
function trackEvent(name) {
  if (window.clarity) clarity("set", "funnel_step", name);
}

// ===== COUNTDOWN (During page) =====
// Reads target time from <div id="countdown" data-event-date="2026-06-20T19:00:00+03:00">
(function initCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const target = el.getAttribute("data-event-date");
  if (!target) return;
  const EVENT_DATE = new Date(target);
  const liveMsg = el.getAttribute("data-live-msg") || "הסדנה מתחילה!"; // "הסדנה מתחילה!"

  const pad = n => String(n).padStart(2, "0");
  function tick() {
    const diff = EVENT_DATE - new Date();
    if (diff <= 0) {
      el.innerHTML = '<span class="cd-live">' + liveMsg + "</span>";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const unit = (n, l) =>
      '<div class="cd-unit"><span class="cd-num">' + pad(n) + '</span><span class="cd-label">' + l + "</span></div>";
    const sep = '<span class="cd-sep">:</span>';
    el.innerHTML =
      unit(s, "שניות") + sep +  // שניות
      unit(m, "דקות")   + sep +      // דקות
      unit(h, "שעות")   + sep +      // שעות
      unit(d, "ימים");                // ימים
  }
  tick();
  setInterval(tick, 1000);
})();

// ===== EMAIL CAPTURE FORM (After page) =====
// Expects: #signup-form, #f-name, #f-email, hidden #workshop_name, #form-ok.
async function submitWorkshopForm() {
  const nameEl  = document.getElementById("f-name");
  const emailEl = document.getElementById("f-email");
  const btn     = document.getElementById("signup-btn");
  if (!nameEl || !emailEl) return;

  if (!nameEl.value.trim())  { nameEl.focus();  return; }
  if (!emailEl.value.trim() || !emailEl.validity.valid) { emailEl.focus(); return; }

  if (btn) { btn.disabled = true; btn.textContent = "שולח..."; } // שולח...

  const data = {
    name:          nameEl.value.trim(),
    email:         emailEl.value.trim(),
    workshop_name: (document.getElementById("workshop_name") || {}).value || "",
    timestamp:     new Date().toLocaleString("he-IL"),
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (_) { /* no-cors: response is opaque, assume success */ }

  trackEvent("workshop_after_signup");

  // Swap the form for a thank-you confirmation in place.
  const form = document.getElementById("signup-form");
  const ok   = document.getElementById("form-ok");
  if (form) form.style.display = "none";
  if (ok)   ok.style.display = "block";
}

// ===== VOUCHER: click-to-copy =====
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".v-code").forEach(function (code) {
    code.addEventListener("click", function () {
      const text = code.textContent.trim();
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      const hint = code.parentElement.querySelector(".v-copy-hint");
      if (hint) {
        const prev = hint.textContent;
        hint.textContent = "✓ הקוד הועתק!"; // ✓ הקוד הועתק!
        setTimeout(function () { hint.textContent = prev; }, 1800);
      }
      trackEvent("voucher_copied");
    });
  });
});
