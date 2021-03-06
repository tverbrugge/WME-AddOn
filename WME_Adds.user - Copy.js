// ==UserScript==
// @name        WME Adds
// @namespace   WME_ADD
// @include     https://*.waze.com/editor/*
// @version     1
// ==/UserScript==

var version = "v0.0.1";
if ('undefined' == typeof __WME_ADD_SCOPE_RUN__) {
    (function page_scope_runner() {
        // If we're _not_ already running in the page, grab the full source
        // of this script.
        var my_src = "(" + page_scope_runner.caller.toString() + ")();";

        // Create a script node holding this script, plus a marker that lets us
        // know we are running in the page scope (not the Greasemonkey sandbox).
        // Note that we are intentionally *not* scope-wrapping here.
        var script = document.createElement('script');
        script.setAttribute("type", "text/javascript");
        script.textContent = "var __WME_ADD_SCOPE_RUN__ = true;\n" + my_src;

        // Insert the script node into the page, so it will run, and immediately
        // remove it to clean up.  Use setTimeout to force execution "outside" of
        // the user script scope completely.
        setTimeout(function() {
            document.body.appendChild(script);
            document.body.removeChild(script);
        }, 500);
    })();

    // Stop running, because we know Greasemonkey actually runs us in
    // an anonymous wrapper.
    return;
}
  
// CORE FILE  

var WME_ADD_UNKNOWN = -987;

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
var possibleWazeMapEvents = ["mouseout"];
var possibleControllerEvents = ["loadend"];
var possiblePendingControllerEvents = [];
var possibleSelectionModifyEvents = ["deactivate", "featuredeselected"];
var possibleSelectionEvents = ["selectionchanged"];
var possibleSelectionModifyHoverEvents = [];
var possibleActionEvents = [];

var RoadTypeString = {
 1: "Streets",
 2: "Primary Street",
 3: "Freeways",
 4: "Ramps",
 5: "Walking Trails",
 6: "Major Highway",
 7: "Minor Highway",
 8: "Dirt roads",
 10: "Pedestrian Bw",
 16: "Stairway",
 17: "Private Road",
 18: "Railroad",
 19: "Runway/Taxiway",
 20: "Parking Lot Road",
 21: "Service Road"};

function calcTan(dLon, dLat) {
 return (Math.atan(dLon/dLat) / (2 * Math.PI)) * 360;
}


// CLASS DEFINITIONS
function LineBearing(dist, bear) {
  this.distance = dist;
  this.bearing = bear;
}
function getDistance(p1, p2) {
    var lat1 = p1.y;
    var lon1 = p1.x;

    var lat2 = p2.y;
    var lon2 = p2.x;

    var dLat = lat2-lat1;
    var dLon = lon2-lon1;
    d = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));

    // http://mathforum.org/library/drmath/view/55417.html    
    var bearing = 0;
    if (dLon > 0) {
        if(dLat > 0) { bearing = calcTan(dLon,dLat); }
        if(dLat < 0) { bearing = 180 - calcTan(-1 * dLon, dLat); }
        if(dLat == 0) { bearing = 90; }
    }
    if(dLon < 0 ) {
        if(dLat > 0) { bearing = -1 * calcTan(-1 * dLon,dLat); }
        if(dLat < 0) { bearing = calcTan(dLon, dLat)-180; }
        if (dLat == 0) { bearing = 270; }
    }
    if(dLon == 0) {
        if(dLat > 0) { bearing = 0; }
        if(dLat < 0) { bearing = 180; }
        if(dLat == 0) { bearing = 0; }
    }
    bearing += 360;
    bearing %= 360;
    return new LineBearing(d, bearing);
}
function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.getLineTo = function(p2) {
    var lat1 = this.latitude;
    var lon1 = this.longitude;

    var lat2 = p2.latitude;
    var lon2 = p2.longitude;

    var dLat = lat2-lat1;
    var dLon = lon2-lon1;
    var d = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
    
    var bearing = 0;
    // North / South
    if(dLon == 0) { 
        bearing = dLat < 0 ? 180 : 0;
    } else {
        bearing = (Math.tan(dLat/dLon) / (2 * Math.PI)) * 360;
    }
//    return new LineBearing(d, bearing);
}

function WazeLineSegment(segment, street, city) {
    this.geometry = segment.geometry;
    this.attributes = segment.attributes;
    this.sid = this.primaryStreetID;
    this.line = getId(segment.geometry.id);
    this.noName = street.isEmpty;
    this.cityID = street.cityID;
    this.noCity = city.isEmpty;
    this.oneWay = ((this.attributes.fwdDirection + this.attributes.revDirection) == 1);
    // it is 1-way only if either is true
    this.noDirection = (!this.attributes.fwdDirection && !this.attributes.revDirection);
    // Could use the .attribute.allowNoDirection?
    this.updatedOn = new Date(this.attributes.updatedOn);
    this.updatedBy = this.attributes.updatedBy;
    this.fwdSpeed = Math.abs(this.attributes.fwdCrossSpeed);
    this.revSpeed = Math.abs(this.attributes.revCrossSpeed);
    this.length = this.attributes.length;
    this.roadType = this.attributes.roadType;
}

function WazeNode(wazeNode, attachedSegments) {
}

function WMEFunction(acheckboxId, aText) {
    this.checkboxId = acheckboxId;
    this.text = aText;
}

WMEFunction.prototype.getCheckboxId = function() {
    return this.checkboxId;
};
WMEFunction.prototype.getBackground = function() {
    return '#fff';
};
WMEFunction.prototype.build = function() {
    return '<input type="checkbox" id="' + this.getCheckboxId() + '" /> ' + this.text;
};
WMEFunction.prototype.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
};
WMEFunction.prototype.getModifiedAttrs = function(wazeLineSegment) {
    return new Object();
};

function WMEFunctionExtended(acheckboxId, aText) {
    WMEFunction.call(this, acheckboxId, aText);
}

extend(WMEFunctionExtended.prototype, WMEFunction.prototype);
WMEFunctionExtended.prototype.getSelectId = function() {
    return this.getCheckboxId() + 'Select';
}
WMEFunctionExtended.prototype.buildExtended = function() {
    return '';
}
WMEFunctionExtended.prototype.build = function() {
    return WMEFunction.prototype.build.call(this) + '<br />' + this.buildExtended();
};
WMEFunctionExtended.prototype.getSelectFieldChangeFunction = function() {
    var that = this;
    return function() {
        getId(that.getCheckboxId()).checked = "checked";
        highlightSegments();
    };    
};

var speedColor = new WMEFunction("_cbHighlightSpeed", "Speed");
var MAX_THRESHOLD_SPEED = 100;
var MIN_WIDTH_SPEED = 4;
var MAX_WIDTH_SPEED = 10;
var MIN_OPACITY_SPEED = 0.4;
var MAX_OPACITY_SPEED = 0.99;

speedColor.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    var speedToUse = 0;
    if (wazeLineSegment.oneWay && wazeLineSegment.attributes.fwdDirection) {
        speedToUse = wazeLineSegment.fwdSpeed;
    } else if (wazeLineSegment.oneWay && wazeLineSegment.attributes.revDirection) {
        speedToUse = wazeLineSegment.revSpeed;
    } else {
        // take average?  we could do a max, or a min, or ...
        speedToUse = (wazeLineSegment.revSpeed + wazeLineSegment.fwdSpeed) / 2;
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
var highlightNoName = new WMEFunction("_cbHighlightUnnamed", "No Name");
highlightNoName.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.noName) {
        modifications.color = "#fb0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightNoName.getBackground = function() {
  return 'rgba(255,187,0,0.5)';
};
var highlightLocked = new WMEFunction("_cbHighlightLocked", "Locked");
highlightLocked.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    if (wazeLineSegment.attributes.locked) {
        modifications.color = "#f00";
        modifications.opacity = 0.25;
    }
    return modifications;
};
highlightLocked.getBackground = function() {
  return 'rgba(255,0,0,0.25)';
};
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
        modifications.color = "#BE0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightNoTerm.getBackground = function() {
  return 'rgba(187,238,0,0.5)';
};

var highlightWeirdDistance = new WMEFunction("_cbHighlightWeirdLength", "Odd Length");
highlightWeirdDistance.getModifiedAttrs = function(wazeLineSegment) {
    var modifications = new Object();
    var components = wazeLineSegment.geometry.components;
    var lengthSum = 0;
    for(var i = 1; i < components.length; i++) {
        var p1 = new Point(components[i - 1].x, components[i - 1].y);
        var p2 = new Point(components[i].x, components[i].y);
        var dist = getDistance(p1, p2);
        lengthSum += dist.distance;
    }
    var pStart = new Point(components[0].x, components[0].y);
    var pEnd = new Point(components[components.length - 1].x, components[components.length - 1].y);
    var totalDist = getDistance(pStart, pEnd).distance;
    console.log(""+ lengthSum + " and " + totalDist);
    var lengthDiff = lengthSum - totalDist;
    if(lengthDiff < 0.5 && components.length > 2) {
        modifications.color = "#BE0";
        modifications.opacity = 0.5;
    }
    return modifications;
};
highlightWeirdDistance.getBackground = function() {
  return 'rgba(187,238,0,0.5)';
};

var highlightEditor = new WMEFunctionExtended("_cbHighlightEditor", "Show specific editor");
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
    return '<input type="number" min="0" max="365" size="3" id="' + this.getSelectId() + '" /> days';
}
highlightRecent.init = function() {
    getId(this.getCheckboxId()).onclick = highlightSegments;
    getId(this.getSelectId()).onfocus = populateUserList;
    getId(this.getSelectId()).onchange = highlightSegments;
};
highlightRecent.getBackground = function() {
  return 'rgba(0,255,0,0.7)';
};


var highlightRoadType = new WMEFunctionExtended("_cbHighlightRoadType", "RoadType");
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
    } else if (currentCity == WME_ADD_UNKNOWN && wazeLineSegment.noCity){
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
    return '<input type="number" min="0" max="100" size="3" id="' + this.getSelectId() + '" /> meters';
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

/**  The list of all modifiers **/
var segmentModifiers = [highlightOneWay, highlightNoDirection, highlightNoTerm, highlightToll, highlightLocked, highlightNoName, speedColor, highlightWeirdDistance];
var advancedModifiers = [highlightEditor, highlightRecent, highlightShortSegments, highlightRoadType, highlightCity];
var allModifiers = [segmentModifiers, advancedModifiers]

function highlightSegments() {
    modifySegements(highlightNull);
    for (var i = 0; i < allModifiers.length; i++) {
        var segModGroup = allModifiers[i];
        for (var j = 0; j < segModGroup.length; j++) {
            var segMod = segModGroup[j];
            if (getId(segMod.getCheckboxId()).checked) {
                modifySegements(segMod);
            }
        }
    }
    return true;
}

function enumerateAllModifiers(work) {
    for (var i = 0; i < allModifiers.length; i++) {
        var segModGroup = allModifiers[i];
        for (var j = 0; j < segModGroup.length; j++) {
            var segMod = segModGroup[j];
            work(segMod);
        }
    }
}

function modifySegements(modifier) {
    for (var seg in wazeModel.segments.objects) {
        var segment = wazeModel.segments.get(seg);
        var attributes = segment.attributes;
        var line = getId(segment.geometry.id);

        if (line != null) {
            var sid = attributes.primaryStreetID;
            if (sid == null)
                continue;
            var street = wazeModel.streets.get(sid);

            var currentColor = line.getAttribute("stroke");
            var currentOpacity = line.getAttribute("stroke-opacity");
            var currentDashes = line.getAttribute("stroke-dasharray");
            var currentWidth = line.getAttribute("stroke-width");

            // check that WME hasn't highlighted this segment
            if (currentOpacity == 1 || currentWidth == 9) {
                continue;
            }

            var roadType = attributes.roadType;
            if (wazeMap.zoom <= 3 && (roadType < 2 || roadType > 7)) {
                if (currentOpacity > 0.1) {
                    line.setAttribute("stroke", "#dd7700");
                    line.setAttribute("stroke-opacity", 0.001);
                    line.setAttribute("stroke-dasharray", "none");
                }
                continue;
            }

            var wazeLineSeg = new WazeLineSegment(segment, street, wazeModel.cities.get(street.cityID));
            var lineMods = modifier.getModifiedAttrs(wazeLineSeg);

            var newColor = lineMods.color ? lineMods.color : currentColor;
            line.setAttribute("stroke", newColor);

            if (lineMods.color && lineMods.color != currentColor) {
            }
            if (lineMods.opacity && lineMods.opacity != currentOpacity) {
                line.setAttribute("stroke-opacity", lineMods.opacity);
            }
            if (lineMods.dasharray && lineMods.dasharray != currentDashes) {
                line.setAttribute("stroke-dasharray", lineMods.dasharray);
            }
            if (lineMods.width && lineMods.width != currentWidth) {
                line.setAttribute("stroke-width", lineMods.width);
            }
        }
    }
}

// add logged in user to drop-down list
function initUserList() {
    var thisUser = loginManager.getLoggedInUser();
    var selectUser = getId(highlightEditor.getSelectId());
    var usrOption = document.createElement('option');
    var usrText = document.createTextNode(thisUser.userName + " (" + thisUser.rank + ")");
    usrOption.setAttribute('value', thisUser.id);
    usrOption.appendChild(usrText);
    selectUser.appendChild(usrOption);
}

function populateOption(selectId, optionsMap) {
    var select = getId(selectId);
    var currentId = null;
    if (select.selectedIndex >= 0) {
        currentId = select.options[select.selectedIndex].value;
    }
    select.options.length = 0;

    var foundSelected = false;
    for (var key in optionsMap) {
        var text = optionsMap[key];
        var selectOption = document.createElement('option');
        var selectText = document.createTextNode(text);
        if (currentId != null && key == currentId) {
            selectOption.setAttribute('selected', true);
            foundSelected = true;
        }
        selectOption.setAttribute('value', key);
        selectOption.appendChild(selectText);
        select.appendChild(selectOption);
    }

}

// populate drop-down list of Cities
function populateCityList() {
    var cityIds = new Object();
    cityIds[WME_ADD_UNKNOWN] = "No City";
    for (var cit in wazeModel.cities.objects) {
        var city = wazeModel.cities.get(cit);
        if (cityIds[city.id] == null && city.name != null && city.name.length > 0) {
            console.log("city.id" + city.id +  "= '" + city.name + "'");
            cityIds[city.id] = city.name;
        }
    }
    populateOption(highlightCity.getSelectId(), cityIds);  
}


// populate drop-down list of editors
function populateUserList() {
    var editorIds = new Object();
    for (var seg in wazeModel.segments.objects) {
        var segment = wazeModel.segments.get(seg);
        var updatedBy = segment.attributes.updatedBy;
        if (editorIds[updatedBy] == null) {
            var user = wazeModel.users.get(updatedBy);
            if (user == null || user.userName.match(/^world_|^usa_/) != null) {
                continue;
            }
            editorIds[updatedBy] = user.userName;
        }
    }
    populateOption(highlightEditor.getSelectId(), editorIds);
}

function getId(node) {
    return document.getElementById(node);
}

function createSection(sectionName, modifiers) {
    // advanced options
    var section = document.createElement('div');
    section.style.paddingTop = "8px";
    section.id = 'WMEAdd_advancedOptions';
    var aheader = document.createElement('h4');
    aheader.innerHTML = '<b>' + sectionName + '</b>';
    section.appendChild(aheader);

    // section.innerHTML = '<h4><b>Advanced Options</b></h4>';
    for (var i = 0; i < modifiers.length; i++) {
        var segMod = modifiers[i];
        var segmentContainer = document.createElement('div');
        
        var segmentColor = document.createElement('div');
        segmentColor.innerHTML="▶";
        segmentColor.style.color = segMod.getBackground();
        segmentColor.style.textShadow = "1px 1px 2px #333";
        segmentColor.style.cssFloat = "left";
        segmentColor.style.height = "100%";
        segmentColor.style.lineHeight = "100%";
        
        var segmentBuild = document.createElement('div');
        segmentBuild.innerHTML = segMod.build();
        segmentBuild.style.paddingLeft = "1.5em";
        
        segmentContainer.appendChild(segmentColor);
        segmentContainer.appendChild(segmentBuild);
        //    segmentContainer.style.background = segMod.getBackground();
        section.appendChild(segmentContainer);
    }
    return section;
}

function toggleAddonVisible() {
    var visibleElement = getId("highlight-addon");
    if(visibleElement.style.display == "none") {
        visibleElement.style.display = "block";
    }
    else {
        visibleElement.style.display = "none";
    }
}

// add new box to the map
var addonContainer = document.createElement('section');
var clickBarContainer = document.createElement('div');
var clickBar = document.createElement('a');
clickBar.id = "WME_ADD_addOnToggle"
clickBar.innerHTML = 'Show / Hide';
// clickBar.style.background = '#ccc';
// clickBar.style.textAlign = 'center';
// clickBar.style.margin = '0 auto';
// clickBar.style.width = '100%';
// clickBar.style.cursor = 'pointer';
clickBar.onclick = toggleAddonVisible;
clickBarContainer.style.margin = '0 auto';
clickBarContainer.style.textAlign = 'center';
clickBarContainer.style.minHeight = '1.2em';
clickBarContainer.appendChild(clickBar);
addonContainer.appendChild(clickBarContainer);

var addon = document.createElement('section');
addon.id = "highlight-addon";

addon.innerHTML = '<b>WME Add</b> ' + version;

addon.appendChild(createSection("Highlight Segments", segmentModifiers));
addon.appendChild(createSection("Extended Options", advancedModifiers));

var section = document.createElement('div');
section.innerHTML = '<button type="button" id="_cbRefreshButton">Refresh</button> ';
addon.appendChild(section);

addonContainer.style.fontSize = "0.8em";
addonContainer.style.margin = "8px";
addonContainer.style.background = "#fff"
addonContainer.style.border = "silver solid 1px";
addonContainer.style.position = "absolute";
addonContainer.style.bottom = "24px";
addonContainer.style.clear = "all";
addonContainer.style.padding = "12px";
addonContainer.style.mozBorderRadius = "5px";
addonContainer.style.webkitBorderRadius = "5px";
addonContainer.style.borderRadius = "5px";
addonContainer.style.boxShadow = "2px 2px 5px #000"
addonContainer.appendChild(addon);

var stylizer = document.createElement('style');
stylizer.innerHTML = "   #WME_ADD_addOnToggle{"
stylizer.innerHTML += generateTopDownGradient('#eeeeee', '#cccccc');
stylizer.innerHTML += "    border: 1px solid #ccc;"
stylizer.innerHTML += "    border-bottom: 1px solid #bbb;"
stylizer.innerHTML += "    -webkit-border-radius: 3px;"
stylizer.innerHTML += "    -moz-border-radius: 3px;"
stylizer.innerHTML += "    -ms-border-radius: 3px;"
stylizer.innerHTML += "    -o-border-radius: 3px;"
stylizer.innerHTML += "    border-radius: 3px;"
stylizer.innerHTML += "    color: #333;"
stylizer.innerHTML += "    font: bold 11px 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Geneva, Verdana, sans-serif;"
stylizer.innerHTML += "    line-height: 1;"
stylizer.innerHTML += "    padding: 0.1em 0.2em;"
stylizer.innerHTML += "    text-align: center;"
stylizer.innerHTML += "    text-shadow: 0 1px 0 #eee;"
stylizer.innerHTML += "    width: 120px; }"
stylizer.innerHTML += "   #WME_ADD_addOnToggle:hover{ "
stylizer.innerHTML += generateTopDownGradient('#dddddd', '#bbbbbb');
stylizer.innerHTML += "    border: 1px solid #bbb;"
stylizer.innerHTML += "    border-bottom: 1px solid #999;"
stylizer.innerHTML += "    cursor: pointer;"
stylizer.innerHTML += "    text-shadow: 0 1px 0 #ddd; }"
stylizer.innerHTML += "   #WME_ADD_addOnToggle:active{"
stylizer.innerHTML += "    border: 1px solid #aaa;"
stylizer.innerHTML += "    border-bottom: 1px solid #888;"
stylizer.innerHTML += "    -webkit-box-shadow: inset 0 0 5px 2px #aaaaaa, 0 1px 0 0 #eeeeee;"
stylizer.innerHTML += "    -moz-box-shadow: inset 0 0 5px 2px #aaaaaa, 0 1px 0 0 #eeeeee;"
stylizer.innerHTML += "    box-shadow: inset 0 0 5px 2px #aaaaaa, 0 1px 0 0 #eeeeee; }"
getId('editor-container').appendChild(stylizer);
getId('editor-container').appendChild(addonContainer);

// check for AM or CM, and unhide Advanced options
var advancedMode = false;
if (loginManager != null) {
    thisUser = loginManager.getLoggedInUser();
    if (thisUser != null && thisUser.normalizedLevel >= 4) {
        getId('WMEAdd_advancedOptions').style.display = 'block';
        advancedMode = true;
//        initUserList();
        populateUserList();
        populateCityList();
    }
}

// setup onclick handlers for instant update:
getId('_cbRefreshButton').onclick = highlightSegments;
enumerateAllModifiers(function(seg) {
    seg.init();
});



function createWazeMapEventAction(actionName) {
    return function() {
        setTimeout(function() {
            highlightSegments();
        }, 100);
        return true;
    };
}

function analyzeNodes() {
    var wazeNodes = new Object();
    for (var wazeNode in wazeModel.nodes.objects) {
        var attachedSegments = [];
        for(var wazeSegID in wazeNode.data.segIDs) {
            attachedSegments.push(wazeModel.segments.objects[wazeSegID]);
        }
        wazeNodes[wazeNode.fid] = new WazeNode(wazeNode, attachedSegments);
    }
}

function createEventAction(eventHolderName, actionName) {
    return function() {
        highlightSegments();
        populateUserList();
        populateCityList();
        return true;
    };
}

// trigger code when page is fully loaded, to catch any missing bits
window.addEventListener("load", function(e) {
    thisUser = loginManager.getLoggedInUser();
    if (!advancedMode && thisUser.normalizedLevel >= 4) {
        getId('WMEAdd_advancedOptions').style.display = 'block';
        advancedMode = true;
        populateUserList();
        populateCityList();
    }
    for (var i = 0; i < possibleControllerEvents.length; i++) {
        var eventName = possibleControllerEvents[i];
        controller.events.register(eventName, this, createEventAction("controller", eventName));
    }
    for (var i = 0; i < possibleWazeMapEvents.length; i++) {
        var eventName = possibleWazeMapEvents[i];
        wazeMap.events.register(eventName, this, createWazeMapEventAction(eventName));
    }
    for (var i = 0; i < possiblePendingControllerEvents.length; i++) {
        var eventName = possiblePendingControllerEvents[i];
        pendingControl.events.register(eventName, this, createEventAction("pendingControl", eventName));
    }
    for (var i = 0; i < possibleSelectionModifyEvents.length; i++) {
        var eventName = possibleSelectionModifyEvents[i];
        selectionManager.modifyControl.events.register(eventName, this, createEventAction("selectionManager.modifyControl", eventName));
    }
    for (var i = 0; i < possibleSelectionEvents.length; i++) {
        var eventName = possibleSelectionEvents[i];
        selectionManager.events.register(eventName, this, createEventAction("selectionManager", eventName));
    }
    for (var i = 0; i < possibleSelectionModifyHoverEvents.length; i++) {
        var eventName = possibleSelectionModifyHoverEvents[i];
        selectionManager.modifyControl.featureHover.control.events.register(eventName, this, createEventAction("selectionManager.modifyControl.featureHover.control", eventName));
    }
    for (var i = 0; i < possibleActionEvents.length; i++) {
        var eventName = possibleActionEvents[i];
        wazeModel.actionManager.events.register(eventName, this, createEventAction("wazeModel.actionManager", eventName));
    }
});

