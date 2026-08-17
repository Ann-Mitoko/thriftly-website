//Vendor//

// Vendors now load from the database via get_vendors.php instead of
// being hardcoded here. This array just holds whatever the last fetch returned.
let vendors = [];

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

  const storeName  = document.getElementById("storeName").value.trim();
  const ownerName  = document.getElementById("ownerName").value.trim();
  const email      = document.getElementById("email").value.trim();
  const phone      = document.getElementById("phone").value.trim();
  const instagram  = document.getElementById("instagram").value.trim();
  const logoEmoji  = document.getElementById("logoEmoji").value.trim();
  const location   = document.getElementById("location").value.trim();
  const priceRange = document.getElementById("priceRange").value.trim();
  const hours      = document.getElementById("hours").value.trim();
  const category   = document.getElementById("category").value;
  const storeDesc  = document.getElementById("storeDesc").value.trim();

  const successMsg = document.getElementById("formSuccess");
  const errorMsg   = document.getElementById("formError");

  // Hide both messages first
  successMsg.style.display = "none";
  errorMsg.style.display   = "none";

  // Check required fields client-side first (fast feedback, no network call)
  if (!storeName || !ownerName || !email || !category) {
    errorMsg.style.display = "block";
    return;
  }

  // Send to the backend, which does the real validation + INSERT
  const formData = new FormData();
  formData.append("storeName", storeName);
  formData.append("ownerName", ownerName);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("instagram", instagram);
  formData.append("logoEmoji", logoEmoji);
  formData.append("location", location);
  formData.append("priceRange", priceRange);
  formData.append("hours", hours);
  formData.append("category", category);
  formData.append("storeDesc", storeDesc);

  fetch("submit_vendor.php", {
    method: "POST",
    body: formData
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) {
        errorMsg.textContent = "⚠️ " + data.error;
        errorMsg.style.display = "block";
        return;
      }

      // Success — show message and clear the form
      successMsg.style.display = "block";
      document.getElementById("vendorForm").reset();

      setTimeout(function() {
        successMsg.style.display = "none";
      }, 5000);
    })
    .catch(function() {
      errorMsg.textContent = "⚠️ Something went wrong. Please try again.";
      errorMsg.style.display = "block";
    });
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

// Fetch verified vendors from the database and render once loaded
function loadVendors() {
  const grid = document.getElementById("vendorGrid");
  grid.innerHTML = `<p style="color:#999; padding:2rem; grid-column:1/-1;">Loading stalls...</p>`;

  fetch("get_vendors.php")
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) {
        grid.innerHTML = `<p style="color:#c00; padding:2rem; grid-column:1/-1;">Couldn't load stalls: ${data.error}</p>`;
        return;
      }
      vendors = data;
      filterVendors(); // respects whatever filter/search is currently active
    })
    .catch(function() {
      grid.innerHTML = `<p style="color:#c00; padding:2rem; grid-column:1/-1;">Couldn't reach the server. Is your PHP/MySQL server running?</p>`;
    });
}

loadVendors();