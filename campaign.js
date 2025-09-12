const API_BASE_URL = "https://backend.aapbihar.org";

/* ---------------------------------- UX ---------------------------------- */
function injectUX() {
  if (document.getElementById("app-loader-overlay")) return;

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

  const overlay = document.createElement("div");
  overlay.id = "app-loader-overlay";
  overlay.innerHTML = `
    <div style="display:grid;place-items:center;gap:14px">
      <div class="app-spinner" aria-label="Loading"></div>
      <div style="color:#fff;font-weight:600">Submitting…</div>
    </div>
  `;
  document.body.appendChild(overlay);

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
async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}
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
          <div class="bg-primary-light/90 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
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

  container.innerHTML = `<div class="h-56 md:h-72 bg-gradient-to-br from-primary to-blue-900 animate-pulse"></div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    const result = await res.json();
    if (!result.success) {
      container.innerHTML = `<p class="text-red-400 p-6">Failed to load campaign.</p>`;
      return;
    }

    const c = result.data;
    const banner = c.bannerImage
      ? `<img src="${c.bannerImage}" alt="${escapeHtml(c.title)}" class="w-full h-72 md:h-96 object-cover rounded-t-2xl"/>`
      : `<div class="w-full h-56 md:h-72 bg-gray-200 flex items-center justify-center">No Image</div>`;

    container.innerHTML = `
      <article class="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
        ${banner}
        <div class="p-6 md:p-8">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">${escapeHtml(c.title)}</h1>
          <p class="text-gray-800">${escapeHtml(c.description || "")}</p>
        </div>
      </article>
    `;
  } catch (err) {
    console.error("Error loading campaign detail:", err);
    container.innerHTML = `<p class="text-red-400 p-6">Error loading campaign details.</p>`;
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

    // reset
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
  injectUX();

  if (window.location.pathname.includes("campaign_detail.html")) {
    loadCampaignDetail();

    const addFeedbackFormBtn = document.getElementById("add-feedback-form-btn");
    const stateSelect = document.getElementById("feedback-form-state");
    const districtSelect = document.getElementById("feedback-form-district");
    const vidhansabhaSelect = document.getElementById("feedback-form-vidhansabha");

    /* submit */
    if (addFeedbackFormBtn) {
      addFeedbackFormBtn.addEventListener("click", () => {
        const campaignId = getQueryParam("id");
        const name = document.getElementById("feedback-form-name").value.trim();
        const mobile = document.getElementById("feedback-form-mobile").value.trim();
        const state = stateSelect.value;
        const district = districtSelect.value;
        const vidhansabha = vidhansabhaSelect.value;
        const support = document.getElementById("feedback-form-support").checked;

        if (!campaignId) return alert("Campaign ID missing.");
        if (!name || !mobile || !state || !district || !vidhansabha) {
          return alert("Please fill all required fields.");
        }

        const formData = { name, mobile, state, district, vidhansabha, support };
        addFeedbackForm(campaignId, formData);
      });
    }

    /* dependent dropdowns */
    async function loadStates() {
      try {
        const response = await fetchData(`${API_BASE_URL}/states`);
        populateDropdown(stateSelect, response.data, "अपना राज्य चुनें");
      } catch (err) {
        console.error("Error loading states:", err);
      }
    }
    loadStates();

    stateSelect.addEventListener("change", async () => {
      const stateId = stateSelect.options[stateSelect.selectedIndex]?.dataset.id;
      districtSelect.disabled = true;
      vidhansabhaSelect.disabled = true;
      districtSelect.innerHTML = `<option value="">अपना जिला चुनें</option>`;
      vidhansabhaSelect.innerHTML = `<option value="">अपनी विधान सभा चुनें</option>`;

      if (stateId) {
        const response = await fetchData(`${API_BASE_URL}/districts?parentId=${stateId}`);
        populateDropdown(districtSelect, response.data, "अपना जिला चुनें");
        districtSelect.disabled = false;
      }
    });

    districtSelect.addEventListener("change", async () => {
      const districtId = districtSelect.options[districtSelect.selectedIndex]?.dataset.id;
      vidhansabhaSelect.disabled = true;
      vidhansabhaSelect.innerHTML = `<option value="">अपनी विधान सभा चुनें</option>`;

      if (districtId) {
        const response = await fetchData(`${API_BASE_URL}/legislative-assemblies?parentId=${districtId}`);
        populateDropdown(vidhansabhaSelect, response.data, "अपनी विधान सभा चुनें");
        vidhansabhaSelect.disabled = false;
      }
    });

    function populateDropdown(selectEl, items, placeholder) {
      if (!selectEl) return;
      selectEl.innerHTML = `<option value="">${placeholder}</option>`;
      items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;                 // DB में name जाएगा
        option.textContent = item.name;
        option.dataset.id = item._id || item.id;  // dependent fetch के लिए
        selectEl.appendChild(option);
      });
    }
  } else if (window.location.pathname.includes("campaign.html")) {
    loadCampaigns();
  }
});
