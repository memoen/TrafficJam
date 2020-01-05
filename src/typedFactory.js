"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var car_1 = require("./car");
var onRoadItem_1 = require("./onRoadItem");
var OnRoadObjectFactor = /** @class */ (function () {
    function OnRoadObjectFactor() {
    }
    OnRoadObjectFactor.prototype.build = function () {
    };
    return OnRoadObjectFactor;
}());
var TeslaFactory = /** @class */ (function () {
    function TeslaFactory() {
    }
    TeslaFactory.prototype.build = function () {
        return new car_1.Car(car_1.CarModelList.telsaX, 5, 2, 2, 400, 200, 50);
    };
    return TeslaFactory;
}());
exports.TeslaFactory = TeslaFactory;
var SlowCarFactory = /** @class */ (function () {
    function SlowCarFactory() {
    }
    SlowCarFactory.prototype.build = function () {
        return new car_1.Car(car_1.CarModelList.fordModelT, 5, 2, 2, 400, 20000, 10);
    };
    return SlowCarFactory;
}());
exports.SlowCarFactory = SlowCarFactory;
var TrafficLightFactory = /** @class */ (function () {
    function TrafficLightFactory() {
        this.positionIterator = 0;
    }
    TrafficLightFactory.prototype.build = function () {
        var trafficSession = new onRoadItem_1.TrafficSession(4, 5);
        this.positionIterator++;
        return new onRoadItem_1.TrafficLight({ x: this.positionIterator * 100 }, trafficSession);
    };
    return TrafficLightFactory;
}());
exports.TrafficLightFactory = TrafficLightFactory;
var BlockConstructionOnRoadFactory = /** @class */ (function () {
    function BlockConstructionOnRoadFactory() {
        this.positionIterator = 1;
    }
    BlockConstructionOnRoadFactory.prototype.build = function () {
        var brick = new onRoadItem_1.BlockConstructionOnRoad({ x: this.positionIterator * 100 }, 1);
        console.log(brick);
        this.positionIterator++;
        return brick;
    };
    return BlockConstructionOnRoadFactory;
}());
exports.BlockConstructionOnRoadFactory = BlockConstructionOnRoadFactory;
//# sourceMappingURL=typedFactory.js.map