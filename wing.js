/* /public/js/wing.js
   This script keeps your original Tailwind layout intact
   and only fills content into it from /api/wings/:id
*/

const API_BASE = "https://test-api.aapbihar.org"; // GET /api/wings/:id

// ------------ Utils ------------
function escapeHTML(str = "") {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function fetchWingById(id) {
    const res = await fetch(`${API_BASE}/wings/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Wing fetch failed: ${res.status}`);
    const json = await res.json();
    // expects { success, message, data }
    return json.data || json;
}
function splitTitleWithHighlight(title = "", highlight = "") {
    if (!title) return { before: "", highlight: "", after: "" };
    if (!highlight) return { before: title, highlight: "", after: "" };
    const idx = title.indexOf(highlight);
    if (idx === -1) return { before: title, highlight: "", after: "" };
    return {
        before: title.slice(0, idx),
        highlight,
        after: title.slice(idx + highlight.length),
    };
}

// ------------ HERO (in-place fill) ------------
function fillHeroSection(wing) {
    // try to find your exact hero section
    const heroSection =
        document.querySelector("section.bg-primary.pt-20.min-h-screen") ||
        document.querySelector("section.bg-primary.min-h-screen");
    if (!heroSection) return;

    const hero = wing?.hero || {};
    const image = hero.image || {};

    // Title (with highlight span)
    const h1 = heroSection.querySelector("h1");
    if (h1) {
        const parts = splitTitleWithHighlight(hero.title || "", hero.highlight || "");
        if (parts.highlight) {
            h1.innerHTML = `${escapeHTML(parts.before)}<span class="text-hover">${escapeHTML(parts.highlight)}</span>${escapeHTML(parts.after)}`;
        } else if (hero.title) {
            h1.textContent = hero.title;
        }
    }

    // Description paragraph (gray)
    const descP = heroSection.querySelector("p.text-gray-300");
    if (descP && hero.description) {
        descP.textContent = hero.description;
    }

    // Bullets container (keep classes, replace inner items)
    const bulletContainer = (() => {
        const candidates = heroSection.querySelectorAll(".space-y-4.text-base.sm\\:text-lg");
        for (const c of candidates) {
            if (c.querySelector(".fa-check-circle") || c.nextElementSibling?.className?.includes("pt-6")) return c;
        }
        return candidates[0] || null;
    })();
    if (bulletContainer && Array.isArray(hero.bullets)) {
        bulletContainer.innerHTML = hero.bullets
            .map(
                b => `
        <div class="flex items-center justify-center lg:justify-start space-x-3">
          <i class="fas fa-check-circle text-hover text-xl"></i>
          <span>${escapeHTML(b.text || "")}</span>
        </div>`
            )
            .join("");
    }

    // CTAs (buttons keep same classes)
    const ctasWrap = heroSection.querySelector(".flex.flex-col.sm\\:flex-row.pt-6");
    if (ctasWrap) {
        const btns = ctasWrap.querySelectorAll("button, a"); // original were <button>
        const primary = hero.ctas?.primary;
        const secondary = hero.ctas?.secondary;

        if (btns[0] && primary) {
            btns[0].textContent = primary.label || "Primary";
            // convert to navigation on click
            btns[0].onclick = () => (primary.href ? (window.location.href = primary.href) : null);
        }
        if (btns[1] && secondary) {
            btns[1].textContent = secondary.label || "Secondary";
            btns[1].onclick = () => (secondary.href ? (window.location.href = secondary.href) : null);
        }
    }

    // Right image + overlay caption/subtitle
    const heroImg = heroSection.querySelector("img.object-cover");
    if (heroImg) {
        if (image.url) heroImg.src = image.url;
        if (image.alt) heroImg.alt = image.alt;
    }
    const overlayH3 = heroSection.querySelector(".bg-gradient-to-t h3");
    if (overlayH3) overlayH3.textContent = image.caption || overlayH3.textContent || "";
    const overlayP = heroSection.querySelector(".bg-gradient-to-t p");
    if (overlayP) overlayP.textContent = hero.subtitle || overlayP.textContent || "";
}

// ------------ OUR LEADERS (heading + grid) ------------
function fillOurLeadersSection(wing) {
    const grid = document.getElementById("our-leader");
    if (!grid) return;

    // set heading + subtitle from ourLeadersSection
    const section = grid.closest("section");
    if (section) {
        const h2 = section.querySelector("h2");
        const p = section.querySelector("p.text-xl.text-gray-600");
        if (h2 && wing.ourLeadersSection?.title) h2.textContent = wing.ourLeadersSection.title;
        if (p && wing.ourLeadersSection?.subtitle) p.textContent = wing.ourLeadersSection.subtitle;
    }

    // Members only (skip leader)
    const members = Array.isArray(wing.members) ? wing.members : [];

    // Empty state
    if (!members.length) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-500">No leaders found.</p>`;
        return;
    }

    // Card design EXACTLY as provided, with dynamic values
    grid.innerHTML = members
        .map(m => {
            const img = m.image || "https://via.placeholder.com/300x300.png?text=Leader";
            const name = m.name || "Unknown";
            const post = m.post || m.role || "";
            return `
      <div
        class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        </div>
        <div class="relative p-6">
          <div
            class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden ring-4 ring-hover/20 group-hover:ring-hover/60 transition-all duration-300">
            <img src="${img}" alt="${escapeHTML(name)}" class="w-full h-full object-cover">
          </div>
          <h3
            class="text-lg font-bold text-primary group-hover:text-white transition-colors duration-300 text-center mb-2">
            ${escapeHTML(name)}</h3>
          <p
            class="text-sm text-gray-600 group-hover:text-gray-2 00 transition-colors duration-300 text-center mb-3">
            ${escapeHTML(post)}</p>
          <div class="flex justify-center space-x-3">
            <a href="#" class="text-primary group-hover:text-hover transition-colors duration-300">
              <i class="fab fa-twitter text-lg"></i>
            </a>
            <a href="#" class="text-primary group-hover:text-hover transition-colors duration-300">
              <i class="fab fa-instagram text-lg"></i>
            </a>
            <a href="#" class="text-primary group-hover:text-hover transition-colors duration-300">
              <i class="fab fa-linkedin text-lg"></i>
            </a>
          </div>
        </div>
      </div>`;
        })
        .join("");
}

// ------------ INIT ------------
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const wingId = params.get("id");
        if (!wingId) return;

        const wing = await fetchWingById(wingId);
        fillHeroSection(wing);
        fillOurLeadersSection(wing);
    } catch (e) {
        console.error("Wing page fill failed:", e);
    }
});
