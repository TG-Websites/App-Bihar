

async function fetchLeaders() {
    try {
        // Get wing ID from URL
        const params = new URLSearchParams(window.location.search);
        const wingId = params.get("id");

        if (!wingId) {
            console.error("❌ Missing wing ID in URL");
            return;
        }

        const response = await fetch(`${baseUrl}/wings/${wingId}/members`);
        const result = await response.json();
        const members = result?.data?.members || [];

        const container = document.getElementById("our-leader");
        if (!container) return;

        container.innerHTML = ""; // Clear existing content

        members.forEach(member => {
            const card = document.createElement("div");
            card.className = "group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2";

            card.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative p-6">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden ring-4 ring-hover/20 group-hover:ring-hover/60 transition-all duration-300">
            <img src="${member.image || 'https://via.placeholder.com/150'}" alt="${member.name || 'NA'}" class="w-full h-full object-cover">
          </div>
          <h3 class="text-lg font-bold text-primary group-hover:text-white transition-colors duration-300 text-center mb-2">${member.name || 'NA'}</h3>
          <p class="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300 text-center mb-3">${member.post || 'NA'}</p>
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
      `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error("❌ Failed to fetch leaders:", err);
    }
}

fetchLeaders();
