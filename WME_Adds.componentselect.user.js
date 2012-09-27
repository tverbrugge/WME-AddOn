
/** GEOMETRY **/


function getBearingDiff(bearing1, bearing2) {
    // normalize the first angle to 0, and subtract the same from the second;
    var normalizeAngle = bearing1;
    bearing1 -= normalizeAngle;
    var diffAngle = bearing2 - normalizeAngle;
    
    
    if(diffAngle < -180) {
        diffAngle += 360;
    } 
    else if (diffAngle > 180) {
        diffAngle -= 360;
    }
    return diffAngle;
}

function rightTurn(bearing1, bearing2) {
    return getBearingDiff(bearing1, bearing2) > 0;
}

var MIN_DISTANCE_BETWEEN_COMPONENTS=5;
var MIN_LENGTH_DIFF=0.05;


function subtleZigZags(segmentProperties) {
    // detect zig zagging... 
    var segmentChain = [];
    for(var i = 0; i < segmentProperties.length; i++) {
        var currentSegment = segmentProperties[i];
        segmentChain.push(currentSegment);
        if(segmentChain.length < 3) {
            continue;
        }
        if(currentSegment.distance > 10) {
            segmentChain = [];
            continue;
        }
        var origSegment = segmentChain[segmentChain.length - 3];
        var pastSegment = segmentChain[segmentChain.length - 2];
        var bearing1 = origSegment.bearing;
        var bearing2 = pastSegment.bearing;
        var bearing3 = currentSegment.bearing;
        var isRightTurn1 = rightTurn(bearing1, bearing2);
        var isRightTurn2 = rightTurn(bearing2, bearing3);
        
        var bearDiff1 = getBearingDiff(bearing1, bearing2);
        var bearDiff2 = getBearingDiff(bearing2, bearing3);
        
        if((bearDiff1 < 0 && bearDiff2 > 0) || (bearDiff1 > 0 && bearDiff2 < 0)) {
            return true;
        }
    }
    return false;
}

// Check for subtle zig-zags on longer components where the end result of the zig-zag is almost nothing

// Check for sharp zig-zags on very short components where the end result of the zig-zag is almost nothing

// OR

// Check for issues when (angle / length) reaches a threshold.  So sharp angles reach the threshold with small lengths;

//

// // // 

// On major streets, checks to see that there aren't places where the street can't continue due to turn restrictions.

var highlightWeirdComponents = new WMEFunction("_cbHighlightExcessComponents", "Unusual Geometry");
highlightWeirdComponents.getModifiedAttrs = function(wazeLineSegment) {
    var components = wazeLineSegment.geometry.components;
    var foundIssue = false;
    var lengthSum = 0;
    var segmentProperties = getComponentsProperties(wazeLineSegment.geometry.components);
    var issueColor = "#BE0";
    
    // If the space between components is really small, we note that as an issue
    for(var i = 0; i < segmentProperties.length; i++) {
        var componentLength = segmentProperties[i].distance;
        if(componentLength < MIN_DISTANCE_BETWEEN_COMPONENTS) {
            foundIssue = true;
        }
        lengthSum += componentLength;
    }
    
    if(subtleZigZags(segmentProperties)) {
        issueColor = "#a00";
        foundIssue = true;
    }
    
    // if there is more than just a beginning and end component, and the difference from the total length is really small, this fits this category.
    var pStart = compToPoint(components[0]);
    var pEnd = compToPoint(components[components.length - 1]);
    var totalDist = getDistance(pStart, pEnd).distance;
    var lengthDiff = lengthSum - totalDist;
    if(components.length > 2 && lengthDiff < MIN_LENGTH_DIFF) {
        foundIssue = true;
    }
    
    var modifications = new Object();
    if(foundIssue) {
        modifications.color = issueColor;
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightWeirdComponents.getBackground = function() {
  return 'rgba(187,238,0,0.5)';
};
