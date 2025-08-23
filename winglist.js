const baseUrl = "http://localhost:8000";

// ✅ Populate both desktop and mobile dropdowns (themed)
async function fetchWings() {
    try {
        const response = await fetch(`${baseUrl}/wings`);
        const result = await response.json();
        const wings = result?.data || [];

        const desktopDropdown = document.getElementById("leader-dropdown-desktop");
        const mobileDropdown = document.getElementById("leader-dropdown-mobile");

        // Optional: ensure containers use themed bg (if you're controlling container styles here)
        if (desktopDropdown) {
            desktopDropdown.innerHTML = "";
            desktopDropdown.classList.add(
                "bg-primary-light", "text-white", "rounded-xl", "shadow-xl",
                "border", "border-white/10", "p-1", "space-y-1"
            );
        }
        if (mobileDropdown) {
            mobileDropdown.innerHTML = "";
            mobileDropdown.classList.add(
                "bg-primary-light", "text-white", "rounded-xl", "shadow-xl",
                "border", "border-white/10", "p-1", "space-y-1"
            );
        }

        wings.forEach((wing, index) => {
            if (!wing?.name) return;

            // Determine the correct link (kept same logic as yours)
            let page = "main_wing.html";


            // Common classes for themed link items
            const linkClass =
                "flex items-center gap-2 px-3 py-2 text-sm rounded-lg " +
                "hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary " +
                "transition-colors outline-none";

            // Create a small dot/icon for visual cue (SVG)
            const iconSVG = `
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/>
        </svg>`;

            // Desktop item
            if (desktopDropdown) {
                const a1 = document.createElement("a");
                a1.href = `/${page}?id=${wing._id}`;
                a1.className = linkClass;
                a1.innerHTML = `${iconSVG}<span>${wing.name}</span>`;
                desktopDropdown.appendChild(a1);
            }

            // Mobile item
            if (mobileDropdown) {
                const a2 = document.createElement("a");
                a2.href = `/${page}?id=${wing._id}`;
                a2.className = linkClass;
                a2.innerHTML = `${iconSVG}<span>${wing.name}</span>`;
                mobileDropdown.appendChild(a2);
            }
        });
    } catch (err) {
        console.error("❌ Failed to fetch wings:", err);
    }
}

window.addEventListener("DOMContentLoaded", fetchWings);
