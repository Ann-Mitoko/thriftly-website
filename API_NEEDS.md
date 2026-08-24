Team 4:

We consume from team 3:

 API Integration Requirements

Medicine Inventory

Thriftly needs to retrieve available medicine names, quantities, prices, and stock status from Pharmalink to provide market shoppers with a searchable and up-to-date health inventory.

Freshness: Near real-time, with updates within minutes to minimize the risk of displaying or reserving unavailable medicines.
Volume: High, as the endpoint may be accessed during every search and catalog view.
Authentication: None required; public read-only access is sufficient.

Pharmacy Locations

Thriftly needs to retrieve pharmacy location data from Pharmalink to display nearby pharmacy pickup points and provide routing directions to users through the Nairobi market map.

Freshness: Static/low frequency, as pharmacy locations change infrequently and do not require frequent updates.
Volume: Moderate, primarily accessed when users load or interact with the market map.
Authentication: None required; public read-only access is sufficient.

Statement 3: Medicine Reservations

Thriftly needs to create medicine reservations containing the required patient details in order to generate confirmed pickup orders and reservation codes for local buyers.

Freshness: Real-time, since the reservation requires an immediate transactional response and confirmation.
Volume: Low to moderate, as the endpoint is accessed only when a user places a reservation.
Authentication: Required, using an authenticated user token to protect patient information and reservation transactions.

 Audit Alignment Gap 

Mapped Resources: The resources identified for integration, namely Medicines, Pharmacy Locations, and Reservations, map directly to Pharmalink's existing domain model and support Thriftly's core consumer workflows.

Identified Gap : Pharmalink's internal stock-management operations, including pharmacy authentication, adding stock, updating inventory, and deleting medicines, fall within the scope of Pharmalink's administrative portal. These producer-management endpoints are outside Thriftly's requirements and should therefore not be exposed to the consumer application. Thriftly's integration is limited to the read-only resources required for browsing and the authenticated reservation endpoint required for transactions.

 Reflection

During our upstream interview with the Pharmalink team, we learned that Thriftly only requires access to active medicine stock, pharmacy locations, and the reservation endpoint. We initially expected to need broader access to Pharmalink's system, but analysing our actual user flows helped us identify clear system boundaries. This allowed us to avoid integrating unnecessary pharmacy management features and focus only on the resources required by Thriftly.




We are consumed by team 5:

Statement 1: Verified Vendors

Team 5 needs to retrieve verified vendors filtered by category from Thriftly to display category-specific seller listings on their marketplace portal.

 Freshness: Near real-time, with updates within minutes to reflect currently active sellers.
 Volume: High, as the endpoint may be accessed during catalog browsing and search page loads.
 Authentication:None required; public read-only access is sufficient.

Statement 2: Market Locations

Team 5 needs to retrieve physical market locations from Thriftly to display nearby thrift stalls on their interactive Nairobi map.

 Freshness: Static/low frequency, as market locations change infrequently.
 Volume: Moderate, primarily accessed when users load the map.
 Authentication: None required; public read-only access is sufficient.

Statement 3: Buyer Reviews

Team 5 needs to retrieve buyer ratings and comments from Thriftly to display vendor reviews and ratings on product detail and vendor profile pages.

 Freshness: Real time, to ensure users see the latest available reviews.
 Volume: Moderate, as reviews are accessed when users view vendor profiles or product details.
 Authentication: None required; public read-only access is sufficient.

Statement 4: Vendor Reviews

Team 5 needs to create new vendor reviews on Thriftly to allow verified buyers to submit feedback after completing a transaction.

 Freshness: Real-time transactional write, as reviews should be submitted and recorded immediately.
 Volume:Low, as the endpoint is only accessed when a buyer submits feedback.
 Authentication: Required, using an authenticated buyer session to ensure only eligible users can submit reviews.
                                  
                                                        
Audit Alignment Gap

Mapped Resources: The resources identified for integration, namely Vendors, Categories, Markets, and Reviews, map directly to Thriftly's Week 1 resource audit and support Team 5's marketplace workflows.

Identified Gap                                         Team 5 initially requested access to raw user accounts. However, the Week 1 audit restricts access to personal user details for security and privacy reasons. Their access was therefore limited to public vendor profiles and buyer reviews, while internal user-management and administrative operations remain within Thriftly's system.

Reflection

Interviewing Team 5 helped us understand the specific API resources required by a downstream consumer. We found that they mainly need read access to verified vendors, market locations, and reviews, along with one write endpoint for submitting buyer feedback. Comparing these requirements with our Week 1 audit helped us establish clear access boundaries and avoid exposing unnecessary administrative or user-management endpoints.