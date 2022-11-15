var express = require("express");
var router = express.Router();
const { getSVG } = require("../controllers/svg");
const { check } = require("express-validator");
const{body} = require('express-validator');



router.get(
  "/getSVG",
  [
    check("text", "text is required").isLength({ min: 1 }),
    check("font", "font name is required").isLength({ min: 1 }),
    check("union", "Required & Must be a boolean true or false").trim().isBoolean(),
    check("filled", "Required & Must be a boolean true or false").trim().isBoolean(),
    check("kerning", "Required & Must be a boolean true or false").trim().isBoolean(),
    check("separate", "Required & Must be a boolean true or false").trim().isBoolean()
  ],
  getSVG
);
module.exports = router;