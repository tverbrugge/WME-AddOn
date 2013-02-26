var RoadTypeString = {
    1 : "Streets",
    2 : "Primary Street",
    3 : "Freeways",
    4 : "Ramps",
    5 : "Walking Trails",
    6 : "Major Highway",
    7 : "Minor Highway",
    8 : "Dirt roads",
    10 : "Pedestrian Bw",
    16 : "Stairway",
    17 : "Private Road",
    18 : "Railroad",
    19 : "Runway/Taxiway",
    20 : "Parking Lot Road",
    21 : "Service Road"
};

var speedColor = new WMEFunction("_cbHighlightSpeed", "Speed");
var MAX_THRESHOLD_SPEED = 100;
var MIN_WIDTH_SPEED = 4;
var MAX_WIDTH_SPEED = 10;
var MIN_OPACITY_SPEED = 0.4;
var MAX_OPACITY_SPEED = 0.99;

speedColor.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    var speedToUse = getSegmentSpeed(wazeLineSegment.segment);
    if (isNaN(speedToUse)) {
        speedToUse = 0;
    }
    var percentageWidth = Math.min(speedToUse, MAX_THRESHOLD_SPEED - 1) / MAX_THRESHOLD_SPEED;
    modifications.opacity = ((MAX_OPACITY_SPEED - MIN_OPACITY_SPEED) * percentageWidth) + MIN_OPACITY_SPEED;
    modifications.width = ((MAX_WIDTH_SPEED - MIN_WIDTH_SPEED) * percentageWidth) + MIN_WIDTH_SPEED;
    if (speedToUse < 1) {
        modifications.color = "#000";
        modifications.opacity = 0.2;
    } else {
        modifications.color = getScaledColour(speedToUse, 100);
    }
    return modifications;
};

/*
 * HIGHLIGHT NO CITY
 */
var highlightNoCity = new WMEFunction("_cbHighlightNoCity", "No City");
highlightNoCity.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.noCity) {
        modifications.color = "#ff0";
        modifications.opacity = 0.3;
    }
    return modifications;
};
highlightNoCity.getBackground = function() {
    return 'rgba(255,255,0,0.3)';
};

/*
 * highlight UNNAMED
 */
var highlightNoName = new WMEFunction("_cbHighlightUnnamed", "Unnamed Street");
highlightNoName.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.noName) {
        if (isTrafficRelevant(wazeLineSegment.attributes.roadType)) {
            modifications.color = "#424";
            modifications.opacity = 0.7;
        }
    }
    return modifications;
};
highlightNoName.getBackground = function() {
    return 'rgba(64,32,64,0.7)';
};

/*
 * highlight CONST ZN
 */
var highlightConstZn = new WMEFunction("_cbHighlightConstZn", "CONST ZN Street");
highlightConstZn.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();

    if (!wazeLineSegment.noName && wazeLineSegment.getStreetName().indexOf('CONST ZN') != -1) {
        modifications.color = "#FFBB00";
        modifications.opacity = 0.7;
    }
    return modifications;
};
highlightConstZn.getBackground = function() {
    return 'rgba(255,187,0,0.7)';
};

/*
 * highlight SAME NAME
 */
var highlightSameName = new WMEFunction("_cbHighlightSameName", "Same Street Name");
highlightSameName.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (selectionManager.modifyControl.featureHover.feature && selectionManager.modifyControl.featureHover.feature.CLASS_NAME == 'Waze.Feature.Vector.Segment') {
        var segment = selectionManager.modifyControl.featureHover.feature;
        var highlightedStreetID = segment.attributes.primaryStreetID;
        if (wazeLineSegment.attributes.primaryStreetID === highlightedStreetID) {
            modifications.color = "#0ad";
            modifications.opacity = 0.3;
        }
    }
    return modifications;
};
highlightSameName.getBackground = function() {
    return 'rgba(0,160,208,0.5)';
};

/*
 * highlight TOLL
 */
var highlightToll = new WMEFunction("_cbHighlightToll", "Toll");
highlightToll.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.attributes.fwdToll) {
        modifications.color = wazeLineSegment.attributes.locked ? "#ff0000" : "#00f";
        modifications.opacity = 0.5;
        modifications.dasharray = "5 15";
    }
    return modifications;
};
highlightToll.getBackground = function() {
    return 'rgba(0,0,255,0.5)';
};

/*
 * highlight NO DIRECTION
 */
var highlightNoDirection = new WMEFunction("_cbHighlightNoDirection", "Unknown Direction");
highlightNoDirection.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.noDirection) {
        modifications.color = "#00f";
        modifications.opacity = 0.3;
    }
    return modifications;
};
highlightNoDirection.getBackground = function() {
    return 'rgba(0,0,255,0.3)';
};

/*
 * highlight ONE WAY
 */
var highlightOneWay = new WMEFunction("_cbHighlightOneWay", "One Way");
highlightOneWay.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.oneWay) {
        modifications.color = "#00f";
        modifications.opacity = 0.2;
    }
    return modifications;
};
highlightOneWay.getBackground = function() {
    return 'rgba(0,0,255,0.2)';
};
var highlightNoTerm = new WMEFunction("_cbHighlightNoTerm", "Unterminated");
highlightNoTerm.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.attributes.toNodeID == null || wazeLineSegment.attributes.fromNodeID == null) {
        modifications.color = "#FC0";
        modifications.opacity = 0.7;
    }
    return modifications;
};
highlightNoTerm.getBackground = function() {
    return 'rgba(255,208,0,0.7)';
};

var highlightEditor = new WMEFunctionExtended("_cbHighlightEditor", "Specific Editor");
highlightEditor.getModifiedAttrs = function(wazeLineSegment) {
    var selectUser = getId(highlightEditor.getSelectId());
    var selectedUserId = selectUser.options[selectUser.selectedIndex].value;
    var updatedBy = wazeLineSegment.attributes.updatedBy;

    var modifications = new Object();
    if (updatedBy == selectedUserId) {
        modifications.color = "#00ff00";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightEditor.buildExtended = function() {
    return '<select id="' + this.getSelectId() + '" name="' + this.getSelectId() + '"><br />';
}
highlightEditor.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onchange = this.getSelectFieldChangeFunction();
}
highlightEditor.getBackground = function() {
    return 'rgba(0,255,0,0.5)';
};
var highlightRecent = new WMEFunctionExtended("_cbHighlightRecent", "Recently Edited");
highlightRecent.getModifiedAttrs = function(wazeLineSegment) {
    var numDays = getId(this.getSelectId()).value;
    if (numDays == undefined) {
        numDays = 0;
    }
    var tNow = new Date();
    var tDif = (tNow.getTime() - wazeLineSegment.updatedOn.getTime()) / 86400000;
    var modifications = new Object();

    if (numDays >= 0 && tDif <= numDays) {
        var heatScale = 0.75 / numDays;
        modifications.color = "#0f0";
        modifications.opacity = Math.min(0.999999, 1 - (tDif * heatScale));
    }
    return modifications;
};
highlightRecent.buildExtended = function() {
    return '<input type="number" min="0" max="365" size="3" value="7" id="' + this.getSelectId() + '" /> days';
}
highlightRecent.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onfocus = populateUserList;
    getId(this.getSelectId()).onchange = highlightSegments;
};
highlightRecent.getBackground = function() {
    return 'rgba(0,255,0,0.7)';
};

/*
 * LOCKED segments
 */
var highlightLocked = new WMEFunctionExtended("_cbHighlightLocked", "Locked");
highlightLocked.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.attributes.locked) {
        modifications.color = "#B00";
        modifications.opacity = 0.8;
    }
    return modifications;
};
highlightLocked.getBackground = function() {
    return 'rgba(176,0,0,0.8)';
};

var highlightRoadType = new WMEFunctionExtended("_cbHighlightRoadType", "Road Type");
highlightRoadType.roadTypeStrings = RoadTypeString;
highlightRoadType.getModifiedAttrs = function(wazeLineSegment) {

    var currentRoadTypeElement = getId(this.getSelectId());
    var currentRoadType = currentRoadTypeElement.options[currentRoadTypeElement.selectedIndex].value;
    if (currentRoadType == undefined) {
        currentRoadType = 0;
    }

    var modifications = new Object();
    if (currentRoadType == wazeLineSegment.attributes.roadType) {
        modifications.color = "#0f0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightRoadType.buildExtended = function() {
    return '<select id="' + this.getSelectId() + '" name="' + this.getSelectId() + '">';
}
highlightRoadType.init = function() {
    populateOption(this.getSelectId(), this.roadTypeStrings);
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onchange = this.getSelectFieldChangeFunction();
};
highlightRoadType.getBackground = function() {
    return 'rgba(0,255,0,0.5)';
};

var highlightCity = new WMEFunctionExtended("_cbHighlightCity", "City");
highlightCity.getModifiedAttrs = function(wazeLineSegment) {

    var currentCityElement = getId(this.getSelectId());
    var currentCity = currentCityElement.options[currentCityElement.selectedIndex].value;
    if (currentCity == undefined) {
        currentCity = 0;
    }

    var modifications = new Object();
    if (currentCity == wazeLineSegment.cityID) {
        modifications.color = "#0f0";
        modifications.opacity = 0.5;
    } else if (currentCity == WME_ADD_UNKNOWN && wazeLineSegment.noCity) {
        modifications.color = "#0f0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightCity.buildExtended = function() {
    return '<select id="' + this.getSelectId() + '" name="' + this.getSelectId() + '">';
}
highlightCity.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onchange = this.getSelectFieldChangeFunction();
};
highlightCity.getBackground = function() {
    return 'rgba(0,255,0,0.5)';
};

var highlightStreet = new WMEFunctionExtended("_cbHighlightStreet", "Street");
highlightStreet.getModifiedAttrs = function(wazeLineSegment) {

    var currentCityElement = getId(this.getSelectId());
    var currentCity = currentCityElement.options[currentCityElement.selectedIndex].value;
    if (currentCity == undefined) {
        currentCity = 0;
    }

    var modifications = new Object();
    if (currentCity == wazeLineSegment.cityID) {
        modifications.color = "#0f0";
        modifications.opacity = 0.5;
    } else if (currentCity == WME_ADD_UNKNOWN && wazeLineSegment.noCity) {
        modifications.color = "#0f0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightStreet.buildExtended = function() {
    return '<select id="' + this.getSelectId() + '" name="' + this.getSelectId() + '">';
}
highlightStreet.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onchange = this.getSelectFieldChangeFunction();
};
highlightStreet.getBackground = function() {
    return 'rgba(0,255,0,0.5)';
};

var highlightShortSegments = new WMEFunctionExtended("_cbHighlightShortSegments", "Short");
highlightShortSegments.getModifiedAttrs = function(wazeLineSegment) {
    var length = getId(this.getSelectId()).value;
    if (length == undefined) {
        length = 0;
    }

    var modifications = new Object();
    if (wazeLineSegment.attributes.length < length) {
        modifications.color = "#f33";
        modifications.opacity = 0.8;
        modifications.width = 15;
    }
    return modifications;
};
highlightShortSegments.buildExtended = function() {
    return '<input type="number" min="0" max="100" value="5" size="3" id="' + this.getSelectId() + '" /> meters';
}
highlightShortSegments.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onchange = highlightSegments;
    getId(this.getSelectId()).onchange = highlightSegments;
};
highlightShortSegments.getBackground = function() {
    return 'rgba(255,51,51,0.8)';
};
var highlightNull = new WMEFunction("_cbHighlightNull", "NULL");
highlightNull.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    modifications.color = "#dd7700";
    modifications.opacity = 0.001;
    modifications.dasharray = "none";
    modifications.width = 8;
    return modifications;
};

var geometrySection = new SelectSection("Geometry", 'WME_geometry_section', [highlightExcessComponents, highlightLowAngles, highlightZigZagsComponents, highlightCloseComponents, highlightNoTerm, highlightShortSegments]);
var highlightSection = new SelectSection("Highlight Segments", 'WME_Segments_section', [highlightOneWay, highlightNoDirection, highlightToll, highlightNoName, highlightCity, speedColor, highlightRoadType, highlightSameName, highlightConstZn]);
var advancedSection = new SelectSection("Advanced", 'WME_Advanced_section', [highlightEditor, highlightRecent, highlightLocked]);

var selectSections = [highlightSection, geometrySection, advancedSection];

var allModifiers = [];
/**  The list of all modifiers to display **/
for (var i = 0; i < selectSections.length; i++) {
    allModifiers = allModifiers.concat(selectSections[i].selections);
}
// var allModifiers = [geometrySection.selections, highlightSection.selections, advancedSection.selections];
