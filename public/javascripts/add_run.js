document.getElementById("add").addEventListener("click", () => {
	const run = {};
	run.players = document.querySelector("input[name='name']").value.split(",");
	run.category = document.querySelector("select[name='category']").value;
	run.date = document.querySelector("input[name='date']").value;
	run.time = document.querySelector("input[name='time']").value;
	run.platform = document.querySelector("input[name='platform']").value;
	run.version = document.querySelector("input[name='version']").value;
	run.link = document.querySelector("input[name='link']").value;
	fetch("/admin/add", {
		method: "POST",
		body: JSON.stringify(run),
	}).then((response) => global.response);
});
