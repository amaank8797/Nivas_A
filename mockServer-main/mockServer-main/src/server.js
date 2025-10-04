const jsonServer = require("json-server");
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// Define the API prefix
const API_PREFIX = "/api/v1";

// Directory for JSON files
const dataDir = path.join(__dirname, "data");

// Create a map of resource names to lowdb instances
const dbMap = {};
fs.readdirSync(dataDir).forEach((file) => {
  if (file.endsWith(".json")) {
    const resourceName = file.replace(".json", ""); // e.g., 'customer', 'product'
    const adapter = new FileSync(path.join(dataDir, file));
    dbMap[resourceName] = low(adapter);
  }
});

// Create a merged DB for json-server router
const db = {};
Object.keys(dbMap).forEach((resource) => {
  db[resource] = dbMap[resource].get(resource).value() || [];
});

// Create router with merged data
const router = jsonServer.router(db, { id: "id" });

// Custom ID generation
router.db._.id = "id";
router.db._.createId = function (coll) {
  return String(coll.length + 1);
};

// Apply middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Import response constants
const { loginResponses, profileResponses } = require("./response");

// Custom API handlers
const apiHandlers = {
  "auth/login": (req, res) => {
    const { email, password, role } = req.body;
    console.log("email, password, role:", email, password, role);

    // Basic validation
    if (
      !email ||
      !password ||
      !role ||
      email.length <= 3 ||
      password.length <= 6
    ) {
      return res.status(400).jsonp({
        error: "Username, password, and role are required with valid lengths",
      });
    }

    // Allowed roles
    const validRoles = ["user", "admin", "hotelmanager"];
    if (!validRoles.includes(role)) {
      return res.status(400).jsonp({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Fetch users from DB
    const users = dbMap.users.get("users").value() || [];

    // Match email, password, and role
    const user = users.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    console.log(loginResponses.success["jwt"], "user details:", user);

    if (user) {
      // Success: return user data + token
      res.jsonp({ ...user, jwt: loginResponses.success["jwt"] });
    } else {
      // Failure
      res.status(401).jsonp(loginResponses.failure);
    }
  },
  "auth/register": (req, res) => {
    const { email, password, role, contactNo, name } = req.body;

    // Basic validation
    if (!email || !password || !role || !contactNo || !name) {
      return res
        .status(400)
        .jsonp({ error: "Username, password, and role are required" });
    }
    if (!["user", "hotelmanager"].includes(role)) {
      return res
        .status(400)
        .jsonp({ error: "Invalid role. Must be user, admin, or hotelmanager" });
    }
    if (email.length <= 3 || password.length <= 6) {
      return res
        .status(400)
        .jsonp({ error: "Username must be > 3 chars and password > 6 chars" });
    }

    const users = dbMap.users.get("users").value() || [];

    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      return res.status(409).jsonp({ error: "Username already exists" });
    }

    // Create new user object
    const newUser = {
      user_id: String(users.length + 1),
      email,
      password,
      role,
      contactNo,
      name,
    };

    // Save to users.json
    dbMap.users.get("users").push(newUser).write();

    // Update in-memory db
    db["users"] = dbMap.users.get("users").value();

    return res
      .status(201)
      .jsonp({ message: "User registered successfully", user: newUser });
  },

  profile: (req, res) => {
    const userProfile = db.users[0];

    if (userProfile) {
      // Use the success response constant and add the profile data
      res.jsonp({
        ...profileResponses.success,
        profile: { email: userProfile.email, id: userProfile.id },
      });
    } else {
      res.status(404).jsonp(profileResponses.failure);
    }
  },
};
function adminOnly(req, res, next) {
  const { role } = req.body; // In real apps, get from JWT
  if (role !== "admin") {
    return res.status(403).jsonp({ error: "Access denied. Admins only." });
  }
  next();
}

// GET /api/v1/users → Get all users
server.get(`${API_PREFIX}/users`, (req, res) => {
  const users = dbMap.users.get("users").value();
  res.jsonp(users);
});

// GET /api/v1/users/role/:role → Get users by role (with optional limit)
server.get(`${API_PREFIX}/users/role/:role`, (req, res) => {
  const role = req.params.role.toLowerCase();
  let records = dbMap.users
    .get("users")
    .filter((u) => u.role.toLowerCase() === role)
    .value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/users/:user_id → Get user by user_id
server.get(`${API_PREFIX}/users/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  const user = dbMap.users.get("users").find({ user_id }).value();
  if (user) {
    res.jsonp(user);
  } else {
    res.status(404).jsonp({ error: "User not found" });
  }
});

// POST /api/v1/users → Create a new user
server.post(`${API_PREFIX}/users`, (req, res) => {
  const newUser = req.body;
  if (!newUser.user_id) {
    newUser.user_id = String(Date.now()); // simple unique ID
  }
  dbMap.users.get("users").push(newUser).write();
  res.status(201).jsonp(newUser);
});
//partch cmd for the status 
server.patch(`${API_PREFIX}/users/:id/status`, (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).jsonp({ error: "Status field is required" });
  }

  const user = dbMap.users.get("users").find({ user_id: userId });

  if (!user.value()) {
    return res.status(404).jsonp({ error: "User not found" });
  }

  user.assign({ status }).write();
  res.status(200).jsonp({ message: "Status updated successfully", user: user.value() });
});

// PATCH /api/v1/users/:user_id → Update a user
server.patch(`${API_PREFIX}/users/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  const updated = dbMap.users
    .get("users")
    .find({ user_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "User not found" });
  }
});

// DELETE /api/v1/users/:user_id → Delete a user
server.delete(`${API_PREFIX}/users/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  const removed = dbMap.users.get("users").remove({ user_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "User not found" });
  }
});

server.use(
  "/images",
  jsonServer.defaults({ static: path.join(__dirname, "images") })
);
// GET /api/v1/hotels → Get all hotels
server.get(`${API_PREFIX}/hotels`, (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/images`;

  const hotels = dbMap.hotels
    .get("hotels")
    .map((hotel) => ({
      ...hotel,
      image: `${baseUrl}/${hotel.image}`,
    }))
    .value();

  res.jsonp(hotels);
});

// GET /api/v1/hotels/location/:location → Get hotels by location (with optional limit)
server.get(`${API_PREFIX}/hotels/location/:location`, (req, res) => {
  const location = req.params.location.toLowerCase();
  let records = dbMap.hotels
    .get("hotels")
    .filter((h) => h.location.toLowerCase() === location)
    .value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/hotels/:hotel_id → Get hotel by hotel_id
server.get(`${API_PREFIX}/hotels/:hotel_id`, (req, res) => {
  const hotel_id = req.params.hotel_id;
  const hotel = dbMap.hotels.get("hotels").find({ hotel_id }).value();
  if (hotel) {
    res.jsonp(hotel);
  } else {
    res.status(404).jsonp({ error: "Hotel not found" });
  }
});

// POST /api/v1/hotels → Create a new hotel
server.post(`${API_PREFIX}/hotels`, (req, res) => {
  const newHotel = req.body;
  if (!newHotel.hotel_id) {
    newHotel.hotel_id = "H" + Date.now(); // simple unique ID
  }
  dbMap.hotels.get("hotels").push(newHotel).write();
  res.status(201).jsonp(newHotel);
});

// PATCH /api/v1/hotels/:hotel_id → Update a hotel
server.patch(`${API_PREFIX}/hotels/:hotel_id`, (req, res) => {
  const hotel_id = req.params.hotel_id;
  const updated = dbMap.hotels
    .get("hotels")
    .find({ hotel_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Hotel not found" });
  }
});

// DELETE /api/v1/hotels/:hotel_id → Delete a hotel
server.delete(`${API_PREFIX}/hotels/:hotel_id`, (req, res) => {
  const hotel_id = req.params.hotel_id;
  const removed = dbMap.hotels.get("hotels").remove({ hotel_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Hotel not found" });
  }
});

// GET /api/v1/rooms/type/:type → Get rooms by type (with optional limit)
server.get(`${API_PREFIX}/rooms/type/:type`, (req, res) => {
  const type = req.params.type.toLowerCase();
  let records = dbMap.rooms
    .get("rooms")
    .filter((r) => r.type.toLowerCase() === type)
    .value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/rooms/:room_id → Get room by room_id
server.get(`${API_PREFIX}/rooms/:room_id`, (req, res) => {
  const room_id = req.params.room_id;
  const room = dbMap.rooms.get("rooms").find({ room_id }).value();
  if (room) {
    res.jsonp(room);
  } else {
    res.status(404).jsonp({ error: "Room not found" });
  }
});

// POST /api/v1/rooms → Create a new room
server.post(`${API_PREFIX}/rooms`, (req, res) => {
  const newRoom = req.body;
  if (!newRoom.room_id) {
    newRoom.room_id = "R" + Date.now(); // simple unique ID
  }
  dbMap.rooms.get("rooms").push(newRoom).write();
  res.status(201).jsonp(newRoom);
});

// PATCH /api/v1/rooms/:room_id → Update a room
server.patch(`${API_PREFIX}/rooms/:room_id`, (req, res) => {
  const room_id = req.params.room_id;
  const updated = dbMap.rooms
    .get("rooms")
    .find({ room_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Room not found" });
  }
});

// DELETE /api/v1/rooms/:room_id → Delete a room
server.delete(`${API_PREFIX}/rooms/:room_id`, (req, res) => {
  const room_id = req.params.room_id;
  const removed = dbMap.rooms.get("rooms").remove({ room_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Room not found" });
  }
});

// GET /api/v1/payment → Get all payments
server.get(`${API_PREFIX}/payment`, (req, res) => {
  const payments = dbMap.payment.get("payment").value();
  res.jsonp(payments);
});

// GET /api/v1/payment/user/:user_id → Get payments by user_id (with optional limit)
server.get(`${API_PREFIX}/payment/user/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  let records = dbMap.payment.get("payment").filter({ user_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/payment/:payment_id → Get payment by payment_id
server.get(`${API_PREFIX}/payment/:payment_id`, (req, res) => {
  const payment_id = req.params.payment_id;
  const payment = dbMap.payment.get("payment").find({ payment_id }).value();
  if (payment) {
    res.jsonp(payment);
  } else {
    res.status(404).jsonp({ error: "Payment not found" });
  }
});

// POST /api/v1/payment → Create a new payment
server.post(`${API_PREFIX}/payment`, (req, res) => {
  const newPayment = req.body;
  if (!newPayment.payment_id) {
    newPayment.payment_id = "P" + Date.now(); // simple unique ID
  }
  dbMap.payment.get("payment").push(newPayment).write();
  res.status(201).jsonp(newPayment);
});

// PATCH /api/v1/payment/:payment_id → Update payment
server.patch(`${API_PREFIX}/payment/:payment_id`, (req, res) => {
  const payment_id = req.params.payment_id;
  const updated = dbMap.payment
    .get("payment")
    .find({ payment_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Payment not found" });
  }
});

// DELETE /api/v1/payment/:payment_id → Delete payment
server.delete(`${API_PREFIX}/payment/:payment_id`, (req, res) => {
  const payment_id = req.params.payment_id;
  const removed = dbMap.payment.get("payment").remove({ payment_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Payment not found" });
  }
});

// GET /api/v1/bookings → Get all bookings
// GET /api/v1/bookings → Get all bookings with user, hotel, and room details
server.get(`${API_PREFIX}/bookings`, (req, res) => {
  const bookings = dbMap.bookings.get("bookings").value();
  const users = dbMap.users.get("users").value();
  const hotels = dbMap.hotels.get("hotels").value();
  const rooms = dbMap.rooms.get("rooms").value();

  // Join data
  const enrichedBookings = bookings.map(booking => {
    const user = users.find(u => u.user_id === booking.user_id);
    const hotel = hotels.find(h => h.hotel_id === booking.hotel_id);
    const room = rooms.find(r => r.room_id === booking.room_id);

    return {
      booking_id: booking.booking_id,
      user_id:booking.user_id,
      hotel_id:booking.hotel_id,
      room_id:booking.room_id,
      payment_id:booking.payment_id,
      status:booking.status,
      checkIn: booking.checkindate,
      checkoutdate: booking.checkoutdate,
      status: booking.status,
      guestName: user ? user.name : null,
      hotel: hotel ? hotel.name : null,
      roomType: room ? room.type : null
    };
  });

  res.jsonp(enrichedBookings);
});


// GET /api/v1/bookings/user/:user_id → Get bookings by user_id (with optional limit)
server.get(`${API_PREFIX}/bookings/user/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  let records = dbMap.bookings.get("bookings").filter({ user_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/bookings/room/:room_id → Get bookings by room_id (with optional limit)
server.get(`${API_PREFIX}/bookings/room/:room_id`, (req, res) => {
  const room_id = req.params.room_id;
  let records = dbMap.bookings.get("bookings").filter({ room_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/bookings/:booking_id → Get booking by booking_id
server.get(`${API_PREFIX}/bookings/:booking_id`, (req, res) => {
  const booking_id = req.params.booking_id;
  const booking = dbMap.bookings.get("bookings").find({ booking_id }).value();
  if (booking) {
    res.jsonp(booking);
  } else {
    res.status(404).jsonp({ error: "Booking not found" });
  }
});

// POST /api/v1/bookings → Create a new booking
server.post(`${API_PREFIX}/bookings`, (req, res) => {
  const newBooking = req.body;
  if (!newBooking.booking_id) {
    newBooking.booking_id = "B" + Date.now(); // simple unique ID
  }
  dbMap.bookings.get("bookings").push(newBooking).write();
  res.status(201).jsonp(newBooking);
});

// PATCH /api/v1/bookings/:booking_id → Update booking
server.patch(`${API_PREFIX}/bookings/:booking_id`, (req, res) => {
  const booking_id = req.params.booking_id;
  const updated = dbMap.bookings
    .get("bookings")
    .find({ booking_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Booking not found" });
  }
});

// DELETE /api/v1/bookings/:booking_id → Delete booking
server.delete(`${API_PREFIX}/bookings/:booking_id`, (req, res) => {
  const booking_id = req.params.booking_id;
  const removed = dbMap.bookings.get("bookings").remove({ booking_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Booking not found" });
  }
});

// GET /api/v1/reviews → Get all reviews
// server.get(`${API_PREFIX}/reviews`, (req, res) => {
//   const reviews = dbMap.reviews.get("reviews").value();
//   res.jsonp(reviews);
// });
server.get(`${API_PREFIX}/reviews`, (req, res) => {
  const reviews = dbMap.reviews.get("reviews").value();
  const users = dbMap.users.get("users").value();

  // Attach user info to each review
  const reviewsWithUser = reviews.map((review) => {
    const user = users.find((u) => u.user_id === review.user_id);
    return {
      ...review,
      name: user ? user.name : "Unknown",
      username: user ? user.username : "",
      email: user ? user.email : "",
      role: user ? user.role : "",
      contactnumber: user ? user.contactnumber : "",
    };
  });

  res.jsonp(reviewsWithUser);
});

// GET /api/v1/reviews/hotel/:hotel_id → Get reviews by hotel_id (with optional limit)
server.get(`${API_PREFIX}/reviews/hotel/:hotel_id`, (req, res) => {
  const hotel_id = req.params.hotel_id;
  let records = dbMap.reviews.get("reviews").filter({ hotel_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// GET /api/v1/reviews/user/:user_id → Get reviews by user_id (with optional limit)
server.get(`${API_PREFIX}/reviews/user/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  let records = dbMap.reviews.get("reviews").filter({ user_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// POST /api/v1/reviews → Create a new review
server.post(`${API_PREFIX}/reviews`, (req, res) => {
  const newReview = req.body;
  if (!newReview.review_id) {
    newReview.review_id = "RV" + Date.now(); // simple unique ID
  }
  dbMap.reviews.get("reviews").push(newReview).write();
  res.status(201).jsonp(newReview);
});

// PATCH /api/v1/reviews/:review_id → Update a review
server.patch(`${API_PREFIX}/reviews/:review_id`, (req, res) => {
  const review_id = req.params.review_id;
  const updated = dbMap.reviews
    .get("reviews")
    .find({ review_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Review not found" });
  }
});

// DELETE /api/v1/reviews/:review_id → Delete a review
server.delete(`${API_PREFIX}/reviews/:review_id`, (req, res) => {
  const review_id = req.params.review_id;
  const removed = dbMap.reviews.get("reviews").remove({ review_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Review not found" });
  }
});

// GET /api/v1/loyalty → Get all loyalty records
server.get(`${API_PREFIX}/loyalty`, (req, res) => {
  const loyalty = dbMap.loyalty.get("loyalty").value();
  res.jsonp(loyalty);
});

// GET /api/v1/loyalty/:user_id → Get loyalty record(s) by user_id (with optional limit)
server.get(`${API_PREFIX}/loyalty/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  let records = dbMap.loyalty.get("loyalty").filter({ user_id }).value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// POST /api/v1/loyalty → Create a new loyalty record
server.post(`${API_PREFIX}/loyalty`, (req, res) => {
  const newRecord = req.body;
  if (!newRecord.loyalty_id) {
    newRecord.loyalty_id = "L" + Date.now(); // simple unique ID
  }
  dbMap.loyalty.get("loyalty").push(newRecord).write();
  res.status(201).jsonp(newRecord);
});

// PATCH /api/v1/loyalty/:user_id → Update loyalty record by user_id
server.patch(`${API_PREFIX}/loyalty/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  const updated = dbMap.loyalty
    .get("loyalty")
    .find({ user_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Loyalty record not found" });
  }
});

// DELETE /api/v1/loyalty/:user_id → Delete loyalty record by user_id
server.delete(`${API_PREFIX}/loyalty/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  const removed = dbMap.loyalty.get("loyalty").remove({ user_id }).write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Loyalty record not found" });
  }
});

// GET /api/v1/redemptions → Get all redemptions
server.get(`${API_PREFIX}/redemptions`, (req, res) => {
  const redemptions = dbMap.redemptions.get("redemptions").value();
  res.jsonp(redemptions);
});

// GET /api/v1/redemptions/:user_id → Get redemptions by user_id (with optional limit)
server.get(`${API_PREFIX}/redemptions/:user_id`, (req, res) => {
  const user_id = req.params.user_id;
  let records = dbMap.redemptions
    .get("redemptions")
    .filter({ user_id })
    .value();

  // Apply limit if query param exists
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    records = records.slice(0, limit);
  }

  res.jsonp(records);
});

// POST /api/v1/redemptions → Create a new redemption
server.post(`${API_PREFIX}/redemptions`, (req, res) => {
  const newRedemption = req.body;
  if (!newRedemption.redemption_id) {
    newRedemption.redemption_id = "RD" + Date.now(); // simple unique ID
  }
  dbMap.redemptions.get("redemptions").push(newRedemption).write();
  res.status(201).jsonp(newRedemption);
});

// PATCH /api/v1/redemptions/:redemption_id → Update redemption by ID
server.patch(`${API_PREFIX}/redemptions/:redemption_id`, (req, res) => {
  const redemption_id = req.params.redemption_id;
  const updated = dbMap.redemptions
    .get("redemptions")
    .find({ redemption_id })
    .assign(req.body)
    .write();
  if (updated) {
    res.jsonp(updated);
  } else {
    res.status(404).jsonp({ error: "Redemption not found" });
  }
});

// DELETE /api/v1/redemptions/:redemption_id → Delete redemption by ID
server.delete(`${API_PREFIX}/redemptions/:redemption_id`, (req, res) => {
  const redemption_id = req.params.redemption_id;
  const removed = dbMap.redemptions
    .get("redemptions")
    .remove({ redemption_id })
    .write();
  if (removed.length > 0) {
    res.status(204).end();
  } else {
    res.status(404).jsonp({ error: "Redemption not found" });
  }
});

// Register custom routes with API prefix
Object.entries(apiHandlers).forEach(([path, handler]) => {
  const fullPath = `${API_PREFIX}/${path}`;
  // Use POST for login, GET for profile
  if (path === "auth/login" || path === "auth/register") {
    server.post(fullPath, handler);
  } else {
    server.get(fullPath, handler);
  }
  console.log(`Registered handler for: ${fullPath}`);
});

// Apply router for other CRUD operations
server.use(API_PREFIX, router);

server.listen(3000, () => {
  console.log("JSON Server is running on port 3000");
});
