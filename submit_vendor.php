<?php
// submit_vendor.php
// Handles the "List your stall" form. Inserts as status='pending' -
// it will NOT show up in get_vendors.php until manually verified.

require_once "db_connect.php";
header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(["error" => "Method not allowed"]));
}

// Grab + sanitize incoming fields
$storeName  = trim($_POST['storeName'] ?? '');
$ownerName  = trim($_POST['ownerName'] ?? '');
$email      = trim($_POST['email'] ?? '');
$phone      = trim($_POST['phone'] ?? '');
$instagram  = trim($_POST['instagram'] ?? '');
$logoEmoji  = trim($_POST['logoEmoji'] ?? '🛍️');   // default logo if left blank
$location   = trim($_POST['location'] ?? '');
$priceRange = trim($_POST['priceRange'] ?? '');
$hours      = trim($_POST['hours'] ?? '');
$category   = trim($_POST['category'] ?? '');
$storeDesc  = trim($_POST['storeDesc'] ?? '');

// Required field check (mirrors the JS validation in submitVendor())
if (!$storeName || !$ownerName || !$email || !$category) {
    http_response_code(400);
    die(json_encode(["error" => "Please fill in all required fields."]));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(["error" => "Invalid email address."]));
}

// Look up category_id from the category name sent by the <select>
$stmt = $conn->prepare("SELECT category_id FROM categories WHERE name = ?");
$stmt->bind_param("s", $category);
$stmt->execute();
$catResult = $stmt->get_result();

if ($catResult->num_rows === 0) {
    http_response_code(400);
    die(json_encode(["error" => "Unknown category."]));
}
$categoryId = $catResult->fetch_assoc()['category_id'];
$stmt->close();

// Look up or create the market/area
$stmt = $conn->prepare("SELECT market_id FROM markets WHERE name = ?");
$stmt->bind_param("s", $location);
$stmt->execute();
$marketResult = $stmt->get_result();

if ($marketResult->num_rows > 0) {
    $marketId = $marketResult->fetch_assoc()['market_id'];
} else {
    $stmt2 = $conn->prepare("INSERT INTO markets (name) VALUES (?)");
    $stmt2->bind_param("s", $location);
    $stmt2->execute();
    $marketId = $stmt2->insert_id;
    $stmt2->close();
}
$stmt->close();

// Insert the vendor as pending — needs manual verification before it shows publicly
$isBulk = (stripos($category, 'Bulk') !== false) ? 1 : 0;

$stmt = $conn->prepare("
    INSERT INTO vendors
        (name, owner_name, emoji, category_id, market_id, price_range, description, phone, instagram, hours, is_bulk, status, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
");
$stmt->bind_param(
    "sssiisssssis",
    $storeName, $ownerName, $logoEmoji, $categoryId, $marketId, $priceRange, $storeDesc, $phone, $instagram, $hours, $isBulk, $email
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Submitted for verification."]);
} else {
    http_response_code(500);
    // Duplicate email will land here (email is UNIQUE)
    echo json_encode(["error" => "Could not submit: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
