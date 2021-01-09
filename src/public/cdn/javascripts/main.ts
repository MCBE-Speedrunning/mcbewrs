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
/*
 * Color changing
 */
function colorChange() {
	if (colorPreferance.checked == true)
		preferesDark();
	else
		preferesLight();
}

/*
 * Fancy transition between dark mode and light mode
 */
function trans() {
	// Add class
	documentClasses.add("transition");
	// Wait for the animation to finish then remove the class
	setTimeout(() => { documentClasses.remove("transition"); }, 1000);
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
	colorPreferance.checked = true;
	// Add the dark mode css
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

/*
 * This function is used whenever
 * light preferance is used
 */
function preferesLight() {
	// Start the transition
	trans();

	// Save the preferance
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
	// Start the transition
	trans();
	// Save the preferance
	localStorage.setItem("colorMode", "Nether");
	// Check the box to make it look like dark mode is enabled
	colorPreferance.checked = true;
	// Add the dark mode css
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
	// Start the transition
	trans();
	// Save the preferance
	localStorage.setItem("colorMode", "Christmas");
	// Check the box to make it look like light mode is enabled
	colorPreferance.checked = false;
	// Add the dark mode css
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
 * When the user changes their native
 * color scheme make sure to change too
 */
const mql = matchMedia("(prefers-color-scheme: dark)");
mql.onchange = (event) => {
	if (event.matches)
		preferesDark();
	else
		preferesLight();
};

// If the user already has a preferance respect it
if (preferedColorScheme == "Light")
	preferesLight();
else if (preferedColorScheme == "Nether")
	preferesNether();
else if (preferedColorScheme == "Christmas")
	preferesChristmas();
else
	preferesDark();

colorPreferance.addEventListener("click", colorChange, true);

// Add active class to active link
for (let i = 0; i < navLinks.length; i++) {
	if (navLinks[i].getAttribute("href") === location.pathname) {
		navLinks[i].classList.add("active");
	}
}

try {
	// @ts-ignore window.keypress is defined in `../components/Keypress/`
	const listener = new window.keypress.Listener();
	listener.sequence_combo("d r e a m space b a d", preferesNether, true);
	listener.sequence_combo("j i n g l e space b e l l s", preferesChristmas, true);
} catch (TypeError) {
	console.log("Javascript component blocked by the client. Continuing execution.");
}

window.onscroll = _ => {
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
