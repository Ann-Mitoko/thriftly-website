//Vendor//

const vendors = [
  {
    id: 1,
    name: "Mama Njeri's Closet",
    owner: "Grace Njeri",
    emoji: "👗",
    category: "Vintage",
    area: "Gikomba Market",
    rating: 4.8,
    reviews: 34,
    price: "Ksh 150–800",
    condition: "A",
    desc: "Over 200 curated vintage pieces, hand-picked and quality-checked before listing. Specialises in 80s and 90s women's wear.",
    phone: "+254 712 345 678",
    instagram: "@mamanjeri_closet",
    hours: "Mon–Sat, 9am–6pm",
    bulk: false
  },
  {
    id: 2,
    name: "Fresh Threads KE",
    owner: "Brian Otieno",
    emoji: "🧢",
    category: "Streetwear",
    area: "Gikomba Market",
    rating: 4.5,
    reviews: 21,
    price: "Ksh 200–1200",
    condition: "B",
    desc: "Streetwear and urban fashion from global thrift hauls. Jordans, hoodies, cargo pants — fresh drops every weekend.",
    phone: "+254 798 001 234",
    instagram: "@freshthreads_ke",
    hours: "Daily, 10am–8pm",
    bulk: false
  },
  {
    id: 3,
    name: "Little Threads",
    owner: "Aisha Mohamed",
    emoji: "👶",
    category: "Kids",
    area: "Eastleigh",
    rating: 4.9,
    reviews: 58,
    price: "Ksh 50–400",
    condition: "A",
    desc: "Quality second-hand children's clothing from newborn to size 14. School uniforms, play clothes, and occasion wear all available.",
    phone: "+254 735 678 901",
    instagram: "@littlethreads_ke",
    hours: "Mon–Fri, 8am–5pm",
    bulk: false
  },
  {
    id: 4,
    name: "The Accessory Box",
    owner: "Lydia Wambua",
    emoji: "👜",
    category: "Accessories",
    area: "Toi Market",
    rating: 4.6,
    reviews: 17,
    price: "Ksh 100–2000",
    condition: "A",
    desc: "Bags, belts, scarves and jewellery curated from high-end donations and vintage estates. Great for gifting.",
    phone: "+254 722 456 789",
    instagram: "@theaccessorybox",
    hours: "Tue–Sun, 11am–7pm",
    bulk: false
  },
  {
    id: 5,
    name: "Suit Up Thrift",
    owner: "James Kariuki",
    emoji: "👔",
    category: "Bulk",
    area: "Gikomba Market",
    rating: 4.3,
    reviews: 12,
    price: "Bales from Ksh 12,000",
    condition: "B",
    desc: "Wholesale suits, blazers and dress shirts for resellers stocking office and event wear. Minimum order applies.",
    phone: "+254 701 234 567",
    instagram: "@suitup_thrift",
    hours: "Mon–Fri, 6am–3pm",
    bulk: true
  },
  {
    id: 6,
    name: "Retro Vibes",
    owner: "Cynthia Oduya",
    emoji: "✨",
    category: "Vintage",
    area: "Kilimani",
    rating: 4.7,
    reviews: 29,
    price: "Ksh 300–1500",
    condition: "A",
    desc: "Y2K and retro pieces popular with students and content creators. Unique looks on a budget — new stock every Wednesday.",
    phone: "+254 745 678 900",
    instagram: "@retrovibes_nbi",
    hours: "Wed–Sun, 10am–7pm",
    bulk: false
  }
];


let activeFilter = "All";
let userMode = "buyer";


const bannerColors = {
  Vintage:     "#f9e4c8",
  Streetwear:  "#d1fae5",
  Kids:        "#fce7f3",
  Accessories: "#ede9fe",
  Bulk:        "#dbeafe"
};

//Render Cards//
function renderCards(vendorList) {
  const grid = document.getElementById("vendorGrid");

  if (vendorList.length === 0) {
    grid.innerHTML = `
      <p style="color:#999; padding:2rem; grid-column:1/-1;">
        No stalls found. Try a different search or filter.
      </p>`;
    return;
  }

  grid.innerHTML = vendorList.map(function(vendor) {
    const color = bannerColors[vendor.category] || "#f0f0f0";
    return `
      <div class="vendor-card" onclick="openModal(${vendor.id})">
        <div class="card-banner" style="background-color:${color}">
          <span>${vendor.emoji}</span>
          <div class="card-badge">
            <i class="fa-solid fa-circle-check"></i> Verified
          </div>
        </div>
        <div class="card-body">
          <h3>${vendor.name}</h3>
          <div class="card-meta">
            <span class="tag">${vendor.category}</span>
            <span class="tag tag-amber">Grade ${vendor.condition}</span>
            <span class="card-location">
              <i class="fa-solid fa-location-dot"></i> ${vendor.area}
            </span>
          </div>
          <p class="card-desc">${vendor.desc.slice(0, 85)}...</p>
        </div>
        <div class="card-footer">
          <div>
            <span class="stars">★★★★★</span>
            <span class="rating-count">${vendor.rating} (${vendor.reviews})</span>
          </div>
          <span class="price">${vendor.price}</span>
        </div>
      </div>
    `;
  }).join("");

  const count = vendorList.length;
  document.getElementById("count-label").textContent =
    "Showing " + count + " stall" + (count !== 1 ? "s" : "");
}

//Filter Search//

function filterVendors() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = vendors.filter(function(vendor) {

    // Check category filter
    const matchesFilter =
      activeFilter === "All" || vendor.category === activeFilter;

    // Check search query against name, area, category, description
    const matchesSearch =
      !query ||
      vendor.name.toLowerCase().includes(query) ||
      vendor.area.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.desc.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  renderCards(filtered);
}

function setFilter(filterName) {
  // Remember which filter is active
  activeFilter = filterName;

  // Update the visual active state on the buttons
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(function(btn) {
    if (btn.dataset.filter === filterName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Re-render cards with the new filter applied
  filterVendors();
}
//Buyer/Seller toggle
function setUserMode(mode) {
  userMode = mode;

  const buyerBtn    = document.getElementById("buyerModeBtn");
  const resellerBtn = document.getElementById("resellerModeBtn");
  const modeLabel   = document.getElementById("modeLabel");
  const searchInput = document.getElementById("searchInput");

  if (mode === "buyer") {
    
    buyerBtn.classList.add("active");
    resellerBtn.classList.remove("active");

    modeLabel.textContent = "Browsing as buyer";
    searchInput.placeholder = "Search stalls, styles, or markets...";
    setFilter("All");

  } else {
   
    resellerBtn.classList.add("active");
    buyerBtn.classList.remove("active");
    modeLabel.textContent = "Sourcing stock as reseller";

    searchInput.placeholder = "Search bulk lots, bales, or markets...";
    setFilter("Bulk");
  }
}

function openModal(vendorId) {
  
  const vendor = vendors.find(function(v) {
    return v.id === vendorId;
  });

  if (!vendor) return;

  // Set the banner background color
  const banner = document.getElementById("mBanner");
  banner.style.backgroundColor = bannerColors[vendor.category] || "#f0f0f0";
  banner.innerHTML = `<span style="font-size:3.5rem">${vendor.emoji}</span>`;

  // Fill in the vendor name
  document.getElementById("mName").textContent = vendor.name;

  // Fill in the tags (category, grade, location)
  document.getElementById("mMeta").innerHTML = `
    <span class="tag">${vendor.category}</span>
    <span class="tag tag-amber">Grade ${vendor.condition}</span>
    <span class="card-location">
      <i class="fa-solid fa-location-dot"></i> ${vendor.area}
    </span>
  `;

  // Fill in the description
  document.getElementById("mDesc").textContent = vendor.desc;

  // Fill in the info grid (phone, instagram, hours, price)
  document.getElementById("mInfo").innerHTML = `
    <div class="info-item">
      <strong>Phone / WhatsApp</strong>
      ${vendor.phone}
    </div>
    <div class="info-item">
      <strong>Instagram</strong>
      ${vendor.instagram}
    </div>
    <div class="info-item">
      <strong>Opening hours</strong>
      ${vendor.hours}
    </div>
    <div class="info-item">
      <strong>Price range</strong>
      ${vendor.price}
    </div>
  `;

  // Fill in the action buttons
  document.getElementById("mActions").innerHTML = `
    <a href="https://wa.me/${vendor.phone.replace(/\D/g, '')}"
       target="_blank"
       class="btn">
      <i class="fa-brands fa-whatsapp"></i> WhatsApp Vendor
    </a>
    <button class="btn btn-outline" onclick="closeModal()">Close</button>
  `;

  // Show the modal
  document.getElementById("modal").classList.add("open");

  // Prevent the page body from scrolling while modal is open
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
}

// Also close if the user clicks on the dark backdrop
// (but NOT if they click inside the white modal box)
function closeModalOutside(event) {
  if (event.target.id === "modal") {
    closeModal();
  }
}
//form submission
function submitVendor(event) {
  // Prevent the default browser form submission
  // (which would reload the page)
  event.preventDefault();

  const storeName = document.getElementById("storeName").value.trim();
  const ownerName = document.getElementById("ownerName").value.trim();
  const email     = document.getElementById("email").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const location  = document.getElementById("location").value.trim();
  const category  = document.getElementById("category").value;
  const storeDesc = document.getElementById("storeDesc").value.trim();

  const successMsg = document.getElementById("formSuccess");
  const errorMsg   = document.getElementById("formError");

  // Hide both messages first
  successMsg.style.display = "none";
  errorMsg.style.display   = "none";

  // Check required fields
  if (!storeName || !ownerName || !email || !category) {
    errorMsg.style.display = "block";
    return;
  }

  // All good — show success message
  successMsg.style.display = "block";

  // Clear the form fields
  document.getElementById("storeName").value  = "";
  document.getElementById("ownerName").value  = "";
  document.getElementById("email").value      = "";
  document.getElementById("phone").value      = "";
  document.getElementById("location").value   = "";
  document.getElementById("category").value   = "";
  document.getElementById("storeDesc").value  = "";

  // Auto-hide the success message after 5 seconds
  setTimeout(function() {
    successMsg.style.display = "none";
  }, 5000);
}


const menuToggle = document.getElementById("menuToggle");
const navLinks   = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function() {
    navLinks.classList.toggle("open");
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll("a").forEach(function(link) {
    link.addEventListener("click", function() {
      navLinks.classList.remove("open");
    });
  });
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

renderCards(vendors);