document.addEventListener('DOMContentLoaded', () => {
    // Inject FontAwesome if missing (for hamburger icon)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(link);
    }

    const navbarHTML = `
    <nav class="shared-navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-brand">Rais Embroidery</a>
            <button class="mobile-menu-btn" aria-label="Toggle navigation">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="nav-menu">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="services.html">Services</a></li>
                <li><a href="reviews.html">Reviews</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </div>
    </nav>
    `;

    // Insert at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Mobile Toggle Logic
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.nav-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('show');
        });
    }

    // Scroll Effect for Homepage
    const nav = document.querySelector('.shared-navbar');
    // Target hero sections on Index, About, Contact, Reviews
    const heroSection = document.querySelector('header.hero, .page-header, section.hero');

    if (nav && heroSection) {
        nav.classList.add('home-navbar');
        
        // If not the main homepage hero, use dark text for transparent state
        if (!heroSection.matches('header.hero')) {
            nav.classList.add('dark-text');
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
});