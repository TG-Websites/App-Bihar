const baseUrl = "https://backend.aapbihar.org";
// ✅ Populate both desktop and mobile dropdowns
async function fetchWings() {
    try {
        const response = await fetch(`${baseUrl}/wings`);
        const result = await response.json();
        const wings = result.data;

        const desktopDropdown = document.getElementById("leader-dropdown-desktop");
        const mobileDropdown = document.getElementById("leader-dropdown-mobile");

        if (desktopDropdown) {
            desktopDropdown.innerHTML = "";
        }
        if (mobileDropdown) {
            mobileDropdown.innerHTML = "";
        }

        wings.forEach((wing, index) => {
            if (wing.name) {
                // Determine the correct link based on index
                let page = "main_wing.html"; // default
                if (index === 1) page = "youth.html";

                // Desktop
                if (desktopDropdown) {
                    const a1 = document.createElement("a");
                    a1.href = `/${page}?id=${wing._id}`;
                    a1.className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition";
                    a1.textContent = wing.name;
                    desktopDropdown.appendChild(a1);
                }

                // Mobile
                if (mobileDropdown) {
                    const a2 = document.createElement("a");
                    a2.href = `/${page}?id=${wing._id}`;
                    a2.className = "block px-3 py-2 text-sm hover:text-hover";
                    a2.textContent = wing.name;
                    mobileDropdown.appendChild(a2);
                }
            }
        });
    } catch (err) {
        console.error("❌ Failed to fetch wings:", err);
    }
}

window.addEventListener("DOMContentLoaded", fetchWings);