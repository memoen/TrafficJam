"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reactionLevel;
(function (reactionLevel) {
    reactionLevel[reactionLevel["move"] = 0] = "move";
    reactionLevel[reactionLevel["acselerate"] = 1] = "acselerate";
    reactionLevel[reactionLevel["break"] = 2] = "break";
})(reactionLevel = exports.reactionLevel || (exports.reactionLevel = {}));
var OnRoadObjectList;
(function (OnRoadObjectList) {
    OnRoadObjectList[OnRoadObjectList["car"] = 0] = "car";
    OnRoadObjectList[OnRoadObjectList["trafficlight"] = 1] = "trafficlight";
    OnRoadObjectList[OnRoadObjectList["brick"] = 2] = "brick";
    OnRoadObjectList[OnRoadObjectList["sign"] = 3] = "sign";
})(OnRoadObjectList = exports.OnRoadObjectList || (exports.OnRoadObjectList = {}));
//# sourceMappingURL=globalTypes.js.map