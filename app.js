let slideIndex = 1;
        let slideTimer;

        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Mobile dropdown toggle
        function toggleMobileDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            dropdown.classList.toggle('hidden');
        }

        // Slider functionality - Only left to right fade transition
        function showSlides(n) {
            const slides = document.querySelectorAll('.slide');
            const dots = document.querySelectorAll('.dot');
            
            if (n > slides.length) { slideIndex = 1; }
            if (n < 1) { slideIndex = slides.length; }
            
            // Hide all slides
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.opacity = '0';
            }
            
            // Show current slide
            slides[slideIndex - 1].style.opacity = '1';
            
            // Reset all dots
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.remove('bg-white');
                dots[i].classList.add('bg-white/50');
            }
            
            // Highlight current dot
            dots[slideIndex - 1].classList.remove('bg-white/50');
            dots[slideIndex - 1].classList.add('bg-white');
        }

        function currentSlide(n) {
            clearInterval(slideTimer);
            slideIndex = n;
            showSlides(slideIndex);
            autoSlide();
        }

        function nextSlide() {
            slideIndex++;
            if (slideIndex > document.querySelectorAll('.slide').length) {
                slideIndex = 1;
            }
            showSlides(slideIndex);
        }

        function autoSlide() {
            slideTimer = setInterval(nextSlide, 4000);
        }

        // Initialize slider
        document.addEventListener('DOMContentLoaded', function() {
            showSlides(slideIndex);
            autoSlide();
        });
        //  social media  js code 
        const socialBtn = document.getElementById('socialBtn');
        const videosBtn = document.getElementById('videosBtn');
        const socialContent = document.getElementById('socialContent');
        const videosContent = document.getElementById('videosContent');
        
        // Social Media Icons
        const twitterIcon = document.getElementById('twitterIcon');
        const facebookIcon = document.getElementById('facebookIcon');
        const instagramIcon = document.getElementById('instagramIcon');
        const youtubeIcon = document.getElementById('youtubeIcon');

        // Toggle Functions
        function showSocial() {
            // Update button states
            socialBtn.classList.add('active-btn');
            socialBtn.classList.remove('inactive-btn');
            videosBtn.classList.add('inactive-btn');
            videosBtn.classList.remove('active-btn');
            
            // Show/hide content with fade effect
            videosContent.classList.add('fade-out', 'hidden');
            videosContent.classList.remove('fade-in');
            
            setTimeout(() => {
                socialContent.classList.remove('fade-out', 'hidden');
                socialContent.classList.add('fade-in');
            }, 300);
        }

        function showVideos() {
            // Update button states
            videosBtn.classList.add('active-btn');
            videosBtn.classList.remove('inactive-btn');
            socialBtn.classList.add('inactive-btn');
            socialBtn.classList.remove('active-btn');
            
            // Show/hide content with fade effect
            socialContent.classList.add('fade-out', 'hidden');
            socialContent.classList.remove('fade-in');
            
            setTimeout(() => {
                videosContent.classList.remove('fade-out', 'hidden');
                videosContent.classList.add('fade-in');
            }, 300);
        }

        // Event Listeners for Toggle Buttons
        socialBtn.addEventListener('click', showSocial);
        videosBtn.addEventListener('click', showVideos);

        // Social Media Icon Click Handlers
        twitterIcon.addEventListener('click', () => {
            window.open('https://twitter.com/AamAadmiParty', '_blank');
        });

        facebookIcon.addEventListener('click', () => {
            window.open('https://www.facebook.com/AamAadmiParty/', '_blank');
        });

        instagramIcon.addEventListener('click', () => {
            window.open('https://www.instagram.com/aamaadmiparty/', '_blank');
        });

        youtubeIcon.addEventListener('click', () => {
            window.open('https://www.youtube.com/@aamaadmiparty', '_blank');
        });

        // Add click feedback animation
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                }, 100);
            });
        });

        // Add button click feedback
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            });
        });

        // Initialize page - show social content by default
        document.addEventListener('DOMContentLoaded', () => {
            showSocial();
        });

        // Add hover effects for cards
        document.querySelectorAll('.bg-gray-50').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') {
                showSocial();
            } else if (e.key === '2') {
                showVideos();
            }
        });

        // Add loading animation for content switching
        function showLoadingAnimation(targetElement) {
            targetElement.innerHTML = `
                <div class="flex justify-center items-center h-64">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-aap-orange"></div>
                </div>
            `;
        }

        // Enhanced console logging for debugging
        console.log('AAP Social Media Feed initialized successfully');
        console.log('Available keyboard shortcuts: Press 1 for Social, 2 for Videos');
    

  document.addEventListener("DOMContentLoaded", function () {
    const dataRow = document.getElementById("dataRow");
    const noRecord = document.getElementById("noRecord");

    // Hide "No record" text
    noRecord.style.display = "none";

    // Show data row
    dataRow.classList.remove("hidden");
  });
