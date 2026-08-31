 Team 4  


| Method | Path     |       Purpose               | Maps to Need |

| GET    | /vendors | Return all verified vendors | "Needs to retrieve all verified vendors from Thriftly in order to display active thrift seller listings on their marketplace portal." |

| GET    | /vendors/:id | Return a single vendor's full profile by ID | "Needs to retrieve a single vendor's full profile by ID from Thriftly in order to display complete stall details on their vendor detail page." |

| GET    | /vendors?category=Vintage&market=Gikomba | Return vendors filtered by category and/or market location | "Needs to search and filter vendors by keyword, category, or market location in order to return relevant results for users actively searching the marketplace." |

| GET    | /markets | Return all physical market locations in Nairobi | "Needs to retrieve all physical market locations from Thriftly in order to display nearby thrift stalls on their interactive Nairobi map." |

| GET    | /categories | Return all available product categories | "Needs to retrieve all available product categories from Thriftly in order to populate category filter options on their marketplace browsing interface." |

| GET    | /vendors/:id/reviews | Return all buyer reviews for a specific vendor | "Needs to retrieve buyer ratings and comments for a specific vendor in order to display vendor reviews and ratings on product detail and vendor profile pages." |

| POST   | /vendors/:id/reviews | Submit a new buyer review for a specific vendor | "Needs to create new vendor reviews on Thriftly in order to allow verified buyers to submit feedback after completing a transaction." |