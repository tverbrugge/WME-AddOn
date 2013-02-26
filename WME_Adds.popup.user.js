var WME_ADD_Popup = document.createElement('div');
WME_ADD_Popup.id = 'WME_ADD_Popup';
getId('editor-container').appendChild(WME_ADD_Popup);

var InterstateRegEx = /^I-\d\d\d? /;

function showPopup() {
    if(selectionManager.modifyControl.featureHover.feature && 
        selectionManager.modifyControl.featureHover.feature.CLASS_NAME == 'Waze.Feature.Vector.Segment') {
        var segment = selectionManager.modifyControl.featureHover.feature;
//        var cmpnnts = segment.geometry.components;
//        var compSegs = getComponentsProperties(cmpnnts);
        var popupClass = "";
		if(segment.attributes.locked) {
			popupClass += "locked";
		}
        var userString = "<div id='popup_container' class='" + popupClass + "'>";
        
        var sid = segment.attributes.primaryStreetID;
        var street = wazeModel.streets.get(sid);
        if(typeof street != 'undefined') {
            var isFreeway = false;
            var streetStyleClass = 'WME_ADD_streetSign';
			switch(segment.attributes.roadType) {
			case 3 : //freeway
                isFreeway = true;
                break;
			case 17: // Private Road
			case 20: // Parking Lot Road
				streetStyleClass = 'WME_ADD_parkingLotSign';
				break;
			case 10: //Pedestrian Bw
				streetStyleClass = 'WME_ADD_trailSign';
                break;
			default: 
				break;
			}
            if(sid && street.name !== null) {
                var streetName = street.name; 
                var isInterstate = false;
                if(isFreeway) { // freeway
                    var regexMatch = streetName.match(InterstateRegEx);
                    if(regexMatch != null) {
                        isInterstate = true;
                        streetStyleClass = 'WME_ADD_interstate';
                        var interstateNum = regexMatch.first().substr(2).trim();
                        streetName = interstateNum;
                    }
                }
                
                // Add "Toll"
                if(segment.attributes.revToll || segment.attributes.fwdToll) {
                    userString += "<div id='WME_ADD_tollRoad'>Toll</div>"
                }

                // Add "One Way" arrow
                if(!isFreeway && isOneWay(segment)) {
                    userString += "<div style='background: #000; color:#fff;font-size:.92em;font-weight:bold;line-height:.7em;'>"
                    userString += "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAARCAAAAAC6bKD1AAABp0lEQVR4XpXRX0hTcRyH4dfDZDW0CSPWqoVnEQghXfQHodNVXYaRYGAXFVjkRRTBumgjCJMZWkMLgnkRWWIorYZhrVKSwv5ehLnFcSw4DaE11s1ghcnhF4yzc+487Ll/4cvnSyHzfLoGL7K/UXdgwztyBEtrhqfYaRdiYhOmV5KOnflVjqVOYHIAbF7PWtRWPKNdPT8wJIA5IRbiZTEn/n7Uksl3QuS/Lau5rFj8mdJE+bWoKJ2TjMOoeN+ZOMrhZCH4uPfRLCz13rp0b4auwVLH6rUZKhpvv2kBwEjGIveLy86QDh3RMMja289ZOS1N7dt9PhHCsP9LuN5K8s0055v2jsKNtjL4tF87X8qTBz0f+icHXFSt63tYZybeHDkvV2MQTjeAo3HPgeLWuFo34Qm0YdKHTgozOR46s8GPrwfiFy4DsqL4ljY+S07rWNLKxXJ1ZFDGMlFiBA/5tlMP9PsbHjTdwX135aabCv5dj6xYfznlAvqoCmIwjO8CPp1eBCvRWIu7Bf5cGdapJhJ2FCezZ79jSW3BxrYn3RKmgEphYaomX4v/Ae4Q1fDFrZZBAAAAAElFTkSuQmCC' />"
                    userString += "</div>"
                }
                

                userString += "<div id='popup_street_name' class='" + streetStyleClass + "'>";
                var streetNamePieces = streetName.split('/');
                for(var snpIndex = 0; snpIndex < streetNamePieces.length; snpIndex++) {
                    var prefixStr = "";
                    var suffixStr = "";
                    var steetNamePiece = streetNamePieces[snpIndex].trim();
                    for(var i = 0; i < FRONT_ABBREVS.length; i++) {
                        var strToMatch = FRONT_ABBREVS[i] + " ";
                        var startIndex = steetNamePiece.search(strToMatch)
                        if(startIndex == 0) {
                            prefixStr = "<span id='street_name_prefix'>" + steetNamePiece.slice(startIndex,strToMatch.length) + "</span>";
                            steetNamePiece = steetNamePiece.slice(strToMatch.length);
                            break;
                        }
                    }
                    for(var i = 0; i < END_ABBREVS.length; i++) {
                        var strToMatch = " " + END_ABBREVS[i];
                        var expectedIndex = steetNamePiece.length - strToMatch.length;
                        if(expectedIndex > 0 && steetNamePiece.search(strToMatch) == expectedIndex) {
                            suffixStr = "<span id='street_name_suffix'>" + steetNamePiece.slice(expectedIndex) + "</span>";
                            steetNamePiece = steetNamePiece.slice(0, expectedIndex);
                            break;
                        }
                    }
                    userString += prefixStr + steetNamePiece + suffixStr;
                    if(snpIndex != streetNamePieces.length - 1) {
                        userString += '<br />';
                    }
                }
                userString += "</div>";
            }
            var city = wazeModel.cities.get(street.cityID);
            if(city && city.name) {
                userString += "<div id='popup_street_city' class='" + streetStyleClass + "'>"
                userString += city.name;
                userString += "</div>"
            }
        }
        
        var speedToUse = getSegmentSpeed(segment);
        if(!isNaN(speedToUse)) {
            userString += "<div id='popup_speed'>"
            userString += "<div id='popup_speed_header'>SPEED<br />LIMIT</div><div id='popup_speed_value'>" + speedToUse + "</div>"
            userString += "</div>";
        }
        userString += "</div>"
        WME_ADD_Popup.innerHTML = userString;
    }
    else {
        WME_ADD_Popup.innerHTML = "";
    }
}