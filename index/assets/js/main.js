/*===== MENU SHOW (improved for accessibility and toggle state) =====*/ 
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId);

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show');
            toggle.classList.toggle('active');
            // Accessibility
            const isOpen = nav.classList.contains('show');
            toggle.setAttribute('aria-expanded', isOpen);
            nav.setAttribute('aria-hidden', !isOpen);
        });

        // Close menu with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('show')) {
                nav.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                nav.setAttribute('aria-hidden', 'true');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('show')) {
                nav.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                nav.setAttribute('aria-hidden', 'true');
            }
        });
    }
};
showMenu('nav-toggle', 'nav-menu');

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link');

function linkAction() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    navMenu.classList.remove('show');
    // Also remove active class from toggle button
    if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
    }
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]');

const scrollActive = () => {
    const scrollDown = window.scrollY;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

        if (sectionsClass) { // Fix: check for null
            if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
                sectionsClass.classList.add('active-link');
            } else {
                sectionsClass.classList.remove('active-link');
            }
        }
    });
};
window.addEventListener('scroll', scrollActive);

/*===== SCROLL REVEAL ANIMATION =====*/
if (typeof ScrollReveal !== 'undefined') { // Fix: check if ScrollReveal is loaded
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2000,
        delay: 200,
        // reset: true
    });    
    sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text', {});
    sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img', { delay: 400 });
    sr.reveal('.home__social-icon', { interval: 200 });
    sr.reveal('.skills__data, .work__img, .contact__input', { interval: 200 });    
    sr.reveal('.highlight__item', {
        interval: 200,
        origin: 'top',
        distance: '30px',
        duration: 1000,
        delay: 200,
        scale: 0.9
    });

    // Case studies converging animations
    sr.reveal('.case__item:nth-child(1)', {
        origin: 'left',
        distance: '100px',
        duration: 1000,
        delay: 200,
        scale: 0.9
    });
    sr.reveal('.case__item:nth-child(2)', {
        origin: 'bottom',
        distance: '100px',
        duration: 1000,
        delay: 300,
        scale: 0.9
    });
    sr.reveal('.case__item:nth-child(3)', {
        origin: 'right',
        distance: '100px',
        duration: 1000,
        delay: 400,
        scale: 0.9
    });
    sr.reveal('.case__item:nth-child(4)', {
        origin: 'bottom',
        distance: '100px',
        duration: 1000,
        delay: 500,
        scale: 0.9
    });
}

// Contact form handler
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.contact__form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            // Get form elements
            const nameInput = form.querySelector('input[name="name"]');
            const emailInput = form.querySelector('input[name="email"]');
            const messageInput = form.querySelector('textarea[name="message"]');
            const submitButton = form.querySelector('button[type="submit"]');

            if (!nameInput || !emailInput || !messageInput) {
                alert('Form fields are missing in the HTML.');
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }            
            try {
                submitButton.disabled = true;
                const res = await fetch('https://thedani.onrender.com/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        message
                    })
                });

                if (res.ok) {
                    form.reset();
                    alert('Message sent successfully!');
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.error || 'Failed to send message.');
                }
            } catch (err) {
                alert('Server error. Please try again later.');
            } finally {
                submitButton.disabled = false;
            }
        });
    }
});
