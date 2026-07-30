
const card_container = document.querySelector('#featured-card-container');

const featuredRooms = [
    {
        badge: "verified",
        title: "Modern 3BHK in Baluwatar",
        location: "Baluwatar, Kathmandu",
        beds: 3,
        baths: 2,
        price: 45000,
        rating: 3.5,
        image: "https://assets-news.housing.com/news/wp-content/uploads/2024/07/23210743/Types-of-room-in-house-and-design-tips-01-600x400.jpg"
    },
    {
        badge: "new",
        title: "Cozy Studio in Thamel",
        location: "Thamel, Kathmandu",
        beds: 1,
        baths: 1,
        price: 25000,
        rating: 4,
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGl2aW5nJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        badge: "premium",
        title: "Family Home in Kupondole",
        location: "Kupondole, Lalitpur",
        beds: 4,
        baths: 3,
        price: 65000,
        rating: 5,
        image: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bGl2aW5nJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D"
    }
];

function renderCards(data) {
    card_container.innerHTML = data.map(room => `
    <div class="featured-card">
      <div class="featured-card-badge">
        ${room.verified ? `<span>verified</span>` : ""}
        <img src="${room.image}" alt="">
      </div>

      <div class="featured-card-content">
        <h3>${room.title}</h3>

        <div class="featured-location">
          <i class="fa fa-location-dot"></i>
          <p>${room.location}</p>
        </div>

        <div class="featured-feature">
          <i><i class="fa fa-bed"></i> ${room.beds} beds</i>
          <i><i class="fa fa-bath"></i> ${room.baths} baths</i>
          ${createStars(room.rating)}
        </div>

        <div class="featured-price">
          <p>Rs. ${room.price}/month</p>
         <a href="${window.APP_URLS.login}" class="px-5 py-2 rounded-lg bg-accent text-black text-sm font-semibold hover:scale-105 hover:bg-yellow-400 transition-all duration-200">View</a>

        </div>
      </div>
    </div>
  `).join("");
}

renderCards(featuredRooms);


function createStars(rating) {
    let stars = "";
    for (let i = 1; i <= rating; i++) {
        stars += `<i class="fa fa-star"></i>`;
    }

    let temp = rating - Math.floor(rating);
    if (temp > 0) {
        stars += `<i class="fa fa-star-half"></i>`;
    }

    return stars;
}

const review_container = document.querySelector('.review-card-container');

review_container.innerHTML = '';

const left_arrow = document.createElement('button');
left_arrow.innerHTML = '<i class="fa fa-arrow-left"></i>';

const right_arrow = document.createElement('button');
right_arrow.innerHTML = '<i class="fa fa-arrow-right"></i>';

const reviews = [
    {
        id: 1,
        image: "/static/images/person.png",
        name: "Amrit Gautam",
        location: "Kathmandu",
        rating: 5,
        review: "I was about to pay a broker NPR 15,000. Found my apartment on RentEase in 2 days, directly from owner. Saved money and time."
    },
    {
        id: 2,
        image: "/static/images/user1.png",
        name: "Sita Sharma",
        location: "Lalitpur",
        rating: 5,
        review: "As a landlord, I used to deal with endless calls. Found great tenants in one week. Rent comes on time every month."
    },
    {
        id: 3,
        image: "/static/images/user2.png",
        name: "Rajesh Shrestha",
        location: "Pokhara",
        rating: 4,
        review: "Moved to Pokhara for work and found a fully furnished apartment in 3 days. The virtual tour saved me so much time."
    },
    {
        id: 4,
        image: "/static/images/user3.png",
        name: "Beauty",
        location: "Biratnagar",
        rating: 5,
        review: "The verification process gave me peace of mind. No fake listings, no wasted trips. Highly recommend!"
    },
    {
        id: 5,
        image: "/static/images/room.png",
        name: "Bikram Thapa",
        location: "Butwal",
        rating: 4,
        review: "First time renting in a new city and RentEase made it so easy. Connected directly with owner, no middleman."
    }
];

let currentIndex = 0;

function review_card() {
    review_container.innerHTML = "";

    review_container.appendChild(left_arrow);

    const cardWrapper = document.createElement("div");
    cardWrapper.classList.add("review-wrapper");

    // First card
    const first = reviews[currentIndex];

    // Second card (wrap around)
    const second = reviews[(currentIndex + 1) % reviews.length];

    [first, second].forEach(review => {
        const card = document.createElement("div");
        card.classList.add("review-card");

        card.innerHTML = `
            <img src="${review.image}" alt="">
            <div class="review-card-content">
                <div class="review-card-star">
                    ${createStars(review.rating)}
                </div>
                <span>
                    ${review.name}
                    <span class="review-location">${review.location}</span>
                </span>
                <p>"${review.review}"</p>
            </div>
        `;

        cardWrapper.appendChild(card);
    });

    review_container.appendChild(cardWrapper);
    review_container.appendChild(right_arrow);
}

review_card();

function review_filter(start = 1, end = 2) {
    const filered_review = reviews.filter(review => review.id >= start && review.id <= end);
    return filered_review;
}

review_container.appendChild(right_arrow);

right_arrow.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % reviews.length;
    review_card();
});

left_arrow.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    review_card();
});

//// -----------------------------

const nav_bar = document.querySelector('#nav-link');

const Navlinks = [
    { name: 'Home', url: '/', style: 'active' },
    { name: 'Browse', url: '#property' },
    { name: 'How It Works', url: '#working' },
    { name: 'About Us', url: '#about' }
];

function renderNavLink() {
    nav_bar.innerHTML = '';

    Navlinks.forEach(nav => {
        const li = document.createElement('li');

        const activeClass = nav.style === 'active'
            ? 'bg-[rgba(59,130,246,0.3)] px-3 py-1 rounded-md'
            : '';

        li.innerHTML = `
            <a href="${nav.url}" 
               class="text-white hover:bg-[rgba(59,130,246,0.2)] 
                      hover:px-3  hover:rounded-md 
                      transition-all duration-200 px-2.5 py-2 
                      font-medium text-base ease-in-out ${activeClass}">
                ${nav.name}
            </a>`;

        nav_bar.appendChild(li);
    });
}

renderNavLink();

const video = document.getElementById('promoVideo');
const btn = document.getElementById('volumeBtn');

btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.textContent = video.muted ? '🔇' : '🔊';
});