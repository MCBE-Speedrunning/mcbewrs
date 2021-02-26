// Types and other definitions
declare const Shake: any;
declare const twemoji: any;

// Global variables
const preferedColorScheme = localStorage.getItem("colorMode");
const colorPreferance = document.getElementById("colorPreferance")! as HTMLInputElement;
const colorScheme = document.getElementById("colorScheme")!;
const tableClasses = document.querySelectorAll(".table");
const cardClasses = document.querySelectorAll(".card");
const navEl = document.querySelectorAll("nav");
const navLinks = document.querySelectorAll(".nav-link");
const documentClasses = document.documentElement.classList;

function colorChange() {
	if (colorPreferance.checked)
		preferesDark();
	else
		preferesLight();
}

/* Fancy transition between dark mode and light mode */
function trans() {
	documentClasses.add("transition");
	// Wait for the animation to finish then remove the class
	setTimeout(() => { documentClasses.remove("transition"); }, 1000);
}

function preferesDark() {
	trans();
	localStorage.setItem("colorMode", "Dark");
	colorPreferance.checked = true;
	colorScheme.innerHTML =
	    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/cdn/stylesheets/dark.css\">";

	tableClasses.forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	navEl.forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	cardClasses.forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

function preferesLight() {
	trans();
	localStorage.setItem("colorMode", "Light");
	colorPreferance.checked = false;
	colorScheme.innerHTML =
	    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/cdn/stylesheets/light.css\">";

	tableClasses.forEach((el) => {
		el.classList.remove("table-dark");
		el.classList.add("table-light");
	});

	navEl.forEach((el) => {
		el.classList.remove("navbar-dark");
		el.classList.add("navbar-light");
	});

	cardClasses.forEach((el) => {
		el.classList.remove("bg-dark");
		el.classList.add("bg-light");
	});
}

function preferesNether() {
	trans();
	localStorage.setItem("colorMode", "Nether");
	colorPreferance.checked = true;
	colorScheme.innerHTML =
	    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/cdn/stylesheets/nether.css\">";

	tableClasses.forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	navEl.forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	cardClasses.forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

function preferesChristmas() {
	trans();
	localStorage.setItem("colorMode", "Christmas");
	colorPreferance.checked = false;
	colorScheme.innerHTML =
	    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/cdn/stylesheets/christmas.css\">";

	tableClasses.forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});

	navEl.forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});

	cardClasses.forEach((el) => {
		el.classList.remove("bg-light");
		el.classList.add("bg-dark");
	});
}

/*
 * When the user changes their native color scheme make sure to change too.
 */
const mql = matchMedia("(prefers-color-scheme: dark)");
mql.onchange = (event) => {
	if (event.matches)
		preferesDark();
	else
		preferesLight();
};

// If the user already has a preferance respect it
switch (preferedColorScheme) {
case "Light":
	preferesLight();
	break;
case "Nether":
	preferesNether();
	break;
case "Christmas":
	preferesChristmas();
	break;
default:
	preferesDark();
}

colorPreferance.addEventListener("click", colorChange, true);

// Add active class to active link
for (let i = 0; i < navLinks.length; i++)
	if (navLinks[i].getAttribute("href") === location.pathname)
		navLinks[i].classList.add("active");

try {
	// @ts-ignore window.keypress is defined in `../components/Keypress/`
	const listener = new window.keypress.Listener();
	listener.sequence_combo("d r e a m space b a d", preferesNether, true);
	listener.sequence_combo("j i n g l e space b e l l s", preferesChristmas, true);
} catch (TypeError) {
	console.log("Javascript component blocked by the client. Continuing execution.");
}

window.onscroll = () => {
	if ((window.innerHeight + window.scrollY - 200) >= document.body.offsetHeight)
		preferesNether();
};

// Use twemoji's
window.addEventListener("load", () => {
	if (screen.width >= 1079)
		twemoji.parse(document.body, {ext: ".svg", folder: "svg"});
	else
		twemoji.parse(document.body);
});
