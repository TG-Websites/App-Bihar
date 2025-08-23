const API_BASE_URL = "http://localhost:8000";

// --- helpers ---
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

// --- list page (unchanged UI logic, themed card) ---
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

// --- detail page ---
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
        const statusClass = (s) => {
            switch (s) {
                case "active": return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300";
                case "scheduled": return "bg-amber-100 text-amber-800 ring-1 ring-amber-300";
                case "completed": return "bg-blue-100 text-blue-800 ring-1 ring-blue-300";
                case "archived": return "bg-gray-200 text-gray-800 ring-1 ring-gray-300";
                default: return "bg-gray-100 text-gray-800 ring-1 ring-gray-300";
            }
        };

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
            ? `
    <img src="${c.bannerImage}" alt="${escapeHtml(c.title)}"
         class="w-full h-72 md:h-96 object-cover rounded-t-2xl"/>
  `
            : `
    <div class="w-full h-56 md:h-72 rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
      No Image
    </div>
  `;

        container.innerHTML = `
  <article class="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    ${banner}

    <div class="p-6 md:p-8">
      <!-- Title + Status -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">${escapeHtml(c.title)}</h1>
        
      </div>

      <!-- Meta chips -->
      <div class="flex flex-wrap gap-2 mb-6">
        ${dateRange}
        ${chips.join("")}
      </div>

      <!-- Description -->
      <div class="prose max-w-none prose-p:leading-relaxed prose-headings:mt-6 prose-headings:mb-3 prose-p:mt-0 prose-p:mb-4 text-gray-800">
        <p>${escapeHtml(c.description || "")}</p>
      </div>

      <!-- Tags -->
      ${tags ? `<div class="mt-6 flex flex-wrap gap-2">${tags}</div>` : ""}
    </div>
  </article>
`;

        // load comments after detail is in place
        loadComments(campaignId);
    } catch (err) {
        console.error("Error loading campaign detail:", err);
        container.innerHTML = `<p class="text-red-400 p-6">Error loading campaign details. Please try again later.</p>`;
    }
}

// --- comments list ---
async function loadComments(campaignId) {
    const listEl = document.getElementById("comments-section");
    const countEl = document.getElementById("comments-count");
    if (!listEl) return;

    // skeleton
    listEl.innerHTML = `
    <div class="space-y-3">
      ${Array.from({ length: 3 }).map(() => `
        <div class="bg-primary-light/70 backdrop-blur rounded-xl border border-white/10 p-4 animate-pulse">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-white/10"></div>
            <div class="h-4 w-40 bg-white/10 rounded"></div>
          </div>
          <div class="h-3 w-full bg-white/10 rounded mb-2"></div>
          <div class="h-3 w-2/3 bg-white/10 rounded"></div>
        </div>
      `).join("")}
    </div>
  `;
    if (countEl) countEl.textContent = "";

    try {
        const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/comments`);
        const result = await res.json();

        if (!result.success) {
            listEl.innerHTML = `<p class="text-red-300">Failed to load comments: ${escapeHtml(result.message || "Unknown error")}</p>`;
            return;
        }

        const data = Array.isArray(result.data) ? result.data : [];
        if (countEl) countEl.textContent = `${data.length} comment${data.length === 1 ? "" : "s"}`;

        if (data.length === 0) {
            listEl.innerHTML = `
        <div class="bg-primary-light/70 backdrop-blur rounded-xl border border-white/10 p-6 text-center">
          <p class="text-white/80">No feedback yet. Be the first to share your thoughts.</p>
        </div>`;
            return;
        }

        listEl.innerHTML = data.map(c => {
            const name = c?.user?.name || c?.name || "Anonymous";
            const initials = getInitials(name);
            const when = c?.createdAt ? new Date(c.createdAt).toLocaleString() : "";
            const text = c.comment || c.text || "";

            return `
        <div class="bg-primary-light/80 backdrop-blur rounded-2xl border border-white/10 p-5">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-full bg-amber-400/20 text-amber-300 grid place-items-center font-semibold">
              ${escapeHtml(initials)}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-white font-medium">${escapeHtml(name)}</span>
                <span class="text-xs text-white/50">${escapeHtml(when)}</span>
              </div>
              <p class="mt-2 text-white/90 leading-relaxed">${escapeHtml(text)}</p>
            </div>
          </div>
        </div>`;
        }).join("");
    } catch (err) {
        console.error("Error loading comments:", err);
        listEl.innerHTML = `<p class="text-red-300">Error loading comments. Please try again later.</p>`;
    }
}

// --- add comment ---
async function addComment(campaignId, commentText) {
    const btn = document.getElementById("add-comment-btn");
    const errEl = document.getElementById("comment-error");
    if (errEl) errEl.classList.add("hidden");

    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Posting…";
        }

        const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: commentText })
        });
        const result = await res.json();

        if (!result.success) {
            if (errEl) {
                errEl.textContent = result.message || "Failed to add comment.";
                errEl.classList.remove("hidden");
            } else {
                alert(`Failed to add comment: ${result.message}`);
            }
            return;
        }

        // Success: clear textarea and reload list
        document.getElementById("comment-text").value = "";
        await loadComments(getQueryParam("id"));
    } catch (err) {
        console.error("Error adding comment:", err);
        if (errEl) {
            errEl.textContent = "Error adding comment. Please try again later.";
            errEl.classList.remove("hidden");
        } else {
            alert("Error adding comment. Please try again later.");
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Add Comment";
        }
    }
}

// --- boot ---
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("campaign_detail.html")) {
        loadCampaignDetail();
        document.getElementById("add-comment-btn").addEventListener("click", () => {
            const campaignId = getQueryParam("id");
            const txtEl = document.getElementById("comment-text");
            const text = txtEl.value.trim();
            if (!campaignId) return alert("Campaign ID missing.");
            if (!text) return alert("Comment cannot be empty.");
            addComment(campaignId, text);
        });
    } else if (window.location.pathname.includes("campaign.html")) {
        loadCampaigns();
    }
});
