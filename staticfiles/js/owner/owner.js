// ── Panel / Menu Navigation ────────────────────────────────

/**
 * navigateTo(panelName)
 * Shows the panel with id="panel-{panelName}" and updates
 * the sidebar active state. Works for both sidebar nav items
 * and any [data-nav] links inside content panels.
 */

const panelTitles = {
    'dashboard':      { title: 'Dashboard',        sub: 'Here\'s your property overview.' },
    'add-property':   { title: 'Add Property',     sub: 'Fill in the details to list your property.' },
    'my-properties':  { title: 'My Properties',    sub: 'Manage all your listed properties.' },
    'bookings':       { title: 'Booking Requests',  sub: 'Review and manage tenant requests.' },
    'reviews':        { title: 'Reviews & Ratings', sub: 'What tenants say about your properties.' },
    'profile':        { title: 'Profile Settings',  sub: 'Manage your personal information.' },
    'notifications':  { title: 'Notifications',     sub: 'Stay updated with alerts.' },
    'support':        { title: 'Support & Report',  sub: 'We\'re here to help.' },
};

function navigateTo(panelName) {
    // 1. Switch panels
    document.querySelectorAll(".panel").forEach(panel => {
        panel.classList.remove("active");
    });
    const target = document.getElementById(`panel-${panelName}`);
    if (target) target.classList.add("active");

    // 2. Update sidebar active state
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.dataset.panel === panelName) {
            item.classList.add("active");
        }
    });

    // 3. Update topbar title
    const info = panelTitles[panelName];
    if (info) {
        const titleEl = document.getElementById('topbar-title');
        const subEl = document.getElementById('topbar-sub');
        if (titleEl) titleEl.textContent = info.title;
        if (subEl) subEl.textContent = info.sub;
    }

    // 4. Scroll content area back to top
    const content = document.querySelector(".content");
    if (content) content.scrollTop = 0;
}

// ── Booking Filter ─────────────────────────────────────────
function setupBookingFilters() {
    const filterBtns = document.querySelectorAll('#panel-bookings .filter-btn');
    const bookingCards = document.querySelectorAll('.booking-card[data-status]');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // toggle active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            bookingCards.forEach(card => {
                if (!filter || filter === 'all') {
                    card.style.display = '';
                } else {
                    card.style.display = card.dataset.status === filter ? '' : 'none';
                }
            });
        });
    });
}

// ── Property Filter ────────────────────────────────────────
function setupPropertyFilters() {
    const filterBtns = document.querySelectorAll('#panel-my-properties .filter-btn');
    const propCards = document.querySelectorAll('#panel-my-properties .prop-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const text = btn.textContent.trim().toLowerCase();
            propCards.forEach(card => {
                const statusEl = card.querySelector('.qprop-status');
                const status = statusEl ? statusEl.textContent.trim().toLowerCase() : '';

                if (text === 'all') {
                    card.style.display = '';
                } else if (text === 'available') {
                    card.style.display = status === 'available' ? '' : 'none';
                } else if (text === 'booked') {
                    card.style.display = (status === 'occupied' || status === 'booked') ? '' : 'none';
                }
            });
        });
    });
}

// ── Event Delegation ───────────────────────────────────────
// Handles [data-panel] clicks (sidebar) and [data-nav] clicks (content)
document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-panel]");
    const navLink = e.target.closest("[data-nav]");

    if (navBtn && navBtn.dataset.panel) {
        navigateTo(navBtn.dataset.panel);
    } else if (navLink && navLink.dataset.nav) {
        navigateTo(navLink.dataset.nav);
    }
});

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupBookingFilters();
    setupPropertyFilters();
    initMobileSidebar();
});

// Mobile Sidebar Initialization
function initMobileSidebar() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('hidden');
    });

    document.addEventListener('click', function (e) {
        if (!sidebar.classList.contains('hidden') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.add('hidden');
        }
    });
}
