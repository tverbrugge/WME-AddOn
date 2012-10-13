
var DEBUG = false;

var possibleWazeMapEvents = ["mouseout", "zoomend"];
var possibleControllerEvents = ["loadend"];
var possiblePendingControllerEvents = [];
var possibleSelectionModifyEvents = ["deactivate", "featuredeselected"];
var possibleSelectionEvents = ["selectionchanged"];
var possibleSelectionModifyHoverEvents = [];
var possibleActionEvents = [];


function highlightSegments() {
    modifySegements(highlightNull);
    for (var i = 0; i < allModifiers.length; i++) {
        var segModGroup = allModifiers[i];
        if (getId(segModGroup.getCheckboxId()).checked) {
            modifySegements(segModGroup);
        }
    }
    return true;
}

function enumerateAllModifiers(work) {
    for (var i = 0; i < allModifiers.length; i++) {
        var segModGroup = allModifiers[i];
        work(segModGroup);
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

            var wazeLineSeg = new WazeLineSegment(segment, street);
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

function createSectionHeader(title, opened) {
    var indicator = "&lt;&lt;"
    if(!opened) {
        indicator = "&gt;&gt;"
    }
    return '<b>' + title + '</b><span style="float:right;padding:0;margin:0 0 0 2px;border: 1px solid #999; background: #aaa; color:#fff;">' + indicator + '</span>'
}

function createSection(sectionItem) {
    var thisSectionItem = sectionItem;
    // advanced options
    var section = document.createElement('div');
    section.style.marginTop = "4px";
    section.style.padding = "4px";
    section.style.borderStyle = "solid";
    section.style.borderWidth = "1px";
    section.style.borderColor = "#aaa";
    section.id = thisSectionItem.id;
    var aheader = document.createElement('h4');
    aheader.innerHTML = createSectionHeader(thisSectionItem.header, false);
    aheader.style.display = 'block';
    aheader.style.cursor = 'pointer';

    section.appendChild(aheader);
    
    var segmentsContainer = document.createElement('div');
    segmentsContainer.style.display = 'none';
    aheader.onclick = function() {
        if(segmentsContainer.style.display == 'block') {
            segmentsContainer.style.display = 'none';
            aheader.innerHTML = createSectionHeader(thisSectionItem.header, false);
        } else {
            segmentsContainer.style.display = 'block';
            aheader.innerHTML = createSectionHeader(thisSectionItem.header, true);
        }
    };
    section.appendChild(segmentsContainer);
    
    var modifiers = thisSectionItem.selections;
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
        segmentsContainer.appendChild(segmentContainer);
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
clickBar.style.textAlign = 'center';
clickBar.onclick = toggleAddonVisible;
clickBarContainer.style.margin = '0 auto';
clickBarContainer.style.textAlign = 'center';
clickBarContainer.style.minHeight = '1.2em';
clickBarContainer.appendChild(clickBar);
addonContainer.appendChild(clickBarContainer);

var addon = document.createElement('section');
addon.id = "highlight-addon";

addon.innerHTML = '<b>WME Add</b> ' + version;

for(var i = 0; i < selectSections.length; i++) {
    addon.appendChild(createSection(selectSections[i]));
}

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

if(DEBUG) {
    var WME_ADD_Popup = document.createElement('div');
    WME_ADD_Popup.id = 'WME_ADD_Popup';
    WME_ADD_Popup.style.background = "#fff"
    WME_ADD_Popup.style.position = "absolute";
    WME_ADD_Popup.style.bottom = "48px";
    WME_ADD_Popup.style.right = "24px";
    getId('editor-container').appendChild(WME_ADD_Popup);
}

// check for AM or CM, and unhide Advanced options
var advancedMode = false;
if (loginManager != null) {
    thisUser = loginManager.getLoggedInUser();
    if (thisUser != null && thisUser.normalizedLevel >= 4) {
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

function showPopup() {
    if(selectionManager.selectedItems.length > 0) {
        console.log(selectionManager.selectedItems[0].geometry.components.length);
        var cmpnnts = selectionManager.selectedItems[0].geometry.components;
        var compSegs = getComponentsProperties(cmpnnts);
        var sum = 0;
        var userString = "";
        for(var i = 0; i < compSegs.length; i++) {
            var compSeg = compSegs[i];
            sum += compSeg.distance;
            userString += "dist: " + compSeg.distance + ";";
        }
        WME_ADD_Popup.innerHTML = userString;
    }
    else {
        WME_ADD_Popup.innerHTML = "";
    }
}

function createEventAction(eventHolderName, actionName) {
    return function() {
        highlightSegments();
        populateUserList();
        populateCityList();
        // showPopup();
        return true;
    };
}

// trigger code when page is fully loaded, to catch any missing bits
window.addEventListener("load", function(e) {
    thisUser = loginManager.getLoggedInUser();
    if (!advancedMode && thisUser.normalizedLevel >= 4) {
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

