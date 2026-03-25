// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Image loading animations
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-menu a[href^="#"]');

    function setActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Pricing Calculator
    const propertyType = document.getElementById('propertyType');
    const bedrooms = document.getElementById('bedrooms');
    const bathrooms = document.getElementById('bathrooms');
    const serviceType = document.getElementById('serviceType');
    const estimatePrice = document.getElementById('estimatePrice');

    function calculatePrice() {
        let basePrice = 0;
        
        // Base price by property type
        if (propertyType.value === 'apartment') basePrice = 300;
        else if (propertyType.value === 'house') basePrice = 400;
        else if (propertyType.value === 'office') basePrice = 500;
        else basePrice = 350;
        
        // Add for bedrooms
        basePrice += parseInt(bedrooms.value) * 100;
        
        // Add for bathrooms
        basePrice += parseInt(bathrooms.value) * 80;
        
        // Multiply by service type
        let multiplier = 1;
        if (serviceType.value === 'deep') multiplier = 2;
        else if (serviceType.value === 'after-event') multiplier = 1.5;
        
        const finalPrice = Math.round(basePrice * multiplier);
        const maxPrice = Math.round(finalPrice * 1.2);
        
        if (estimatePrice) {
            estimatePrice.textContent = `R ${finalPrice} - R ${maxPrice}`;
        }
    }

    if (propertyType) propertyType.addEventListener('change', calculatePrice);
    if (bedrooms) bedrooms.addEventListener('change', calculatePrice);
    if (bathrooms) bathrooms.addEventListener('change', calculatePrice);
    if (serviceType) serviceType.addEventListener('change', calculatePrice);

    // Time Slot Selection
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
        });
    });

    // Calendar with Date Generation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthDisplay = document.getElementById('currentMonth');
    const calendarDates = document.getElementById('calendarDates');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let currentDate = new Date();
    let selectedDate = null;

    function generateCalendar(year, month) {
        if (!calendarDates) return;
        
        calendarDates.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Previous month dates
        for (let i = firstDay - 1; i >= 0; i--) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date other-month';
            dateDiv.textContent = daysInPrevMonth - i;
            calendarDates.appendChild(dateDiv);
        }
        
        // Current month dates
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date';
            dateDiv.textContent = i;
            
            // Mark today
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dateDiv.classList.add('today');
            }
            
            // Click to select
            dateDiv.addEventListener('click', () => {
                document.querySelectorAll('.calendar-date').forEach(d => d.classList.remove('selected'));
                dateDiv.classList.add('selected');
                selectedDate = new Date(year, month, i);
            });
            
            calendarDates.appendChild(dateDiv);
        }
        
        // Next month dates to fill the grid (6 rows x 7 cols = 42 cells)
        const totalCells = 42;
        const filledCells = firstDay + daysInMonth;
        const remainingCells = totalCells - filledCells;
        
        for (let i = 1; i <= remainingCells; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date other-month';
            dateDiv.textContent = i;
            calendarDates.appendChild(dateDiv);
        }
    }

    function updateCalendar() {
        if (currentMonthDisplay) {
            currentMonthDisplay.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        });
    }

    // Initialize calendar
    updateCalendar();

    // Cookie Consent
    const cookieBanner = document.getElementById('cookieConsent');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (cookieBanner && !cookiesAccepted) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // Form submission handler
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !phone || !service) {
                alert('Please fill in all required fields.');
                return;
            }

            // Show success message
            const serviceNames = {
                'basic': 'Basic Cleaning',
                'after-event': 'After-event Cleaning',
                'deep': 'Deep Cleaning'
            };

            alert(`Thank you ${name}! Your request for ${serviceNames[service]} has been submitted. We will contact you at ${email} or ${phone} shortly.`);
            
            // Reset form
            quoteForm.reset();
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards for animation
    const animatedElements = document.querySelectorAll('.benefit-card, .service-card, .why-choose-list li, .testimonial-card, .gallery-card, .team-card, .blog-card, .faq-item, .process-step');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        observer.observe(el);
    });

    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
    });
});

// Cookie consent accept function (global scope for onclick)
function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    const cookieBanner = document.getElementById('cookieConsent');
    if (cookieBanner) {
        cookieBanner.classList.remove('show');
    }
}
