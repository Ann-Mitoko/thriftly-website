CREATE DATABASE thriftly_db;
USE thriftly_db;

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    banner_color VARCHAR(10)   -- e.g. #f9e4c8, matches your bannerColors map
);

CREATE TABLE markets (
    market_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          
    owner_name VARCHAR(100) NOT NULL,    
    emoji VARCHAR(10),                   
    category_id INT NOT NULL,
    market_id INT NOT NULL,
    price_range VARCHAR(50),             
    condition_grade ENUM('A','B','C') DEFAULT 'B',  
    description TEXT,                    
    phone VARCHAR(20) NOT NULL,          
    instagram VARCHAR(50),              
    hours VARCHAR(100),                  
    is_bulk BOOLEAN DEFAULT FALSE,      
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (market_id) REFERENCES markets(market_id)
);

CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    reviewer_name VARCHAR(100),
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE
);


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('buyer','reseller') DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, banner_color) VALUES
('Vintage', '#f9e4c8'),
('Streetwear', '#d1fae5'),
('Kids', '#fce7f3'),
('Accessories', '#ede9fe'),
('Bulk', '#dbeafe');

INSERT INTO markets (name) VALUES
('Gikomba Market'),
('Eastleigh'),
('Toi Market'),
('Kilimani');

INSERT INTO vendors
(name, owner_name, emoji, category_id, market_id, price_range, condition_grade, description, phone, instagram, hours, is_bulk, status, email)
VALUES
('Mama Njeri''s Closet', 'Grace Njeri', '👗', 1, 1, 'Ksh 150–800', 'A',
 'Over 200 curated vintage pieces, hand-picked and quality-checked before listing. Specialises in 80s and 90s women''s wear.',
 '+254712345678', '@mamanjeri_closet', 'Mon–Sat, 9am–6pm', FALSE, 'verified', 'mamanjeri@example.com'),

('Fresh Threads KE', 'Brian Otieno', '🧢', 2, 1, 'Ksh 200–1200', 'B',
 'Streetwear and urban fashion from global thrift hauls. Jordans, hoodies, cargo pants — fresh drops every weekend.',
 '+254798001234', '@freshthreads_ke', 'Daily, 10am–8pm', FALSE, 'verified', 'freshthreads@example.com'),

('Little Threads', 'Aisha Mohamed', '👶', 3, 2, 'Ksh 50–400', 'A',
 'Quality second-hand children''s clothing from newborn to size 14. School uniforms, play clothes, and occasion wear all available.',
 '+254735678901', '@littlethreads_ke', 'Mon–Fri, 8am–5pm', FALSE, 'verified', 'littlethreads@example.com'),

('The Accessory Box', 'Lydia Wambua', '👜', 4, 3, 'Ksh 100–2000', 'A',
 'Bags, belts, scarves and jewellery curated from high-end donations and vintage estates. Great for gifting.',
 '+254722456789', '@theaccessorybox', 'Tue–Sun, 11am–7pm', FALSE, 'verified', 'accessorybox@example.com'),

('Suit Up Thrift', 'James Kariuki', '👔', 5, 1, 'Bales from Ksh 12,000', 'B',
 'Wholesale suits, blazers and dress shirts for resellers stocking office and event wear. Minimum order applies.',
 '+254701234567', '@suitup_thrift', 'Mon–Fri, 6am–3pm', TRUE, 'verified', 'suitup@example.com'),

('Retro Vibes', 'Cynthia Oduya', '✨', 1, 4, 'Ksh 300–1500', 'A',
 'Y2K and retro pieces popular with students and content creators. Unique looks on a budget — new stock every Wednesday.',
 '+254745678900', '@retrovibes_nbi', 'Wed–Sun, 10am–7pm', FALSE, 'verified', 'retrovibes@example.com');
