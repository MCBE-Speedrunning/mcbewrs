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

/*
// Dropdown
const dropdown_menu = document.getElementById("dropdown_menu");
document.getElementById("dropdown").addEventListener("click", () => {
	if (dropdown_menu.style.display == "block") {
		dropdown_menu.style.display = "none";
	} else if (dropdown_menu.style.display == "none") {
		dropdown_menu.style.display = "block";
	}
});
*/

// Use twemoji's
window.addEventListener("load", () => {
	twemoji.parse(document.body);
});
