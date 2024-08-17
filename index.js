require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookiePaser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user");
const commentRoute = require("./routes/comment");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(bodyParser.json());

const uri = process.env.MONGO_URL;

if (!uri) {
  throw new Error("The MONGODB_URI environment variable is not set.");
}

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use("/user", userRoute);
app.use("/api", commentRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));

// module.exports = app;
