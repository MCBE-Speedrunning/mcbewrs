/*
 * Convert seconds to human readable time
 */
function timeFormat(time) {
	const hours = ~~(time / 3600);
	const minutes = ~~((time % 3600) / 60);
	const seconds = ~~time % 60;
	let output = "";

	if (hours > 0) output += hours + ":" + (minutes < 10 ? "0" : "");

	output += minutes + ":" + (seconds < 10 ? "0" : "");
	output += seconds;

	// Check if the time has milliseconds, and remove the trailing .0001
	if (!isNaN(time) && time.toString().indexOf(".") != -1)
		output += "." + time.toString().split(".")[1].slice(0, -1);

	return output;
}

/*
 * Covert duration from unix timestamp
 * to days
 */
function durationFormat(duration) {
	const output = Math.trunc(duration / 86400);

	if (output === 0) return "<1";
	return output;
}

/*
 * Thank you vim!
 */
function getFlag(code) {
	switch (code) {
		case "AD":
			return "🇦🇩";

		case "AE":
			return "🇦🇪";

		case "AF":
			return "🇦🇫";

		case "AG":
			return "🇦🇬";

		case "AI":
			return "🇦🇮";

		case "AL":
			return "🇦🇱";

		case "AM":
			return "🇦🇲";

		case "AO":
			return "🇦🇴";

		case "AQ":
			return "🇦🇶";

		case "AR":
			return "🇦🇷";

		case "AS":
			return "🇦🇸";

		case "AT":
			return "🇦🇹";

		case "AU":
			return "🇦🇺";

		case "AW":
			return "🇦🇼";

		case "AX":
			return "🇦🇽";

		case "AZ":
			return "🇦🇿";

		case "BA":
			return "🇧🇦";

		case "BB":
			return "🇧🇧";

		case "BD":
			return "🇧🇩";

		case "BE":
			return "🇧🇪";

		case "BF":
			return "🇧🇫";

		case "BG":
			return "🇧🇬";

		case "BH":
			return "🇧🇭";

		case "BI":
			return "🇧🇮";

		case "BJ":
			return "🇧🇯";

		case "BL":
			return "🇧🇱";

		case "BM":
			return "🇧🇲";

		case "BN":
			return "🇧🇳";

		case "BO":
			return "🇧🇴";

		case "BQ":
			return "🇧🇶";

		case "BR":
			return "🇧🇷";

		case "BS":
			return "🇧🇸";

		case "BT":
			return "🇧🇹";

		case "BV":
			return "🇧🇻";

		case "BW":
			return "🇧🇼";

		case "BY":
			return "🇧🇾";

		case "BZ":
			return "🇧🇿";

		case "CA":
			return "🇨🇦";

		case "CC":
			return "🇨🇨";

		case "CD":
			return "🇨🇩";

		case "CF":
			return "🇨🇫";

		case "CG":
			return "🇨🇬";

		case "CH":
			return "🇨🇭";

		case "CI":
			return "🇨🇮";

		case "CK":
			return "🇨🇰";

		case "CL":
			return "🇨🇱";

		case "CM":
			return "🇨🇲";

		case "CN":
			return "🇨🇳";

		case "CO":
			return "🇨🇴";

		case "CR":
			return "🇨🇷";

		case "CU":
			return "🇨🇺";

		case "CV":
			return "🇨🇻";

		case "CW":
			return "🇨🇼";

		case "CX":
			return "🇨🇽";

		case "CY":
			return "🇨🇾";

		case "CZ":
			return "🇨🇿";

		case "DE":
			return "🇩🇪";

		case "DJ":
			return "🇩🇯";

		case "DK":
			return "🇩🇰";

		case "DM":
			return "🇩🇲";

		case "DO":
			return "🇩🇴";

		case "DZ":
			return "🇩🇿";

		case "EC":
			return "🇪🇨";

		case "EE":
			return "🇪🇪";

		case "EG":
			return "🇪🇬";

		case "EH":
			return "🇪🇭";

		case "ER":
			return "🇪🇷";

		case "ES":
			return "🇪🇸";

		case "ET":
			return "🇪🇹";

		case "FI":
			return "🇫🇮";

		case "FJ":
			return "🇫🇯";

		case "FK":
			return "🇫🇰";

		case "FM":
			return "🇫🇲";

		case "FO":
			return "🇫🇴";

		case "FR":
			return "🇫🇷";

		case "GA":
			return "🇬🇦";

		case "GB":
			return "🇬🇧";

		case "GD":
			return "🇬🇩";

		case "GE":
			return "🇬🇪";

		case "GF":
			return "🇬🇫";

		case "GG":
			return "🇬🇬";

		case "GH":
			return "🇬🇭";

		case "GI":
			return "🇬🇮";

		case "GL":
			return "🇬🇱";

		case "GM":
			return "🇬🇲";

		case "GN":
			return "🇬🇳";

		case "GP":
			return "🇬🇵";

		case "GQ":
			return "🇬🇶";

		case "GR":
			return "🇬🇷";

		case "GS":
			return "🇬🇸";

		case "GT":
			return "🇬🇹";

		case "GU":
			return "🇬🇺";

		case "GW":
			return "🇬🇼";

		case "GY":
			return "🇬🇾";

		case "HK":
			return "🇭🇰";

		case "HM":
			return "🇭🇲";

		case "HN":
			return "🇭🇳";

		case "HR":
			return "🇭🇷";

		case "HT":
			return "🇭🇹";

		case "HU":
			return "🇭🇺";

		case "ID":
			return "🇮🇩";

		case "IE":
			return "🇮🇪";

		case "IL":
			return "🇮🇱";

		case "IM":
			return "🇮🇲";

		case "IN":
			return "🇮🇳";

		case "IO":
			return "🇮🇴";

		case "IQ":
			return "🇮🇶";

		case "IR":
			return "🇮🇷";

		case "IS":
			return "🇮🇸";

		case "IT":
			return "🇮🇹";

		case "JE":
			return "🇯🇪";

		case "JM":
			return "🇯🇲";

		case "JO":
			return "🇯🇴";

		case "JP":
			return "🇯🇵";

		case "KE":
			return "🇰🇪";

		case "KG":
			return "🇰🇬";

		case "KH":
			return "🇰🇭";

		case "KI":
			return "🇰🇮";

		case "KM":
			return "🇰🇲";

		case "KN":
			return "🇰🇳";

		case "KP":
			return "🇰🇵";

		case "KR":
			return "🇰🇷";

		case "KW":
			return "🇰🇼";

		case "KY":
			return "🇰🇾";

		case "KZ":
			return "🇰🇿";

		case "LA":
			return "🇱🇦";

		case "LB":
			return "🇱🇧";

		case "LC":
			return "🇱🇨";

		case "LI":
			return "🇱🇮";

		case "LK":
			return "🇱🇰";

		case "LR":
			return "🇱🇷";

		case "LS":
			return "🇱🇸";

		case "LT":
			return "🇱🇹";

		case "LU":
			return "🇱🇺";

		case "LV":
			return "🇱🇻";

		case "LY":
			return "🇱🇾";

		case "MA":
			return "🇲🇦";

		case "MC":
			return "🇲🇨";

		case "MD":
			return "🇲🇩";

		case "ME":
			return "🇲🇪";

		case "MF":
			return "🇲🇫";

		case "MG":
			return "🇲🇬";

		case "MH":
			return "🇲🇭";

		case "MK":
			return "🇲🇰";

		case "ML":
			return "🇲🇱";

		case "MM":
			return "🇲🇲";

		case "MN":
			return "🇲🇳";

		case "MO":
			return "🇲🇴";

		case "MP":
			return "🇲🇵";

		case "MQ":
			return "🇲🇶";

		case "MR":
			return "🇲🇷";

		case "MS":
			return "🇲🇸";

		case "MT":
			return "🇲🇹";

		case "MU":
			return "🇲🇺";

		case "MV":
			return "🇲🇻";

		case "MW":
			return "🇲🇼";

		case "MX":
			return "🇲🇽";

		case "MY":
			return "🇲🇾";

		case "MZ":
			return "🇲🇿";

		case "NA":
			return "🇳🇦";

		case "NC":
			return "🇳🇨";

		case "NE":
			return "🇳🇪";

		case "NF":
			return "🇳🇫";

		case "NG":
			return "🇳🇬";

		case "NI":
			return "🇳🇮";

		case "NL":
			return "🇳🇱";

		case "NO":
			return "🇳🇴";

		case "NP":
			return "🇳🇵";

		case "NR":
			return "🇳🇷";

		case "NU":
			return "🇳🇺";

		case "NZ":
			return "🇳🇿";

		case "OM":
			return "🇴🇲";

		case "PA":
			return "🇵🇦";

		case "PE":
			return "🇵🇪";

		case "PF":
			return "🇵🇫";

		case "PG":
			return "🇵🇬";

		case "PH":
			return "🇵🇭";

		case "PK":
			return "🇵🇰";

		case "PL":
			return "🇵🇱";

		case "PM":
			return "🇵🇲";

		case "PN":
			return "🇵🇳";

		case "PR":
			return "🇵🇷";

		case "PS":
			return "🇵🇸";

		case "PT":
			return "🇵🇹";

		case "PW":
			return "🇵🇼";

		case "PY":
			return "🇵🇾";

		case "QA":
			return "🇶🇦";

		case "RE":
			return "🇷🇪";

		case "RO":
			return "🇷🇴";

		case "RS":
			return "🇷🇸";

		case "RU":
			return "🇷🇺";

		case "RW":
			return "🇷🇼";

		case "SA":
			return "🇸🇦";

		case "SB":
			return "🇸🇧";

		case "SC":
			return "🇸🇨";

		case "SD":
			return "🇸🇩";

		case "SE":
			return "🇸🇪";

		case "SG":
			return "🇸🇬";

		case "SH":
			return "🇸🇭";

		case "SI":
			return "🇸🇮";

		case "SJ":
			return "🇸🇯";

		case "SK":
			return "🇸🇰";

		case "SL":
			return "🇸🇱";

		case "SM":
			return "🇸🇲";

		case "SN":
			return "🇸🇳";

		case "SO":
			return "🇸🇴";

		case "SR":
			return "🇸🇷";

		case "SS":
			return "🇸🇸";

		case "ST":
			return "🇸🇹";

		case "SV":
			return "🇸🇻";

		case "SX":
			return "🇸🇽";

		case "SY":
			return "🇸🇾";

		case "SZ":
			return "🇸🇿";

		case "TC":
			return "🇹🇨";

		case "TD":
			return "🇹🇩";

		case "TF":
			return "🇹🇫";

		case "TG":
			return "🇹🇬";

		case "TH":
			return "🇹🇭";

		case "TJ":
			return "🇹🇯";

		case "TK":
			return "🇹🇰";

		case "TL":
			return "🇹🇱";

		case "TM":
			return "🇹🇲";

		case "TN":
			return "🇹🇳";

		case "TO":
			return "🇹🇴";

		case "TR":
			return "🇹🇷";

		case "TT":
			return "🇹🇹";

		case "TV":
			return "🇹🇻";

		case "TW":
			return "🇹🇼";

		case "TZ":
			return "🇹🇿";

		case "UA":
			return "🇺🇦";

		case "UG":
			return "🇺🇬";

		case "UM":
			return "🇺🇲";

		case "US":
			return "🇺🇸";

		case "UY":
			return "🇺🇾";

		case "UZ":
			return "🇺🇿";

		case "VA":
			return "🇻🇦";

		case "VC":
			return "🇻🇨";

		case "VE":
			return "🇻🇪";

		case "VG":
			return "🇻🇬";

		case "VI":
			return "🇻🇮";

		case "VN":
			return "🇻🇳";

		case "VU":
			return "🇻🇺";

		case "WF":
			return "🇼🇫";

		case "WS":
			return "🇼🇸";

		case "XK":
			return "🇽🇰";

		case "YE":
			return "🇾🇪";

		case "YT":
			return "🇾🇹";

		case "ZA":
			return "🇿🇦";

		case "ZM":
			return "🇿🇲";

		default:
			return "❓";
	}
}

module.exports = { getFlag, timeFormat, durationFormat };
