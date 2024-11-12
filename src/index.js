const express = require("express");
const { createServer } = require("http");
const app = express();
const httpServer = createServer(app);
const cors = require("cors");
const { join } = require("path");
require("dotenv").config();

app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/styles', express.static(join(__dirname, "../assets/styles")));
app.use('/images', express.static(join(__dirname, "../assets/images")));
app.use('/game', express.static(join(__dirname, "./game.js"))); 

const matchRoutes = require("./routes/match.js");
app.use(matchRoutes);

const io = require("./routes/sockets.js")(httpServer);

httpServer.listen(3000, () => {
  console.log("Listening on port 3000.");
});