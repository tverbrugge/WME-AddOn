var WME_ADD_UNKNOWN = -987;

function SelectSection(hdr, iD, slctns) {
this.header = hdr;
this.id = iD;
this.selections = slctns;
}

// CLASS DEFINITIONS
function LineBearing(dist, bear) {
  this.distance = dist;
  this.bearing = bear;
}
function getDistance(p1, p2) {
    var y1 = p1.y;
    var x1 = p1.x;

    var y2 = p2.y;
    var x2 = p2.x;

    var dLat = y2-y1;
    var dLon = x2-x1;
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

function getComponentsProperties(comps) {
     var compSegs = [];
    for(var i = 1; i < comps.length; i++) {
        var p1 = compToPoint(comps[i - 1]);
        var p2 = compToPoint(comps[i]);
        var dist = getDistance(p1, p2);
        compSegs.push(dist);
    }
    return compSegs;
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function compToPoint(comp) {
    return new Point(comp.x, comp.y);
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

function WazeLineSegment(segment, street) {
    var city = wazeModel.cities.get(street.cityID);
    this.geometry = segment.geometry;
    this.attributes = segment.attributes;
    this.sid = this.primaryStreetID;
    this.line = getId(segment.geometry.id);
    this.streetName = street.name;
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
