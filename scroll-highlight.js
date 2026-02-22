// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections and nav links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('a[data-target]');
    
    // Add click event to navigation links for smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Function to check which section is in view
    function highlightSection() {
        const scrollPos = window.scrollY + 200;
        
        // First, remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Then add active class to the current section's link
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Find and activate the matching nav link
                navLinks.forEach(link => {
                    if (link.getAttribute('data-target') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Smooth blending between sections - RIGHT WHERE THEY MEET
    function blendSections() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Get the about section and container2
        const aboutSection = document.getElementById('about');
        const container2 = document.querySelector('.container2');
        const homeContainer = document.querySelector('.container');
        
        if (aboutSection && container2) {
            const aboutTop = aboutSection.offsetTop;
            const aboutHeight = aboutSection.offsetHeight;
            const aboutBottom = aboutTop + aboutHeight;
            
            // Start blending RIGHT at the point where sections meet
            const blendStartPoint = aboutBottom - windowHeight * 0.3;
            
            // Blend between home and about section
            if (scrollY >= aboutTop - windowHeight && scrollY <= aboutTop + windowHeight) {
                const progress = (scrollY - (aboutTop - windowHeight)) / (windowHeight * 2);
                const opacity = Math.min(Math.max(progress, 0), 1);
                
                if (homeContainer) {
                    homeContainer.style.opacity = 1 - opacity * 0.5;
                }
            }
            
            // Smooth blend RIGHT where Spline ends and columns begin
            if (scrollY >= blendStartPoint) {
                const progress = (scrollY - blendStartPoint) / (windowHeight * 0.8);
                const opacity = Math.min(Math.max(progress, 0), 1);
                
                // Gradually fade in container2
                container2.style.opacity = opacity+2;
            } else {
                container2.style.opacity = 2;
            }
        }
    }
    
    // Combine both functions on scroll
    function onScroll() {
        highlightSection();
        blendSections();
    }
    
    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial call
});