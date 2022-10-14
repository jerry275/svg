var express = require("express");
var router = express.Router();
const { getSVG } = require("../controllers/svg");
const { check } = require("express-validator");


router.post(
  "/getSVG",
  [
    check("text", "text is required").isLength({ min: 1 }),
    check("font", "font name is required").isLength({ min: 1 })
  ],
  getSVG
);
module.exports = router;