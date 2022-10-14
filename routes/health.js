var express = require("express");
var router = express.Router();
const { health } = require("../controllers/health");

router.get(
  "/health",
  health
);
module.exports = router;