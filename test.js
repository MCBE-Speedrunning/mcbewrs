var sqlite3 = require("sqlite3").verbose();
var file = "./data/leaderboard";
var db = new sqlite3.Database(file);
db.all("SELECT rowid, * FROM runner", function (err, rows) {
	rows.forEach(function (row) {
		console.log(row.rowid, row.name, row.nationality);
	});
});
db.close();
