"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalTypes_1 = require("./globalTypes");
var SignOnRoad = /** @class */ (function () {
    function SignOnRoad(Location) {
        this.Location = Location;
        this.type = globalTypes_1.OnRoadObjectList.sign;
        this.lineAlocate = 0;
    }
    SignOnRoad.prototype.getInfoForAP = function () {
        return {
            location: this.Location,
            type: this.type,
            vector: { x: 0 },
            lineAlocate: this.lineAlocate
        };
    };
    SignOnRoad.prototype.ApCall = function () {
    };
    return SignOnRoad;
}());
exports.SignOnRoad = SignOnRoad;
var BlockConstructionOnRoad = /** @class */ (function () {
    function BlockConstructionOnRoad(Location, lineAlocate) {
        this.Location = Location;
        this.lineAlocate = lineAlocate;
        this.type = globalTypes_1.OnRoadObjectList.brick;
    }
    BlockConstructionOnRoad.prototype.getInfoForAP = function () {
        return {
            location: this.Location,
            type: this.type,
            vector: { x: 0 },
            lineAlocate: this.lineAlocate,
        };
    };
    BlockConstructionOnRoad.prototype.ApCall = function () {
    };
    return BlockConstructionOnRoad;
}());
exports.BlockConstructionOnRoad = BlockConstructionOnRoad;
var TrafficSession = /** @class */ (function () {
    function TrafficSession(greenTimer, redTimer) {
        this.isAbleToRun = false;
        this.timeToChange = 0;
        this.greenLightTime = greenTimer;
        this.redLightTime = redTimer;
    }
    TrafficSession.prototype.getState = function () {
        return {
            isAbleToRun: this.isAbleToRun,
        };
    };
    TrafficSession.prototype.move = function (time) {
        if (this.timeToChange - time <= 0) {
            time -= this.timeToChange;
            if (this.isAbleToRun) {
                this.timeToChange = this.redLightTime;
            }
            else {
                this.timeToChange = this.greenLightTime;
            }
            this.isAbleToRun = !this.isAbleToRun;
        }
        this.timeToChange -= time;
    };
    return TrafficSession;
}());
exports.TrafficSession = TrafficSession;
var TrafficLight = /** @class */ (function () {
    function TrafficLight(Location, light) {
        this.Location = Location;
        this.light = light;
        this.type = globalTypes_1.OnRoadObjectList.trafficlight;
        this.vector = { x: 0 };
        this.lineAlocate = 0;
    }
    TrafficLight.prototype.getInfoForAP = function () {
        return {
            location: this.Location,
            type: this.type,
            vector: this.vector,
            lightInfo: this.light,
            lineAlocate: this.lineAlocate,
        };
    };
    TrafficLight.prototype.ApCall = function (timer, inVisionObj) {
        this.light.move(timer);
    };
    return TrafficLight;
}());
exports.TrafficLight = TrafficLight;
//# sourceMappingURL=onRoadItem.js.map