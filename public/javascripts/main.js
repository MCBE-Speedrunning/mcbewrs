// Color changing
function colorChange() {
	//Find the button which will be checked if it's checked or not
	const colorPreferance = document.getElementById("colorPreferance");
	if (colorPreferance.checked == true) {
		preferesDark();
	} else {
		preferesLight();
	}
}

//Fancy transition between dark mode and light mode
const trans = () => {
	//Add class
	document.documentElement.classList.add("transition");
	//Wait for the animation to finish then remove the class
	window.setTimeout(() => {
		document.documentElement.classList.remove("transition");
	}, 1000);
};

// This function is used whenever dark preferance is used
function preferesDark() {
	//Start the transition
	trans();
	//Save the preferance
	localStorage.setItem("colorMode", "Dark");
	//Check the box to make it look like dark mode is enabled
	document.getElementById("colorPreferance").checked = true;
	//Add the dark mode css
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/stylesheets/dark.css">';
	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-light");
		el.classList.add("table-dark");
	});
	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-light");
		el.classList.add("navbar-dark");
	});
}

// This function is used whenever light preferance is used
function preferesLight() {
	//Start the transition
	trans();
	//Save the preferance
	localStorage.setItem("colorMode", "Light");
	document.getElementById("colorPreferance").checked = false;
	document.getElementById("colorScheme").innerHTML =
		'<link rel="stylesheet" type="text/css" href="/stylesheets/light.css">';
	document.querySelectorAll(".table").forEach((el) => {
		el.classList.remove("table-dark");
		el.classList.add("table-light");
	});
	document.querySelectorAll("nav").forEach((el) => {
		el.classList.remove("navbar-dark");
		el.classList.add("navbar-light");
	});
}

//When the user changes their native color scheme make sure to change too
function handleColorChange(event) {
	if (event.matches) {
		// Dark mode
		preferesDark();
	} else {
		//There are only 2 options possible, so it should be fine
		preferesLight();
	}
}

const mql = matchMedia("(prefers-color-scheme: dark)");
mql.onchange = handleColorChange;

const preferedColorScheme = localStorage.getItem("colorMode");
//If the user already has a preferance respect it
if (preferedColorScheme == "Dark") {
	preferesDark();
} else if (preferedColorScheme == "Light") {
	preferesLight();
} else {
	//If they don't then make them use dark mode like a normal person
	preferesDark();
}
document
	.getElementById("colorPreferance")
	.addEventListener("click", colorChange, true);

// Use twemoji's
window.addEventListener("load", () => {
	if (screen.height >= 720) {
		twemoji.parse(document.body, { ext: ".svg", folder: "svg" });
	} else {
		twemoji.parse(document.body);
	}
});
