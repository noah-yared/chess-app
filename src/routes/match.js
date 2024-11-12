const express = require("express");
const router = express.Router();
const { join } = require("path");

router.get("/local-match", (req, res) => {
  res.sendFile(join(__dirname, "../../public/local-chess.html"));
});

router.get("/online-match", (req, res) => {
  res.sendFile(join(__dirname, "../../public/online-chess.html"));
});

module.exports = router;