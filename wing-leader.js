// const baseUrl = "https://test-api.aapbihar.org";
async function fetchWingLeaders() {
  try {
    const response = await fetch(`${baseUrl}/wings`);
    const result = await response.json();
    const wings = result?.data || [];

    const container = document.getElementById("our-main-leader");
    if (!container) return;

    container.innerHTML = ""; // Clear existing content

    wings.forEach((wing) => {
      const leader = wing.leader;
      const wingName = wing.name;
      if (!leader) return;

      const { name, post, phone, image, fbLink, instaLink, xLink } = leader;

      const card = document.createElement("div");
      card.className =
        "group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-6 hover:scale-101 transition-all duration-500 ease-out overflow-hidden";

      card.innerHTML = `
        <!-- Card Header -->
        <div class="relative h-48 overflow-hidden rounded-t-3xl">
          <img src="${image || "https://via.placeholder.com/400x200"
        }" alt="${name || "NA"}"
            class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ${wingName || "NA"}
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-6">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">${name || "NA"}</h3>
            <p class="text-indigo-600 font-semibold">${post || "NA"}</p>
          </div>

          <div class="space-y-3">
           

            <!-- Social Links -->
            <div class="flex space-x-4 justify-center mt-4">
              ${fbLink
          ? `<a href="${fbLink}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
                       <i class="fab fa-facebook-f"></i>
                     </a>`
          : ""
        }
              ${instaLink
          ? `<a href="${instaLink}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full text-white hover:opacity-90 transition">
                       <i class="fab fa-instagram"></i>
                     </a>`
          : ""
        }
              ${xLink
          ? `<a href="${xLink}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-black rounded-full text-white hover:bg-gray-800 transition">
                       <i class="fab fa-x-twitter"></i>
                     </a>`
          : ""
        }
            </div>
          </div>
        </div>

        
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Failed to fetch wing leaders:", err);
  }
}

fetchWingLeaders();
