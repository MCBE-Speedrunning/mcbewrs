const express = require("express");
const router = express.Router();

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

router.get("/leaderboard", function (req, res, next) {
	leaderboard = req.app.get("leaderboard");
	if (req.headers == "application/json") {
		res.json(leaderboard);
	} else {
		/* WIP
		res.set('Content-Type', 'text/xml');
		res.send(xml(JSON.stringify(leaderboard)))
		*/
		res.json(leaderboard);
	}
});

router.post("/run/add", function (req, res, next) {
	leaderboard = req.app.get("leaderboard");
	if (req.body) {
		do {
			id = makeid(5);
		} while (!id in leaderboard);
		leaderboard[id] = req.body;
		res.json(leaderboard);
	}
});

router.get("/run/:runid", function (req, res, next) {
	leaderboard = req.app.get("leaderboard");
	res.json(leaderboard[req.params.runid]);
});

router.delete("/run/:runid", function (req, res, next) {
	leaderboard = req.app.get("leaderboard");
	delete leaderboard[req.params.runid];
	res.json(leaderboard);
});

router.patch("/run/:runid", function (req, res, next) {
	leaderboard = req.app.get("leaderboard");
	if (req.body) {
		for (key in req.body) {
			leaderboard[req.params.runid][key] = req.body[key];
		}
		res.json(leaderboard);
	}
});

module.exports = router;
