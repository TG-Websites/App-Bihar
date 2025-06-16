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