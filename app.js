const express = require("express");
const session = require('express-session');
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const databaseConnection = require("./config/database");
const userModel = require("./models/users");
const app = express();
const myRoutes = require("./routes/Auth");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'hello', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    // Additional options if needed
    // cookie: { secure: true }, // Use for HTTPS-only cookies (requires HTTPS)
    // store: sessionStore, // Use a specific session store (e.g., Redis, MongoDB)
}));
app.use("/auth", myRoutes);
app.use("/book", bookRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);

app.use(myRoutes);
app.use(bookRoutes);
app.use(userRoutes);
app.use(cartRoutes);
app.use(cors({ origin: "*" }));

databaseConnection(() => {
    app.listen(8000, () => {
        console.log(`Server is running on port ${8000}`)
    })
})