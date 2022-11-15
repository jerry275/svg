const { validationResult } = require("express-validator");
var makerjs = require("makerjs");
var opentype = require("../models/opentype.js");
const axios = require("axios");

function callMakerjs(
  font,
  text,
  size,
  union,
  filled,
  kerning,
  separate,
  bezierAccuracy,
  units,
  fill,
  stroke,
  strokeWidth,
  strokeNonScaling,
  fillRule
) {
  //generate the text using a font
  var textModel = new makerjs.models.Text(
    font,
    text,
    size,
    union,
    false,
    bezierAccuracy,
    { kerning: kerning }
  );
  if (separate) {
    for (var i in textModel.models) {
      textModel.models[i].layer = i;
    }
  }
  var svg = makerjs.exporter.toSVG(textModel, {
    fill: filled ? fill : undefined,
    stroke: stroke ? stroke : undefined,
    strokeWidth: strokeWidth ? strokeWidth : undefined,
    fillRule: fillRule ? fillRule : undefined,
    scalingStroke: !strokeNonScaling,
  });
  //console.log(svg);
  return svg;
}

exports.getSVG = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  let promises = [];
  promises.push(
    getFontsFromGoogle(
      "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc"
    )
  );

  Promise.all(promises).then((results) => {
    var data = req.query;

    data = req.query;

    var url;

    results[0].items.forEach(function (font) {
      var variant;

      if (font.family.toLowerCase() === data.font.toLowerCase()) {
        if (data.variant) {
          for (var i = 0; i < font.variants.length; i++) {
            if (font.variants[i].toLowerCase() === data.variant.toLowerCase()) {
              console.log("variant matches" + variant);
              variant = font.variants[i];
              break;
            }
            variant = font.variants[0];
          }
        } else {
          variant = font.variants[0];
        }
        url = font.files[variant].substring(5);
      }
    });
    var resp;
    try {
      
   
      opentype.load("https:" + url, function (err, font) {
        if (err) {
          console.log(err);
        }
        console.log(url);
        var text = data.text;
        var size = data.size ? data.size : 100;
        var union = data.union ? JSON.parse(data.union.toLowerCase()) : false;
        var filled = data.filled ? JSON.parse(data.filled.toLowerCase()) : true;
        var kerning = data.kerning ? JSON.parse(data.kerning.toLowerCase()) : true;
        var separate = data.separate ? JSON.parse(data.separate.toLowerCase()) : false;
        var bezierAccuracy  = undefined;
        try{
          if(data.bezierAccuracy && !isNaN(data.bezierAccuracy) && Number(data.bezierAccuracy) > 0){
            bezierAccuracy = parseFloat(data.bezierAccuracy);
          }
        }catch(err){
          bezierAccuracy = undefined;
        }
        var stroke = data.stroke ? data.stroke : '#000';
        var strokeWidth = data.strokeWidth ? data.strokeWidth : '0.25mm';
        var strokeNonScaling = data.strokeNonScaling
          ? data.strokeNonScaling
          : true;
        var fillRule = data.fillRule ? data.fillRule : 'evenodd';
        var units = data.units ? data.units : 'cm';
        var fill = data.fill ? data.fill : '#000';


    console.log("text "+text+" size "+size+" union "+union+" filled "+filled+" kerning "+kerning+
    " separate "+separate+ " bezierAccuracy "+bezierAccuracy+ " stroke "+stroke+" strokeWidth "+strokeWidth+
    " strokeNonScaling "+strokeNonScaling+" fillRule "+fillRule+" units "+units+" fill "+fill);

        resp = callMakerjs(
          font,
          text,
          size,
          union,
          filled,
          kerning,
          separate,
          bezierAccuracy,
          units,
          fill,
          stroke,
          strokeWidth,
          strokeNonScaling,
          fillRule
        );
        res.clearCookie("token");
        return res.status(200).send(resp);
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
        error: err,
      });
    }
  });
};

function getFontsFromGoogle(url) {
  var aPromise = new Promise(function (resolve, reject) {
    axios({
      method: "get",
      url: url,
    })
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
  return aPromise;
}
