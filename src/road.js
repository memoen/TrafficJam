"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalTypes_1 = require("./globalTypes");
var car_1 = require("./car");
var rxjs_1 = require("rxjs");
var RoadSegment = /** @class */ (function () {
    function RoadSegment(maxSpeed, length, lineCount) {
        this.maxSpeed = maxSpeed;
        this.length = length;
        this.lineCount = lineCount;
        this.registeredObject = [];
        this.despawnNotify = new rxjs_1.Subject();
        // numeration start from 1
    }
    Object.defineProperty(RoadSegment.prototype, "RegisteredObject", {
        get: function () {
            return this.registeredObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoadSegment.prototype, "Length", {
        get: function () {
            return this.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoadSegment.prototype, "LineCount", {
        get: function () {
            return this.lineCount;
        },
        enumerable: true,
        configurable: true
    });
    RoadSegment.prototype.transformRoadObjectToApilotCall = function () {
        return this.registeredObject.map(function (object) {
            return object.getInfoForAP();
        });
    };
    RoadSegment.prototype.markCarForDespawn = function () {
        var toDespawn = [];
        var toSave = [];
        var registeredObjectList = this.registeredObject;
        var objectList = this.transformRoadObjectToApilotCall();
        for (var i = 0; i < objectList.length; i++) {
            if (objectList[i].type === globalTypes_1.OnRoadObjectList.car && objectList[i].location.x > this.length) {
                toDespawn.push(registeredObjectList[i]);
            }
            else {
                toSave.push(registeredObjectList[i]);
            }
        }
        if (toDespawn.length) {
            this.registeredObject = toSave;
            this.despawnNotify.next(toDespawn);
        }
    };
    RoadSegment.prototype.getBrickList = function () {
        return this.registeredObject.filter(function (obj) {
            return obj.type === globalTypes_1.OnRoadObjectList.brick;
        });
    };
    RoadSegment.prototype.isAbleToSpawnCar = function (interval, line) {
        var carList = this.getCarList().map(function (car) { return car.getInfoForAP(); }).filter(function (car) { return car.lineAlocate === line && car.location.x < interval; });
        return carList.length === 0;
    };
    RoadSegment.prototype.update = function (s) {
        var objectList = this.transformRoadObjectToApilotCall();
        for (var i = 0; i < objectList.length; i++) {
            this.registeredObject[i].ApCall(s, objectList);
        }
        this.markCarForDespawn();
    };
    RoadSegment.prototype.onDespawn = function () {
        return this.despawnNotify;
    };
    RoadSegment.prototype.getTrafficLightList = function () {
        return this.registeredObject.filter(function (obj) {
            return obj.type === globalTypes_1.OnRoadObjectList.trafficlight;
        });
    };
    RoadSegment.prototype.getCarList = function () {
        return this.registeredObject.filter(function (obj) {
            return obj.type === globalTypes_1.OnRoadObjectList.car;
        });
    };
    RoadSegment.prototype.addCar = function (car, position, move, line) {
        if (line < 1 || line > this.lineCount) {
            throw "invalid line value";
        }
        var roadCar = new car_1.CarOnRoad(car, position, move, line);
        roadCar.setMaxLine(this.lineCount);
        roadCar.setMaxSpeed(this.maxSpeed);
        this.registeredObject.push(roadCar);
        return roadCar;
    };
    RoadSegment.prototype.addTrafficLight = function (light) {
        this.registeredObject.push(light);
    };
    RoadSegment.prototype.addBrick = function (brick) {
        this.registeredObject.push(brick);
    };
    return RoadSegment;
}());
exports.RoadSegment = RoadSegment;
//# sourceMappingURL=road.js.map