/* public/js/vision.js */

(function () {
    // ---- CONFIG ----
    const options = {
        endpoint: "https://test-api.aapbihar.org/visions",                       // API URL
        wrapperSelector: ".vision-swiper .swiper-wrapper",  // Slides container
        swiperSelector: ".vision-swiper",                   // Swiper root (for init)
        nav: { next: ".vision-next", prev: ".vision-prev" },
        cardWidthClass: "w-[320px]",
        cardHeightClass: "h-[500px]",
        maxPoints: null, // e.g. 6 to limit items, or null for all
        initSwiper: true, // set false if you init elsewhere
        swiperConfig: {
            direction: "horizontal",
            slidesPerView: 1,
            spaceBetween: 24,
            loop: false,
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: {},
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
        },
    };

    // ---- HELPERS ----
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const escapeHtml = (str) =>
        String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    function createPointItem(text) {
        const li = document.createElement("li");
        li.className = "flex gap-3";
        const dot = document.createElement("span");
        dot.className = "mt-2 w-2 h-2 rounded-full bg-amber-400 shrink-0";
        const p = document.createElement("p");
        p.className = "text-white/90 text-sm";
        p.textContent = text;
        li.appendChild(dot);
        li.appendChild(p);
        return li;
    }

    function createSlideCard({ title, image, icon, points }) {
        const slide = document.createElement("div");
        slide.className = "swiper-slide !w-auto";

        const article = document.createElement("article");
        article.className = `bg-primary-light rounded-2xl shadow-lg ${options.cardWidthClass} ${options.cardHeightClass} flex flex-col p-6`;

        // Header: icon + title
        const head = document.createElement("div");
        head.className = "flex items-center gap-3 mb-4";

        const iconBox = document.createElement("div");
        iconBox.className = "w-10 h-10 rounded-xl bg-white/20 grid place-items-center text-2xl overflow-hidden";
        if (icon) {
            const img = document.createElement("img");
            img.src = icon;
            img.alt = "icon";
            img.className = "w-7 h-7 object-contain";
            iconBox.appendChild(img);
        } else {
            iconBox.textContent = "⭐";
        }

        const h3 = document.createElement("h3");
        h3.className = "text-lg font-semibold text-white";
        h3.textContent = title || "Untitled";

        head.appendChild(iconBox);
        head.appendChild(h3);

        // Main image
        const poster = document.createElement("img");
        poster.className = "w-full h-32 object-cover rounded-xl mb-4";
        poster.alt = escapeHtml(title || "Vision");
        poster.src =
            image ||
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop";

        // Points list
        const ul = document.createElement("ul");
        ul.className = "space-y-2 flex-1 overflow-hidden";

        const list = Array.isArray(points) ? points : [];
        const toRender =
            typeof options.maxPoints === "number"
                ? list.slice(0, options.maxPoints)
                : list;

        if (toRender.length === 0) {
            ul.appendChild(createPointItem("No points provided."));
        } else {
            toRender.forEach((pt) => ul.appendChild(createPointItem(pt)));
        }

        article.appendChild(head);
        article.appendChild(poster);
        article.appendChild(ul);
        slide.appendChild(article);
        return slide;
    }

    function createInfoSlide(message) {
        const slide = document.createElement("div");
        slide.className = "swiper-slide !w-auto";
        slide.innerHTML = `
      <article class="bg-primary-light rounded-2xl shadow-lg w-[320px] h-[180px] flex items-center justify-center p-6">
        <p class="text-white/80 text-sm text-center">${escapeHtml(message)}</p>
      </article>
    `;
        return slide;
    }

    async function loadVisions() {
        const wrapper = qs(options.wrapperSelector);
        if (!wrapper) return;

        try {
            // Optional: skeleton
            wrapper.appendChild(createInfoSlide("Loading visions..."));

            const res = await fetch(options.endpoint, { credentials: "include" });
            const json = await res.json();

            // Clear skeleton
            wrapper.innerHTML = "";

            const data = Array.isArray(json?.data) ? json.data : [];
            if (data.length === 0) {
                wrapper.appendChild(createInfoSlide("No visions found."));
            } else {
                data.forEach((v) =>
                    wrapper.appendChild(
                        createSlideCard({
                            title: v.title,
                            image: v.image,
                            icon: v.icon,
                            points: v.points,
                        })
                    )
                );
            }

            // Init Swiper (once)
            if (options.initSwiper && typeof Swiper !== "undefined") {
                if (!window.visionSwiper) {
                    const cfg = { ...options.swiperConfig };
                    cfg.navigation = {
                        nextEl: options.nav.next,
                        prevEl: options.nav.prev,
                    };
                    window.visionSwiper = new Swiper(options.swiperSelector, cfg);
                } else if (window.visionSwiper.update) {
                    window.visionSwiper.update();
                }
            }
        } catch (err) {
            wrapper.innerHTML = "";
            wrapper.appendChild(createInfoSlide("Failed to load visions."));
            // Optional: console error for debugging
            // console.error("Vision fetch error:", err);
        }
    }

    // Boot
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadVisions);
    } else {
        loadVisions();
    }
})();
