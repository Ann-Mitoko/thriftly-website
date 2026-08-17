<?php
// get_vendors.php
// Returns all VERIFIED vendors as JSON, in the same shape as the old
// hardcoded `vendors` array in script.js, so renderCards() needs no changes.

require_once "db_connect.php";
header('Content-Type: application/json');

$sql = "
    SELECT
        v.vendor_id      AS id,
        v.name           AS name,
        v.owner_name     AS owner,
        v.emoji          AS emoji,
        c.name           AS category,
        m.name           AS area,
        v.price_range    AS price,
        v.condition_grade AS `condition`,
        v.description    AS `desc`,
        v.phone          AS phone,
        v.instagram      AS instagram,
        v.hours          AS hours,
        v.is_bulk        AS bulk,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating,
        COUNT(r.review_id) AS reviews
    FROM vendors v
    JOIN categories c ON v.category_id = c.category_id
    JOIN markets m ON v.market_id = m.market_id
    LEFT JOIN reviews r ON r.vendor_id = v.vendor_id
    WHERE v.status = 'verified'
    GROUP BY v.vendor_id
    ORDER BY v.name ASC
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    die(json_encode(["error" => "Query failed: " . $conn->error]));
}

$vendors = [];
while ($row = $result->fetch_assoc()) {
    // Cast types so JS gets numbers/booleans, not strings, like the old array did
    $row['id']      = (int)$row['id'];
    $row['rating']  = (float)$row['rating'];
    $row['reviews'] = (int)$row['reviews'];
    $row['bulk']    = (bool)$row['bulk'];
    $vendors[] = $row;
}

echo json_encode($vendors);

$conn->close();
?>
