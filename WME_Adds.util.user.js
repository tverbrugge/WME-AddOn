
////  UTIL FUNCTIONS
function extend(target, source) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for (var propName in source) {
        // Invoke hasOwnProperty() with this = source
        if (hasOwnProperty.call(source, propName)) {
            target[propName] = source[propName];
        }
    }
    return target;
}

function getScaledHex(index, maximum, startColor, endColor) {
    if (index >= maximum) {
        index = maximum - 1;
    }
    var colorVal = startColor + ((endColor - startColor) * (index / (maximum - 1)));

    colorVal = Math.round(colorVal);

    // convert from decimal to hexadecimal
    var colorHex = colorVal.toString(16);

    // pad the hexadecimal number if required
    if (colorHex.length < 2) {
        colorHex = "0" + colorHex;
    }
    return colorHex;
}

function getScaledColour(index, maximum) {
    var blueHex = "00";

    var startGreen = 0;
    var endGreen = 255;

    var startRed = 255;
    var endRed = 0;

    return "#" + getScaledHex(index, maximum, startRed, endRed) + getScaledHex(index, maximum, startGreen, endGreen) + blueHex;
}

function generateTopDownGradient(top, bottom) {
    var stylizer = "background-color: " + top + ";"
    stylizer += "background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%," + top + "), color-stop(100%, " + bottom + "));";
    stylizer += "background-image: -webkit-linear-gradient(top, " + top + ", " + bottom + ");";
    stylizer += "background-image: -moz-linear-gradient(top, " + top + ", "  + bottom + ");";
    stylizer += "background-image: -ms-linear-gradient(top, " + top + ", " + bottom + ");";
    stylizer += "background-image: -o-linear-gradient(top, " + top + ", " + bottom + ");";
    stylizer += "background-image: linear-gradient(top, " + top + ", " + bottom + ");";
    return stylizer;
}


function calcTan(dLon, dLat) {
 return (Math.atan(dLon/dLat) / (2 * Math.PI)) * 360;
}
