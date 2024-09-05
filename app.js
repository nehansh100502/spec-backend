
const express = require("express");
const app = express();
const cors = require("cors")
// const axios = require('axios');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "config/config.env" });
}
const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests from your frontend origin
    credentials: true,              // Allow credentials (cookies, etc.)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Session = require("./routes/session");
const User = require("./routes/user");
const Collection = require("./routes/collection")
const Offer = require("./routes/offer")

app.use("/api/v1", Session);
app.use("/api/v1", User);
app.use("/api/v1", Collection);
app.use("/api/v1", Offer);

module.exports = app;

