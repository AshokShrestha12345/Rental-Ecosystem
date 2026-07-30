// tenant.js - Minimal dynamic updates

const navContainer = document.querySelector("#tenant-nav");
const topbarTitle = document.getElementById("topbar-title");
const topbarSub = document.getElementById("topbar-sub");

// Navigation data (unchanged)
const navItems = [
    {
        category: "Discover",
        items: [
            { label: "Dashboard", panel: "dashboard", icon: "fa-solid fa-house", isActive: true },
            { label: "Browse Properties", panel: "browse", icon: "fa-solid fa-magnifying-glass", isActive: false },
            { label: "Saved / Wishlist", panel: "wishlist", icon: "fa-solid fa-heart", isActive: false }
        ]
    },
    {
        category: "Rentals",
        items: [
            { label: "Book / Visit Request", panel: "booking-request", icon: "fa-solid fa-calendar-check", isActive: false },
            { label: "My Bookings", panel: "my-bookings", icon: "fa-solid fa-book", isActive: false }
        ]
    },
    {
        category: "Account",
        items: [
            { label: "My Reviews", panel: "reviews", icon: "fa-solid fa-star", isActive: false },
            { label: "Profile", panel: "profile", icon: "fa-solid fa-user", isActive: false },
            { label: "Notifications", panel: "notifications", icon: "fa-solid fa-bell", isActive: false },
            { label: "Report Listing", panel: "report", icon: "fa-solid fa-triangle-exclamation", isActive: false }
        ]
    }
];

function buildSidebar() {
    if (!navContainer) return;
    let html = '';
    for (let category of navItems) {
        html += `<p class="nav-label">${category.category}</p>`;
        for (let item of category.items) {
            const activeClass = item.isActive ? 'active' : '';
            html += `
                <button class="nav-item ${activeClass} w-full text-left" data-panel="${item.panel}">
                    <i class="${item.icon} nav-icon"></i>
                    <span>${item.label}</span>
                </button>
            `;
        }
    }
    navContainer.innerHTML = html;
}
buildSidebar();

// Room data from Django JSON
let roomsData = [];
try {
    const dataElement = document.getElementById('rooms-data');
    if (dataElement) {
        roomsData = JSON.parse(dataElement.textContent);
    }
} catch (e) {
    console.warn('Could not parse rooms data', e);
}

function navigateTo(panelName, roomId = null) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    const target = document.getElementById(`panel-${panelName}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.nav-item[data-panel="${panelName}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    if (topbarTitle) {
        const label = activeBtn?.querySelector('span')?.textContent || 'Dashboard';
        topbarTitle.textContent = label;
    }

    const content = document.querySelector(".content");
    if (content) content.scrollTop = 0;

    if (panelName === 'property-detail' && roomId) {
        updatePropertyDetail(roomId);
    }
}

function updatePropertyDetail(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room) return;

    document.getElementById('detail-title').textContent = room.room_name;
    document.getElementById('detail-city').textContent = room.city;
    document.getElementById('detail-rating').textContent = room.rating || '0.0';
    document.getElementById('detail-beds').textContent = room.beds;
    document.getElementById('detail-baths').textContent = room.bath;
    document.getElementById('detail-sqft').textContent = room.sqft;
    document.getElementById('detail-price').textContent = room.price;
    document.getElementById('detail-description').textContent = room.description || 'No description provided.';
    document.getElementById('detail-owner').textContent = room.owner__first_name + ' ' + room.owner__last_name;

    document.getElementById('detail-side-price').textContent = room.price;
    document.getElementById('detail-side-rating').textContent = room.rating || '0.0';
    document.getElementById('detail-side-review-count').textContent = room.review_count || 0;
    document.getElementById('detail-deposit').textContent = `Rs. ${Math.round(room.price * 2)}`;
    document.getElementById('detail-owner-name').textContent = room.owner__first_name + ' ' + room.owner__last_name;
    document.getElementById('detail-owner-props').textContent = room.owner_property_count || 0;
    document.getElementById('detail-owner-rating').textContent = (room.owner_avg_rating || 0).toFixed(1) + '★';

    const reviewCount = room.review_count || 0;
    document.getElementById('detail-review-count').textContent = reviewCount;
    document.getElementById('detail-avg-rating').textContent = (room.rating || 0).toFixed(1);
    const starsFull = Math.round(room.rating || 0);
    document.getElementById('detail-stars-display').textContent = '★'.repeat(starsFull) + '☆'.repeat(5 - starsFull);

    const reviewsContainer = document.getElementById('detail-reviews-list');
    if (room.reviews && room.reviews.length) {
        reviewsContainer.innerHTML = room.reviews.map(rev => `
            <div class="detail-review-item">
                <div class="detail-review-header">
                    <div class="detail-review-avatar"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <strong class="detail-review-name">${rev.user__first_name || 'User'}</strong>
                        <p class="detail-review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</p>
                    </div>
                    <span class="detail-review-date">${new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <p class="detail-review-text">${rev.review || ''}</p>
            </div>
        `).join('');
    } else {
        reviewsContainer.innerHTML = '<p class="text-text-muted text-sm">No reviews yet.</p>';
    }

    // Update booking button
    const bookBtn = document.getElementById('detail-book-btn');
    if (bookBtn) bookBtn.setAttribute('data-room-id', roomId);
}

// Event delegation for navigation
document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-panel], [data-nav]");
    if (!navBtn) return;

    const panel = navBtn.dataset.panel || navBtn.dataset.nav;
    if (!panel) return;

    e.preventDefault();
    let roomId = navBtn.dataset.roomId || navBtn.closest('[data-room-id]')?.dataset?.roomId || null;

    if (panel === 'booking-request' && roomId) {
        const bookingRoomSelect = document.getElementById('booking-room-select');
        if (bookingRoomSelect) {
            bookingRoomSelect.value = roomId;
        }
    }

    navigateTo(panel, roomId);
});

// Booking form initialization
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const bookingRoomSelect = document.getElementById('booking-room-select');
    if (!bookingForm || !bookingRoomSelect) return;

    const roomIdFromHash = window.location.hash.match(/roomId=(\d+)/);
    if (roomIdFromHash) {
        bookingRoomSelect.value = roomIdFromHash[1];
    }

    bookingForm.addEventListener('submit', function (e) {
        if (!bookingRoomSelect.value) {
            e.preventDefault();
            showToast('Please select a property before sending the request.', 'warning');
        }
    });
}
initBookingForm();

// Browse filters (unchanged)
function initBrowseFilters() {
    const searchInput = document.getElementById('browse-search-input');
    const priceFilter = document.getElementById('browse-price-filter');
    const cityFilter = document.getElementById('browse-city-filter');
    const searchBtn = document.getElementById('browse-search-btn');
    const propertyGrid = document.getElementById('property-grid');
    if (!propertyGrid) return;
    const cards = propertyGrid.querySelectorAll('.prop-card');

    function filterProperties() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const priceVal = priceFilter ? priceFilter.value : 'all';
        const cityVal = cityFilter ? cityFilter.value.toLowerCase() : 'all';

        cards.forEach(card => {
            const title = card.querySelector('.prop-card-title')?.textContent.toLowerCase() || '';
            const loc = card.querySelector('.prop-card-loc')?.textContent.toLowerCase() || '';
            const priceText = card.querySelector('.prop-price')?.textContent.replace(/[^0-9]/g, '') || '0';
            const price = parseInt(priceText, 10);
            const city = card.querySelector('.prop-card-loc')?.textContent.split(',')[0]?.trim().toLowerCase() || '';

            let show = true;
            if (query && !title.includes(query) && !loc.includes(query)) show = false;
            if (priceVal !== 'all') {
                const [min, max] = priceVal.split('-').map(Number);
                if (price < min || (max && price > max)) show = false;
            }
            if (cityVal !== 'all' && city !== cityVal) show = false;
            card.style.display = show ? '' : 'none';
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterProperties);
    if (priceFilter) priceFilter.addEventListener('change', filterProperties);
    if (cityFilter) cityFilter.addEventListener('change', filterProperties);
    if (searchBtn) searchBtn.addEventListener('click', filterProperties);
    filterProperties();
}
initBrowseFilters();

// Star rating (unchanged)
function initStarRating() {
    document.querySelectorAll(".star-rating-input").forEach(container => {
        const stars = container.querySelectorAll(".star-btn");
        const ratingInput = container.querySelector("[name='rating']");
        stars.forEach((star, index) => {
            star.addEventListener("click", function (e) {
                e.preventDefault();
                stars.forEach((s, i) => {
                    s.classList.toggle("active", i <= index);
                });
                if (ratingInput) ratingInput.value = index + 1;
            });
            star.addEventListener("mouseenter", function () {
                stars.forEach((s, i) => {
                    s.style.color = i <= index ? "#F59E0B" : "#D1D5DB";
                });
            });
            star.addEventListener("mouseleave", function () {
                stars.forEach((s) => {
                    s.style.color = s.classList.contains("active") ? "#F59E0B" : "#D1D5DB";
                });
            });
        });
    });
}
initStarRating();

// Report selection (unchanged)
function initReportSelection() {
    document.querySelectorAll(".report-prop-option").forEach(option => {
        option.addEventListener("click", function () {
            document.querySelectorAll(".report-prop-option").forEach(o => o.classList.remove("selected"));
            this.classList.add("selected");
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}
initReportSelection();

// Wishlist buttons (unchanged)
function initWishlistButtons() {
    document.querySelectorAll(".wishlist-btn").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const roomId = this.dataset.roomId;
            if (!roomId) return;
            fetch(`/tenant/toggle_like/${roomId}/`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        this.classList.toggle("saved", data.liked);
                        const icon = this.querySelector("i");
                        if (icon) icon.style.color = data.liked ? "#EF4444" : "white";
                        showToast(data.liked ? "Added to wishlist ❤️" : "Removed from wishlist", data.liked ? "success" : "info");
                        setTimeout(() => window.location.reload(), 500);
                    } else {
                        showToast("⚠️ Could not update wishlist", "error");
                    }
                });
        });
    });
}
initWishlistButtons();

// Heart buttons in saved properties (unchanged)
function initHeartButtons() {
    document.querySelectorAll(".heart-btn").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            const roomId = this.dataset.roomId;
            if (!roomId) return;
            const propertyCard = this.closest(".saved-mini");
            if (propertyCard) {
                propertyCard.style.transition = "all 0.3s ease";
                propertyCard.style.opacity = "0";
                propertyCard.style.transform = "scale(0.95)";
                fetch(`/tenant/toggle_like/${roomId}/`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setTimeout(() => {
                                propertyCard.style.display = "none";
                                showToast("Removed from saved", "info");
                                updateSavedCount();
                                setTimeout(() => window.location.reload(), 300);
                            }, 300);
                        } else {
                            showToast("⚠️ Could not update saved properties", "error");
                        }
                    });
            }
        });
    });
}
initHeartButtons();

function updateSavedCount() {
    const count = document.querySelectorAll(".saved-mini:not([style*='display: none'])").length;
    const wishlistNav = document.querySelector('.nav-item[data-panel="wishlist"]');
    if (wishlistNav) {
        let badge = wishlistNav.querySelector(".nav-badge");
        if (count > 0) {
            if (badge) badge.textContent = count;
            else {
                badge = document.createElement("span");
                badge.className = "nav-badge";
                badge.textContent = count;
                wishlistNav.appendChild(badge);
            }
        } else if (badge) badge.remove();
    }
}

// Booking filter buttons
function initFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const parent = this.closest(".filter-bar");
            if (parent) {
                parent.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
            }
            const panel = this.closest(".panel");
            if (panel) {
                const filter = this.dataset.filter || 'all';
                panel.querySelectorAll(".booking-card").forEach(card => {
                    const status = card.dataset.status || '';
                    card.style.display = (filter === 'all' || status === filter) ? "" : "none";
                });
            }
        });
    });
}
initFilterButtons();

// Cancel booking (unchanged)
function initCancelBooking() {
    document.querySelectorAll(".booking-card .btn-danger").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const card = this.closest(".booking-card");
            const bookingName = card?.querySelector(".booking-name")?.textContent || "Booking";
            if (confirm(`Cancel booking for "${bookingName}"?`)) {
                card.style.transition = "all 0.3s ease";
                card.style.opacity = "0.5";
                card.style.transform = "scale(0.95)";
                setTimeout(() => {
                    card.style.display = "none";
                    showToast(`❌ ${bookingName} cancelled`, "error");
                }, 300);
            }
        });
    });
}
initCancelBooking();

// Notification bell (unchanged)
function initNotificationBell() {
    const notifBtn = document.querySelector(".notif-btn");
    if (notifBtn) {
        notifBtn.addEventListener("click", function () {
            const navItem = document.querySelector('.nav-item[data-panel="notifications"]');
            if (navItem) {
                navigateTo("notifications");
                const dot = this.querySelector(".notif-dot");
                if (dot) dot.style.display = "none";
            }
        });
    }
}
initNotificationBell();

// Mark all read (unchanged)
function initMarkAllRead() {
    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
        markAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".notif-item.unread").forEach(item => {
                item.classList.remove("unread");
                const dot = item.querySelector(".notif-dot-badge");
                if (dot) dot.style.display = "none";
            });
            const header = document.querySelector('#panel-notifications .section-subtitle');
            if (header) header.textContent = "0 unread notifications";
            showToast("✅ All notifications marked as read", "success");
        });
    }
}
initMarkAllRead();

// Toast system (unchanged)
function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const colors = { success: "#10B981", error: "#EF4444", warning: "#F59E0B", info: "#3B82F6" };
    const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", warning: "fa-triangle-exclamation", info: "fa-info-circle" };
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.backgroundColor = colors[type] || "#3B82F6";
    toast.style.color = "white";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
    toast.style.zIndex = "9999";
    toast.style.maxWidth = "400px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "500";
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i> ${message}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => { toast.style.display = "none"; }, 300);
    }, 4000);
    toast.onclick = function () {
        clearTimeout(toast._timeout);
        toast.style.display = "none";
    };
}

// Back button (unchanged)
function initBackButton() {
    const backBtn = document.querySelector('.detail-back');
    if (backBtn) {
        backBtn.addEventListener("click", function (e) {
            e.preventDefault();
            navigateTo("browse");
        });
    }
}
initBackButton();

// Mobile sidebar (unchanged)
function initMobileSidebar() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    sidebar.style.backgroundColor = "#1E3A8A";
    if (!menuBtn || !sidebar) return;

    // Toggle sidebar on menu button click

    menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('hidden');

        setTimeout(() => {
            sidebar.classList.toggle('hidden');
        }, 3000);

    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function (e) {
        if (!sidebar.classList.contains('hidden') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.add('hidden');
        }
    });

}

// Initialize on load
initMobileSidebar();
// Keyboard shortcuts (unchanged)
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const navItems = document.querySelectorAll('.nav-item[data-panel]');
        const index = parseInt(e.key) - 1;
        if (navItems[index]) navigateTo(navItems[index].dataset.panel);
    }
    if (e.key === "Escape") {
        const toast = document.getElementById("toast");
        if (toast && toast.style.display !== "none") toast.style.display = "none";
    }
});

// Initial navigation
const hash = window.location.hash.replace("#", "");
if (hash) {
    const targetBtn = document.querySelector(`.nav-item[data-panel="${hash}"]`);
    if (targetBtn) navigateTo(hash);
    else navigateTo("dashboard");
} else {
    navigateTo("dashboard");
}

// Topbar subtitle
function updateTopbarSub() {
    if (topbarSub) {
        const name = document.querySelector(".user-info .name")?.textContent || "Guest";
        const hour = new Date().getHours();
        let greeting = "Good morning";
        if (hour >= 12 && hour < 17) greeting = "Good afternoon";
        if (hour >= 17) greeting = "Good evening";
        topbarSub.textContent = `${greeting}, ${name}`;
    }
}
updateTopbarSub();

console.log("✅ RentEase Tenant Dashboard initialized (minimal JS)");