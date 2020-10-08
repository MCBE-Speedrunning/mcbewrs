const express = require("express");
const router = express.Router();
const auths = [];

function makeid(length) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.render("admin");
});

router.post("/login", function (req, res, next) {
	console.log(req.body);
	if (req.body.password == "lalala") {
		let auth = makeid(10);
		auths.push(auth);
		res.json({ auth });
	}
});

router.post("/verify", function (req, res, next) {
	console.log(req.body);
	if (req.body.auth in auths) {
		res.status(200).send("Authentificated");
	}
});

router.get("/add", function (req, res, next) {
	res.render("admin.add.pug");
});

module.exports = router;
