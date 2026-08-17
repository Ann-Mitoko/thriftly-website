<?php
// db_connect.php
// Central DB connection - include this at the top of any PHP file that talks to the DB

$host = "localhost";
$user = "root";       // change if your MySQL user isn't root
$pass = "";           // change if your MySQL has a password set
$dbname = "thriftly_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    // Send a clean JSON error instead of letting PHP dump a raw error to the page
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
?>
