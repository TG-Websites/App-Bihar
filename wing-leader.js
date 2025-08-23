// const baseUrl = "https://admin.aapbihar.org/";
async function fetchWingLeaders() {
  try {
    const response = await fetch(`${baseUrl}/wings`);
    const result = await response.json();
    const wings = result?.data || [];

    const container = document.getElementById("our-main-leader");
    if (!container) return;

    container.innerHTML = ""; // Clear existing content

    wings.forEach(wing => {
      const leader = wing.leader;
      const wingName = wing.name
      if (!leader) return;

      const { name, post, phone, image } = leader;

      const card = document.createElement("div");
      card.className = "group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-6 hover:scale-101 transition-all duration-500 ease-out overflow-hidden";

      card.innerHTML = `
        <!-- Card Header with Image -->
        <div class="relative h-48 overflow-hidden rounded-t-3xl">
          <img src="${image || 'https://via.placeholder.com/400x200'}"
               alt="${name || 'NA'}"
               class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ${wingName || 'NA'}
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-6">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">${name || 'NA'}</h3>
            <p class="text-indigo-600 font-semibold">${post || 'NA'}</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 cursor-pointer group/item">
              <div class="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <i class="fas fa-envelope text-white text-sm"></i>
              </div>
              <span class="text-gray-700 font-medium group-hover/item:text-orange-600 transition-colors duration-300">lk842569@gmail.com</span>
            </div>

            <div class="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer group/item">
              <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <i class="fas fa-phone text-white text-sm"></i>
              </div>
              <span class="text-gray-700 font-medium group-hover/item:text-emerald-600 transition-colors duration-300">+91 ${phone || 'NA'}</span>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-500 rounded-3xl"></div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Failed to fetch wing leaders:", err);
  }
}

fetchWingLeaders();
