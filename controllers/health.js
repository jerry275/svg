exports.health = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
       health: "ok",
    });
};
