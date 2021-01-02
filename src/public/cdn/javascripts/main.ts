/*
 * Color changing
 */
function colorChange() {
	const color_preference = document.getElementById("colorPreferance");

	if (colorPreferance.checked == true) preferesDark();
	else preferesLight();
}

/*
 * Fancy transition between dark mode and light mode
 */
function trans() {
	// Add class
	document.documentElement.classList.add("transition");
	// Wait for the animation to finish then remove the class
	window.setTimeout(() => {
		document.documentElement.classList.remove("transition");
	}, 1000);
}

/*
 * This function is used whenever dark preferance is used
 */
function preferesDark() {
	// Start the transition
	trans();
	// Save the preferance
	localStorage.setItem("colorMode", "Dark");
	// Check the box to make it look like dark mode is enabled
	document.getElementById("colorPreferance").checked = true;
	// Add the dark mode css
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/cdn/stylesheets/dark.css">';

	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	document.querySelectorAll(".card").forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

/*
 * This function is used whenever
 * light preferance is used
 */
function preferesLight() {
	// Start the transition
	trans();

	// Save the preferance
	localStorage.setItem("colorMode", "Light");
	document.getElementById("colorPreferance").checked = false;
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/cdn/stylesheets/light.css">';

	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-dark");
		el.classList.add("table-light");
	});

	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-dark");
		el.classList.add("navbar-light");
	});

	document.querySelectorAll(".card").forEach((el) => {
		el.classList.remove("bg-dark");
		el.classList.add("bg-light");
	});
}

function preferesNether() {
	// Start the transition
	trans();
	// Save the preferance
	localStorage.setItem("colorMode", "Nether");
	// Check the box to make it look like dark mode is enabled
	document.getElementById("colorPreferance").checked = true;
	// Add the dark mode css
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/cdn/stylesheets/nether.css">';

	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	document.querySelectorAll(".card").forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

function preferesChristmas() {
	// Start the transition
	trans();
	// Save the preferance
	localStorage.setItem("colorMode", "Christmas");
	// Check the box to make it look like light mode is enabled
	document.getElementById("colorPreferance").checked = false;
	// Add the dark mode css
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/cdn/stylesheets/christmas.css">';

	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	document.querySelectorAll(".card").forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

/*
 * When the user changes their native
 * color scheme make sure to change too
 */
function handleColorChange(event) {
	if (event.matches) preferesDark();
	else preferesLight();
}

const mql = matchMedia("(prefers-color-scheme: dark)");
mql.onchange = handleColorChange;

const preferedColorScheme = localStorage.getItem("colorMode");

// If the user already has a preferance respect it
if (preferedColorScheme == "Light") preferesLight();
else if (preferedColorScheme == "Nether") preferesNether();
else if (preferedColorScheme == "Christmas") preferesChristmas();
else preferesDark();

document
	.getElementById("colorPreferance")
	.addEventListener("click", colorChange, true);

// Add active class to active link
const navLinks = document.querySelectorAll(".nav-link");
for (let i = 0; i < navLinks.length; i++) {
	if (navLinks[i].getAttribute("href") === location.pathname) {
		navLinks[i].classList.add("active");
	}
}

// Nothing interesting
const shakeEvent = new Shake({
	threshold: 15, // optional shake strength threshold
	timeout: 1000, // optional, determines the frequency of event generation
});
shakeEvent.start();
window.addEventListener("shake", preferesNether, false);
try {
	const listener = new window.keypress.Listener();
	listener.sequence_combo("d r e a m space b a d", preferesNether, true);
	listener.sequence_combo(
		"j i n g l e space b e l l s",
		preferesChristmas,
		true
	);
} catch (TypeError) {
	console.log(
		"Javascript component blocked by the client. Continuing execution."
	);
}

// Use twemoji's
window.addEventListener("load", () => {
	if (screen.width >= 1079)
		twemoji.parse(document.body, { ext: ".svg", folder: "svg" });
	else twemoji.parse(document.body);
});
