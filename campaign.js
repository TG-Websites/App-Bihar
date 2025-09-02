const API_BASE_URL = "https://backend.aapbihar.org";

/* ---------------------------------- UX ---------------------------------- */
function injectUX() {
  // Only inject once
  if (document.getElementById("app-loader-overlay")) return;

  // Styles (scoped to our ids/classes to avoid conflicts)
  const style = document.createElement("style");
  style.id = "app-ux-inline-style";
  style.textContent = `
    #app-loader-overlay {
      position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 9999;
    }
    .app-spinner {
      width: 54px; height: 54px; border-radius: 50%;
      border: 6px solid rgba(255,255,255,0.35);
      border-top-color: white; animation: app-spin 1s linear infinite;
    }
    @keyframes app-spin { to { transform: rotate(360deg); } }

    #app-success-modal {
      position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.4); z-index: 10000;
    }
    .app-modal-card {
      background: #ffffff; color: #111827; border-radius: 14px; width: min(92vw, 420px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden;
    }
    .app-modal-head {
      display: flex; align-items: center; gap: 10px; padding: 16px 18px; background: #fef3c7;
      border-bottom: 1px solid #fde68a;
    }
    .app-modal-title { font-weight: 700; font-size: 16px; color: #92400e; }
    .app-modal-body { padding: 18px; font-size: 14px; line-height: 1.5; color: #1f2937; }
    .app-modal-actions {
      padding: 14px 18px; display: flex; gap: 10px; justify-content: flex-end; background: #fafafa;
      border-top: 1px solid #e5e7eb;
    }
    .app-btn {
      padding: 10px 14px; border-radius: 10px; font-weight: 600; border: 1px solid transparent;
      cursor: pointer; transition: transform .03s ease-in-out, background .2s;
    }
    .app-btn:active { transform: translateY(1px); }
    .app-btn-primary { background: #fbbf24; color: #111827; }
    .app-btn-primary:hover { background: #f59e0b; }
  `;
  document.head.appendChild(style);

  // Loader overlay
  const overlay = document.createElement("div");
  overlay.id = "app-loader-overlay";
  overlay.innerHTML = `
    <div style="display:grid;place-items:center;gap:14px">
      <div class="app-spinner" aria-label="Loading"></div>
      <div style="color:#fff;font-weight:600">Submitting…</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Success modal
  const modal = document.createElement("div");
  modal.id = "app-success-modal";
  modal.innerHTML = `
    <div class="app-modal-card" role="dialog" aria-modal="true" aria-labelledby="app-success-title">
      <div class="app-modal-head">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#92400e" stroke-width="1.6" fill="#fde68a"></circle>
          <path d="M7 12.5l3.2 3.2L17 9" stroke="#92400e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <div id="app-success-title" class="app-modal-title">Feedback Submitted</div>
      </div>
      <div class="app-modal-body" id="app-success-message">Thanks! Your feedback has been recorded.</div>
      <div class="app-modal-actions">
        <button id="app-success-ok" class="app-btn app-btn-primary">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal on backdrop click or OK
  modal.addEventListener("click", (e) => {
    if (e.target.id === "app-success-modal") modal.style.display = "none";
  });
  document.getElementById("app-success-ok").addEventListener("click", () => {
    modal.style.display = "none";
  });
}

function showLoader(show) {
  const el = document.getElementById("app-loader-overlay");
  if (!el) return;
  el.style.display = show ? "flex" : "none";
}

function showSuccess(message = "Thanks! Your feedback has been recorded.") {
  const modal = document.getElementById("app-success-modal");
  const msg = document.getElementById("app-success-message");
  if (!modal) return;
  if (msg) msg.textContent = message;
  modal.style.display = "flex";
}

/* ------------------------------- Helpers ------------------------------- */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || "").join("") || "A";
}

/* --------------------------- List page (cards) -------------------------- */
async function loadCampaigns() {
  const campaignsContainer = document.getElementById("campaigns-container");
  if (!campaignsContainer) return;

  try {
    const response = await fetch(`${API_BASE_URL}/campaigns`);
    const result = await response.json();

    if (result.success) {
      campaignsContainer.innerHTML = "";
      result.data.forEach((c) => {
        campaignsContainer.innerHTML += `
          <div class="bg-primary-light/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
            ${c.bannerImage
            ? `<img class="w-full h-48 object-cover" src="${c.bannerImage}" alt="${escapeHtml(c.title)}">`
            : `<div class="w-full h-48 bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white/70 text-lg">No Image</div>`
          }
            <div class="p-6 flex flex-col flex-grow">
              <h2 class="text-xl font-bold text-amber-400 mb-2">${escapeHtml(c.title)}</h2>
              <p class="text-white/80 text-sm mb-4 flex-grow">${escapeHtml((c.description || "").slice(0, 120))}...</p>
              <a href="campaign_detail.html?id=${c._id}"
                 class="inline-block bg-amber-400 text-primary font-semibold px-5 py-2 rounded-xl hover:bg-amber-300 transition duration-200 self-start">
                View Details
              </a>
            </div>
          </div>`;
      });
    } else {
      campaignsContainer.innerHTML = `<p class="text-red-400">Failed to load campaigns: ${escapeHtml(result.message || "Unknown error")}</p>`;
    }
  } catch (err) {
    console.error("Error loading campaigns:", err);
    campaignsContainer.innerHTML = `<p class="text-red-400">Error loading campaigns. Please try again later.</p>`;
  }
}

/* ------------------------------ Detail page ----------------------------- */
async function loadCampaignDetail() {
  const container = document.getElementById("campaign-detail");
  const campaignId = getQueryParam("id");
  if (!container) return;

  if (!campaignId) {
    container.innerHTML = `<p class="text-red-400 p-6">Campaign ID not found.</p>`;
    return;
  }

  // skeleton
  container.innerHTML = `
    <div class="h-56 md:h-72 bg-gradient-to-br from-primary to-blue-900 animate-pulse"></div>
    <div class="p-6 md:p-8">
      <div class="h-7 w-56 bg-white/10 rounded mb-4 animate-pulse"></div>
      <div class="h-4 w-full bg-white/10 rounded mb-2 animate-pulse"></div>
      <div class="h-4 w-2/3 bg-white/10 rounded animate-pulse"></div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    const result = await res.json();
    if (!result.success) {
      container.innerHTML = `<p class="text-red-400 p-6">Failed to load campaign: ${escapeHtml(result.message || "Unknown error")}</p>`;
      return;
    }

    const c = result.data;
    const fmt = (d) => (d ? new Date(d).toLocaleDateString() : null);

    const chips = [];
    if (c.state?.name) chips.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white ring-1 ring-white/15">State: ${escapeHtml(c.state.name)}</span>`);
    if (c.district?.name) chips.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white ring-1 ring-white/15">District: ${escapeHtml(c.district.name)}</span>`);
    if (c.legislativeAssembly?.name) chips.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white ring-1 ring-white/15">LA: ${escapeHtml(c.legislativeAssembly.name)}</span>`);

    const tags = (Array.isArray(c.tags) ? c.tags : [])
      .slice(0, 8)
      .map(t => `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/90 ring-1 ring-white/10">#${escapeHtml(t)}</span>`)
      .join("");

    const dateRange = `
      ${fmt(c.startDate) ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white ring-1 ring-white/15">Starts: ${fmt(c.startDate)}</span>` : ""}
      ${fmt(c.endDate) ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white ring-1 ring-white/15">Ends: ${fmt(c.endDate)}</span>` : ""}
    `;

    const banner = c.bannerImage
      ? `<img src="${c.bannerImage}" alt="${escapeHtml(c.title)}" class="w-full h-72 md:h-96 object-cover rounded-t-2xl"/>`
      : `<div class="w-full h-56 md:h-72 rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">No Image</div>`;

    container.innerHTML = `
      <article class="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
        ${banner}
        <div class="p-6 md:p-8">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">"${escapeHtml(c.title)}"</h1>
          </div>
          <div class="flex flex-wrap gap-2 mb-6">
            ${dateRange}
            ${chips.join("")}
          </div>
          <div class="min-h-[300px] prose max-w-none prose-p:leading-relaxed prose-headings:mt-6 prose-headings:mb-3 prose-p:mt-0 prose-p:mb-4 text-gray-800">
            <p>${escapeHtml(c.description || "")}</p>
          </div>
          ${tags ? `<div class="mt-6 flex flex-wrap gap-2">${tags}</div>` : ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error("Error loading campaign detail:", err);
    container.innerHTML = `<p class="text-red-400 p-6">Error loading campaign details. Please try again later.</p>`;
  }
}

/* ------------------------- Submit feedback (POST) ------------------------ */
async function addFeedbackForm(campaignId, formData) {
  const btn = document.getElementById("add-feedback-form-btn");
  const errEl = document.getElementById("feedback-form-error");
  if (errEl) errEl.classList.add("hidden");

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting…";
    }
    showLoader(true);

    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/feedback-forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await res.json();

    if (!result.success) {
      if (errEl) {
        errEl.textContent = result.message || "Failed to add feedback form.";
        errEl.classList.remove("hidden");
      } else {
        alert(`Failed to add feedback form: ${result.message}`);
      }
      return;
    }

    // Success: clear form
    document.getElementById("feedback-form-name").value = "";
    document.getElementById("feedback-form-mobile").value = "";
    document.getElementById("feedback-form-state").value = "";
    document.getElementById("feedback-form-district").value = "";
    document.getElementById("feedback-form-vidhansabha").value = "";
    document.getElementById("feedback-form-support").checked = false;

    showSuccess("धन्यवाद! आपका फीडबैक सफलतापूर्वक जमा हो गया है।");
  } catch (err) {
    console.error("Error adding feedback form:", err);
    if (errEl) {
      errEl.textContent = "Error adding feedback form. Please try again later.";
      errEl.classList.remove("hidden");
    } else {
      alert("Error adding feedback form. Please try again later.");
    }
  } finally {
    showLoader(false);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Submit Feedback";
    }
  }
}

/* ---------------------------------- Boot --------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Inject loader + modal UI
  injectUX();

  if (window.location.pathname.includes("campaign_detail.html")) {
    loadCampaignDetail();

    // Attach event listener for feedback form submission
    const addFeedbackFormBtn = document.getElementById("add-feedback-form-btn");
    if (addFeedbackFormBtn) {
      addFeedbackFormBtn.addEventListener("click", () => {
        const campaignId = getQueryParam("id");
        const name = document.getElementById("feedback-form-name").value.trim();
        const mobile = document.getElementById("feedback-form-mobile").value.trim();
        const state = document.getElementById("feedback-form-state").value.trim();
        const district = document.getElementById("feedback-form-district").value.trim();
        const vidhansabha = document.getElementById("feedback-form-vidhansabha").value.trim();
        const support = document.getElementById("feedback-form-support").checked;

        if (!campaignId) return alert("Campaign ID missing.");
        if (!name || !mobile || !state || !district || !vidhansabha) return alert("Please fill all required feedback fields.");

        const formData = { name, mobile, state, district, vidhansabha, support };
        addFeedbackForm(campaignId, formData);
      });
    }
  } else if (window.location.pathname.includes("campaign.html")) {
    loadCampaigns();
  }
});
