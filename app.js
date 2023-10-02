const express = require("express");
const cors = require('cors');
const session = require('express-session');
const dotenv = require("dotenv");
dotenv.config();
const databaseConnection = require("./config/database");
const userModel = require("./models/users");
const app = express();
// app.use(cors());
app.use(cors({ origin: "*" }));
const myRoutes = require("./routes/Auth");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const validateJSON = require("./middleware/auth");
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
//app.use(validateJSON.validateJSON);
app.use("/auth", myRoutes);
app.use("/book", bookRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);

app.use(myRoutes);
app.use(bookRoutes);
app.use(userRoutes);
app.use(cartRoutes);
// app.use(cors({ origin: "*" }));

databaseConnection(() => {
    app.listen(8000, () => {
        console.log(`Server is running on port ${8000}`)
    })
})