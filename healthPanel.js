
const HS_API = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/health-services'
  : 'https://thriftly-website.onrender.com/';   // TODO(DEPLOY): placeholder. Use YOUR Render URL once the route is deployed there

function hsEscape(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function hsStatus(message, isError) {
  const el = document.getElementById('hsStatus');
  el.textContent = message;
  el.style.color = isError ? '#c00' : '#555';
}

// Returns the parsed JSON, or null (after showing a message) if something failed.
async function hsFetch(path) {
  try {
    const res = await fetch(HS_API + path);
    if (!res.ok) {
      let msg = 'Health services are unavailable right now. Please try again later. (status ' + res.status + ')';
      if (res.status === 400) {
        try { msg = (await res.json()).message || msg; } catch (e) { /* keep default */ }
      }
      hsStatus(msg, true);
      return null;
    }
    return await res.json();
  } catch (err) {
    hsStatus('Could not reach the Thriftly server. Is it running? (' + err.message + ')', true);
    return null;
  }
}


function hsCard(item) {
  const stockResult = item.quantity !== undefined && item.name !== undefined;
  const inventoryRow = item.quantity !== undefined && item.name === undefined;
  const title = inventoryRow ? item.medicine : item.name;

  let html = '<div class="vendor-card" style="padding:1rem;margin-bottom:.75rem;"><h3>' + hsEscape(title || 'Unnamed') + '</h3>';
  if (stockResult) html += '<p>Medicine: ' + hsEscape(item.medicine) + '</p>';
  if (item.location) html += '<p>' + hsEscape(item.location) + '</p>';
  if (item.distance !== undefined && item.distance !== null) {
    html += '<p>Distance: ' + hsEscape(item.distance) + ' km' + (item.eta ? ' &middot; ETA ' + hsEscape(item.eta) : '') + '</p>';
  }
  if (item.quantity !== undefined) {
    html += '<p>' + (stockResult ? 'In stock: ' : 'Quantity: ') + hsEscape(item.quantity)
      + ' &middot; Ksh ' + hsEscape(item.price)
      + (inventoryRow && item.status ? ' &middot; ' + hsEscape(item.status) : '') + '</p>';
  }
  if (item.verified !== undefined) html += '<p>' + (item.verified ? 'Verified pharmacy' : 'Not yet verified') + '</p>';
  if (!stockResult && !inventoryRow && item.id !== undefined) {
    html += '<button class="btn btn-outline hs-stock" data-id="' + hsEscape(item.id) + '" type="button">View stock</button><div class="hs-stock-box"></div>';
  }
  return html + '</div>';
}

function hsRender(data) {
  const items = Array.isArray(data) ? data : [];
  const box = document.getElementById('hsResults');
  if (items.length === 0) {
    box.innerHTML = '';
    hsStatus('No results. The request worked, but nothing matched (the search only lists medicines currently in stock).', false);
    return;
  }
  hsStatus('Showing ' + items.length + ' result' + (items.length !== 1 ? 's' : ''), false);
  box.innerHTML = items.map(hsCard).join('');
}

document.getElementById('hsListBtn').addEventListener('click', async () => {
  hsStatus('Loading...', false);
  const data = await hsFetch('/pharmacies');
  if (data) hsRender(data);
});

document.getElementById('hsSearchBtn').addEventListener('click', async () => {
  const medicine = document.getElementById('hsMedicine').value.trim();
  const location = document.getElementById('hsLocation').value.trim();
  // Team 3's README: both medicine and location are required (400 otherwise).
  if (!medicine || !location) { hsStatus('Type a medicine and choose an area.', true); return; }
  hsStatus('Loading...', false);
  const data = await hsFetch('/stock-search?medicine=' + encodeURIComponent(medicine) + '&location=' + encodeURIComponent(location));
  if (data) hsRender(data);
});

// "View stock" button on a pharmacy card -> /inventory?pharmacy_id=...
document.getElementById('hsResults').addEventListener('click', async (e) => {
  const btn = e.target.closest('.hs-stock');
  if (!btn) return;
  const box = btn.nextElementSibling;
  box.textContent = 'Loading...';
  const data = await hsFetch('/inventory?pharmacy_id=' + encodeURIComponent(btn.dataset.id));
  if (!data) { box.textContent = 'Could not load stock for this pharmacy.'; return; }
  const items = Array.isArray(data) ? data : [];
  box.innerHTML = items.length ? items.map(hsCard).join('') : '<p>No stock listed for this pharmacy.</p>';
});