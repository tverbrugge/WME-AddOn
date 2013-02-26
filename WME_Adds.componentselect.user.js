/** GEOMETRY **/

function getBearingDiff(bearing1, bearing2) {
    // normalize the first angle to 0, and subtract the same from the second;
    var normalizeAngle = bearing1;
    bearing1 -= normalizeAngle;
    var diffAngle = bearing2 - normalizeAngle;

    if (diffAngle < -180) {
        diffAngle += 360;
    } else if (diffAngle > 180) {
        diffAngle -= 360;
    }
    return diffAngle;
}

function rightTurn(bearing1, bearing2) {
    return getBearingDiff(bearing1, bearing2) > 0;
}

var MIN_DISTANCE_BETWEEN_COMPONENTS = 1.5;
var MIN_LENGTH_DIFF = 0.005;

function between(value, min, max) {
    if (max < min) {
        var temp = min;
        min = max;
        max = temp
    }
    var between = value > min && value < max;
    //    console.log("between? " + min + " " + value + " " + max + " = " + between);
    return between;
}

var ZIG_ZAG_MAX_DIST = 30;
var ZIG_ZAG_MAX_ANGLE = 3;
var negate_ZIG_ZAG_MAX_ANGLE = -1 * ZIG_ZAG_MAX_ANGLE;
var MIN_ANGLE_DIFF = 0.7;

function subtleZigZags(segmentProperties) {
    // detect zig zagging...
    var segmentChain = [];
    for (var i = 0; i < segmentProperties.length; i++) {
        var currentSegment = segmentProperties[i];
        segmentChain.push(currentSegment);
        if (segmentChain.length < 3) {
            continue;
        }
        if (currentSegment.distance > ZIG_ZAG_MAX_DIST) {
            segmentChain = [];
            continue;
        }
        var origSegment = segmentChain[segmentChain.length - 3];
        var pastSegment = segmentChain[segmentChain.length - 2];
        var bearing1 = origSegment.bearing;
        var bearing2 = pastSegment.bearing;
        var bearing3 = currentSegment.bearing;

        var bearDiff1 = getBearingDiff(bearing1, bearing2);
        var bearDiff2 = getBearingDiff(bearing2, bearing3);

        if ((between(bearDiff1, 0, ZIG_ZAG_MAX_ANGLE) && between(bearDiff2, 0, negate_ZIG_ZAG_MAX_ANGLE)) || (between(bearDiff1, 0, negate_ZIG_ZAG_MAX_ANGLE) && between(bearDiff2, 0, ZIG_ZAG_MAX_ANGLE))) {
            return true;
        }
    }
    return false;
}

function checkForLowAngles(segmentProperties) {
    if (segmentProperties.length < 2) {
        return;
    }
    for (var i = 0; i < segmentProperties.length - 1; i++) {
        var currentSegment = segmentProperties[i];
        var nextSegment = segmentProperties[i + 1];
        var bearing1 = currentSegment.bearing;
        var bearing2 = nextSegment.bearing;
        var bearDiff1 = getBearingDiff(bearing1, bearing2);
        if (Math.abs(bearDiff1) < MIN_ANGLE_DIFF) {
            return true;
        }
    }
    return false;
}

// Check for subtle zig-zags on longer components where the end result of the zig-zag is almost nothing

// Check for sharp zig-zags on very short components where the end result of the zig-zag is almost nothing

// OR

// Check for issues when (angle / length) reaches a threshold.  So sharp angles reach the threshold with small lengths;

// --

// Take the difference between the total sum and the sum of the components.  Take the the differene to create an average distance per component. If that average exceeds a trheshoold...

// // //

// On major streets, checks to see that there aren't places where the street can't continue due to turn restrictions.

var highlightLowAngles = new WMEFunction("_cbHighlightLowAngles", "Low Angles");
highlightLowAngles.getModifiedAttrs = function(wazeLineSegment) {
	var components = wazeLineSegment.geometry.components;
	if (components.length <= 2) {
		return new Object();
	}
	var foundIssue = false;
	var segmentProperties = getComponentsProperties(wazeLineSegment.geometry.components);

	if (checkForLowAngles(segmentProperties)) {
		foundIssue = true;
	}

	var modifications = new Object();
	if (foundIssue) {
		modifications.color = "#BE0";
		modifications.opacity = 0.5;
	}
	return modifications;
};
highlightLowAngles.getBackground = function() {
    return 'rgba(187,238,0,0.5)';
};

/*
 *
 */
var highlightExcessComponents = new WMEFunction("_cbHighlightHighExcessComponents", "Excess Components");
highlightExcessComponents.getModifiedAttrs = function(wazeLineSegment) {
	var components = wazeLineSegment.geometry.components;
	if (components.length <= 2) {
		return new Object();
	}
	var foundIssue = false;
	var segmentProperties = getComponentsProperties(wazeLineSegment.geometry.components);

	// If the space between components is really small, we note that as an issue
	var lengthSum = 0;
	for (var i = 0; i < segmentProperties.length; i++) {
		var componentLength = segmentProperties[i].distance;
		lengthSum += componentLength;
	}
	// if there is more than just a beginning and end component, and the difference from the total length is really small, this fits this category.
	var pStart = compToPoint(components[0]);
	var pEnd = compToPoint(components[components.length - 1]);
	var totalDist = getDistance(pStart, pEnd).distance;
	var lengthDiff = lengthSum - totalDist;

	var numXtraComps = components.length - 2;
	// NEW
	var avgDiffPerSeg = lengthDiff / numXtraComps;
	var avgLengthPerSeg = lengthSum / numXtraComps;
	if (avgDiffPerSeg < 0.03) {
		foundIssue = true;
	} else if (avgLengthPerSeg < 3) {
		foundIssue = true;
	} 
	var modifications = new Object();
	if (foundIssue) {
		modifications.color = "#FFD105";
		modifications.opacity = 0.5;
	}
	return modifications;
};
highlightExcessComponents.getBackground = function() {
    return 'rgba(255,209,5,0.5)';
}; 

var highlightCloseComponents = new WMEFunction("_cbHighlightCloseComponents", "Close Components");
highlightCloseComponents.getModifiedAttrs = function(wazeLineSegment) {
    var components = wazeLineSegment.geometry.components;
    if (components.length <= 2) {
        return new Object();
    }
    var foundIssue = false;
    var segmentProperties = getComponentsProperties(wazeLineSegment.geometry.components);
    var issueColor = "#B00";

    // If the space between components is really small, we note that as an issue
    for (var i = 0; i < segmentProperties.length; i++) {
        var componentLength = segmentProperties[i].distance;
        if (componentLength < MIN_DISTANCE_BETWEEN_COMPONENTS) {
            foundIssue = true;
        }
    }
    var modifications = new Object();
    if (foundIssue) {
        modifications.color = issueColor;
        modifications.opacity = 0.7;
    }
    return modifications;
};
highlightCloseComponents.getBackground = function() {
    return 'rgba(187,0,0,0.7)';
};

var highlightZigZagsComponents = new WMEFunction("_cbHighlightZigZagsComponents", "Subtle Zig-Zags");
highlightZigZagsComponents.getModifiedAttrs = function(wazeLineSegment) {
    var components = wazeLineSegment.geometry.components;
    if (components.length <= 2) {
        return new Object();
    }
    var foundIssue = false;
    var segmentProperties = getComponentsProperties(wazeLineSegment.geometry.components);
    var issueColor = "#E10";

    if (subtleZigZags(segmentProperties)) {
        foundIssue = true;
    }
    var modifications = new Object();
    if (foundIssue) {
        modifications.color = issueColor;
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightZigZagsComponents.getBackground = function() {
    return 'rgba(238,16,0,0.5)';
};

