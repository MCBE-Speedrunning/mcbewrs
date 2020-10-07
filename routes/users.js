const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.json(req.app.get("users"));
});

module.exports = router;
