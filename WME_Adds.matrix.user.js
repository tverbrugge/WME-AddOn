function createSegmentChain(segmentId) {
var streetId = wazeModel.segments.objects[segmentId];

// wazeModel.streets.objects[{ID}]
    var wazeSeg = wazeModel.segments.objects[segmentId];
    var streetId   = wazeSeg.data.primaryStreetID
    var fromNodeID = wazeSeg.data.fromNodeID;
    var toNodeID   = wazeSeg.data.toNodeID;
    var fromNode   = wazeModel.nodes.objects[fromNodeID];
    var toNode     = wazeModel.nodes.objects[toNodeID];
    
    var street     = wazeModel.streets.objects[streetId];

}


function streetSegment() {
}