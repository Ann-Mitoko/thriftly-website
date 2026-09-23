Questions on PharmaLink API (Team 3) — openapi.yaml

1. GET /pharmacies doesn't return a pharmacy ID, but every other endpoint requires one

The Pharmacy schema returned by GET /pharmacies only has name, location, distance, eta, and
verified — there's no id or pharmacy_id field anywhere in it. But GET /inventory requires a
pharmacy_id query parameter, and POST /reservations requires pharmacy_id in the request body.

If we call GET /pharmacies first (as the natural first step), we have no way to get the ID we'd
need for the next two calls. Is pharmacy_id meant to be added to the Pharmacy schema, or is there
a different field (like name) we're supposed to use to identify a pharmacy across endpoints?

2. POST /reservations doesn't specify which medicine is being reserved

ReservationRequest only requires pharmacy_id, pickup_window_start, and pickup_window_end — there's
no field identifying which medicine or inventory item the reservation is actually for. Given the
endpoint's own description says it reserves "a specific pharmacy location and time window," but
our integration need is specifically about reserving a medicine for pickup, is there a missing
field here (e.g. medicine_id or inventory_item_id), or is a reservation meant to just book a time
slot at a pharmacy generally, with the medicine handled separately?

3. No authentication scheme is defined anywhere in the spec for POST /reservations

There's no security: block anywhere in the file, and no securitySchemes defined under
components. Since a reservation involves personal pickup details, we assumed this endpoint would
require an authenticated request. Is authentication planned but just not documented yet, and if
so, what scheme (API key, bearer token, etc.) should we expect to implement against?

4. distance and eta on GET /pharmacies have no stated point of origin

The Pharmacy schema includes distance (a float) and eta (a string), but GET /pharmacies has no
location, lat, or lng query parameter — nothing that tells the API where to measure distance
and ETA from. Is there an implicit origin (e.g. a fixed market location), or is a location
parameter missing from this endpoint that we should expect to pass in?