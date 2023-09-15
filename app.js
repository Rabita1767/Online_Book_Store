const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const databaseConnection = require("./config/database");
const userModel = require("./models/users");
const app = express();
const myRoutes = require("./routes/Auth");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", myRoutes);
app.use("/book", bookRoutes);
app.use("/user", userRoutes);
app.use(myRoutes);
app.use(bookRoutes);
app.use(userRoutes);
app.use(cors({ origin: "*" }));

databaseConnection(() => {
    app.listen(8000, () => {
        console.log(`Server is running on port ${8000}`)
    })
})