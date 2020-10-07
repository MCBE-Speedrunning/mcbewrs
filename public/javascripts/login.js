if (!sessionStorage.auth) {
	let password = prompt("Type in the password");
	fetch("/admin/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ password: password }),
	}).then((response) => {
		if (response.ok) {
			response.json().then((data) => (sessionStorage.auth = data.auth));
			location.href = "";
		}
	});
} else {
	fetch("/admin/verify", {
		method: "POST",
		body: { auth: sessionStorage.auth },
	}).then((response) => {
		if (!response.ok) {
			alert("nonono");
		} else {
			alert("yesyesyes");
		}
	});
}
