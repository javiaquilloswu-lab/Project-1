/* ============================================================
   Uncle Brews — script.js
   ============================================================ */

// ── Navbar scroll effect ─────────────────────────────────────
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    if (window.scrollY > 80) {
        nav.style.background = 'rgba(44, 24, 16, 0.96)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        nav.style.background = '';
        nav.style.backdropFilter = '';
    }
});

// ── DOMContentLoaded — wire up everything ───────────────────
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile hamburger ---
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        // Close when a link is tapped
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- Sign-in form ---
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', e => {
            e.preventDefault();
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            if (!email || !password) { alert('Please fill in all fields.'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
            alert('Sign in successful! Redirecting…');
            window.location.href = 'index.html';
        });
    }

    // --- Add-to-cart ---
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            const item  = this.closest('.product-item');
            const name  = item.querySelector('h3').textContent;
            const price = item.querySelector('.price').textContent;
            const orig  = this.textContent;
            alert(`Added ${name} (${price}) to cart!`);
            this.textContent = 'Added! ✓';
            this.style.background = '#28a745';
            setTimeout(() => { this.textContent = orig; this.style.background = ''; }, 1600);
        });
    });

    // --- CTA (hero) button → scroll to featured or go to menu ---
    const ctaBtn = document.querySelector('.cta-button');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const featured = document.querySelector('.featured');
            featured ? featured.scrollIntoView({ behavior: 'smooth' }) : (window.location.href = 'menu.html');
        });
    }

    // --- Order Now (featured section) ---
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', () => alert('Redirecting to order platform…'));
    }

    // --- Menu item "Order Now" buttons ---
    document.querySelectorAll('.menu-item .order-now').forEach(btn => {
        btn.addEventListener('click', function () {
            const name = this.closest('.menu-item').querySelector('h3').textContent;
            alert(`Order placed for: ${name}!`);
        });
    });

    // --- Store selector ---
    const storeSelect = document.getElementById('store-select') || document.querySelector('.store-select');
    if (storeSelect) {
        storeSelect.addEventListener('change', function () {
            if (this.value) alert(`Showing deals for: ${this.value}`);
        });
    }

    // --- Smooth scroll for in-page anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    // --- Scroll-reveal animation ---
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity  = '1';
                e.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.product-item, .team-member, .gallery-item, .menu-item').forEach(el => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(28px)';
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        revealObs.observe(el);
    });

    // --- Leaflet map (only on find-branch page) ---
    if (document.getElementById('map')) {
        initMap();
    }
});

/* ============================================================
   Leaflet map — Find Branch page
   ============================================================ */
function initMap() {
    // Guard: Leaflet must be loaded
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded yet — retrying in 500ms');
        setTimeout(initMap, 500);
        return;
    }

    const branches = [
        {
            title:   'IT Park Branch',
            address: 'Cebu IT Park, Lahug, Cebu City',
            lat:     10.3310,
            lng:     123.9073
        },
        {
            title:   'Ayala Center Branch',
            address: 'Ayala Center Cebu, Cebu Business Park',
            lat:     10.3185,
            lng:     123.9054
        },
        {
            title:   'SM City Cebu Branch',
            address: 'SM City Cebu, North Reclamation Area',
            lat:     10.3119,
            lng:     123.9182
        }
    ];

    // Create map centered on Cebu City
    const map = L.map('map', { scrollWheelZoom: false }).setView([10.3200, 123.9100], 13);

    // Free OpenStreetMap tiles — no API key required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Custom orange marker icon
    const orangeIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:28px;height:28px;
            background:linear-gradient(135deg,#f4a261,#e76f51);
            border:3px solid #fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 3px 8px rgba(0,0,0,.3);
        "></div>`,
        iconSize:   [28, 28],
        iconAnchor: [14, 28],
        popupAnchor:[0, -30]
    });

    // Add markers and store reference
    branches.forEach(branch => {
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;

        branch.marker = L.marker([branch.lat, branch.lng], { icon: orangeIcon })
            .addTo(map)
            .bindPopup(`
                <div class="branch-info-window">
                    <h3>${branch.title}</h3>
                    <p>${branch.address}</p>
                    <a href="${dirUrl}" target="_blank" rel="noopener"
                       style="color:#e76f51;font-weight:600;font-size:.85rem;">
                        Get Directions →
                    </a>
                </div>
            `, { maxWidth: 220 })
            .bindTooltip(branch.title, { direction: 'top', offset: [0, -32] });
    });

    // Populate sidebar list
    const listEl = document.getElementById('branch-list');
    if (!listEl) return;

    branches.forEach(branch => {
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
        const li     = document.createElement('li');
        li.className = 'branch-item';
        li.innerHTML = `
            <h3>${branch.title}</h3>
            <p>${branch.address}</p>
            <div class="branch-actions">
                <button class="directions-btn" data-url="${dirUrl}">Get Directions</button>
            </div>
        `;

        // Click card body → fly to marker + highlight active card
        li.addEventListener('click', e => {
            if (e.target.classList.contains('directions-btn')) {
                window.open(e.target.dataset.url, '_blank', 'noopener');
                return;
            }
            // Remove active state from all cards
            listEl.querySelectorAll('.branch-item').forEach(el => el.classList.remove('active'));
            // Set active on clicked card
            li.classList.add('active');
            map.flyTo([branch.lat, branch.lng], 16, { duration: 1.2 });
            branch.marker.openPopup();
        });

        listEl.appendChild(li);
    });
}
