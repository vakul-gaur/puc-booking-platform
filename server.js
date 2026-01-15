const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

// Database Connection

const MONGO_URL = "mongodb://127.0.0.1:27017/puc-booking-platform";
main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => console.log(err));

    async function main() {
    await mongoose.connect(MONGO_URL);
}  

// Middleware Setup

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Home Route

app.get("/puc-booking-platform", async (req, res) => {
    res.render("index/index.ejs");
});

// 404 Route Handler

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", {message});
});

// Server Listening

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
})