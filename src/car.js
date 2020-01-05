"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalTypes_1 = require("./globalTypes");
var autoPilot_1 = require("./autoPilot");
var CarModelList;
(function (CarModelList) {
    CarModelList[CarModelList["telsaX"] = 0] = "telsaX";
    CarModelList[CarModelList["fordModelT"] = 1] = "fordModelT";
})(CarModelList = exports.CarModelList || (exports.CarModelList = {}));
var Car = /** @class */ (function () {
    function Car(model, weight, height, depth, breakPower, motorPower, maxSpeed) {
        this.model = model;
        this.weight = weight;
        this.height = height;
        this.depth = depth;
        this.breakPower = breakPower;
        this.motorPower = motorPower;
        this.maxSpeed = maxSpeed;
        this.currentSpeed = 0;
    }
    Object.defineProperty(Car.prototype, "MaxSpeed", {
        get: function () {
            return this.maxSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "CurrentSpeed", {
        get: function () {
            return this.currentSpeed;
        },
        set: function (value) {
            if (value <= 0) {
                this.currentSpeed = 0;
            }
            else if (value > this.maxSpeed) {
                this.currentSpeed = this.maxSpeed;
            }
            else {
                this.currentSpeed = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Car.prototype.calculateDeltaSpeed = function (energy) {
        return Math.sqrt(2 * energy / this.weight);
    };
    Car.prototype.newSpeedByEnergyChange = function (newEnergy) {
        var delta = this.calculateDeltaSpeed(Math.abs(newEnergy));
        if (newEnergy > 0) {
            return this.currentSpeed + delta;
        }
        return this.currentSpeed - delta;
    };
    Car.prototype.accelerate = function (time) {
        if (time < 0) {
            return this.currentSpeed;
        }
        var newSpeed = this.newSpeedByEnergyChange(time * this.motorPower);
        this.CurrentSpeed = newSpeed;
        return this.currentSpeed;
    };
    Car.prototype.break = function (time) {
        if (time < 0) {
            return this.currentSpeed;
        }
        var newSpeed = this.newSpeedByEnergyChange(-1 * time * this.breakPower);
        this.CurrentSpeed = newSpeed;
        return this.currentSpeed;
    };
    Car.prototype.move = function (time) {
        return time * this.currentSpeed;
    };
    return Car;
}());
exports.Car = Car;
var CarOnRoad = /** @class */ (function () {
    function CarOnRoad(car, startPosition, movement, lineAlocate) {
        this.car = car;
        this.lineAlocate = lineAlocate;
        this.maxSpeed = 0;
        this.autoPilot = new autoPilot_1.AutoPilotLevel1();
        this.maxLineCount = 0;
        this.type = globalTypes_1.OnRoadObjectList.car;
        this.location = startPosition;
        this.vector = movement;
    }
    Object.defineProperty(CarOnRoad.prototype, "Location", {
        get: function () {
            return this.location;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarOnRoad.prototype, "Vector", {
        get: function () {
            return this.vector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarOnRoad.prototype, "AutoPilot", {
        get: function () {
            return this.autoPilot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarOnRoad.prototype, "MaxLine", {
        get: function () {
            return this.maxLineCount;
        },
        set: function (value) {
            if (value < 0) {
                throw "imposible to set negative max line index";
            }
            this.maxLineCount = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarOnRoad.prototype, "MaxSpeed", {
        get: function () {
            return this.maxSpeed;
        },
        set: function (value) {
            if (value < 0) {
                value = 0;
            }
            this.maxSpeed = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarOnRoad.prototype, "LineAlocate", {
        set: function (value) {
            if (value < 1 || value > this.MaxLine) {
                throw 'line index out of range';
            }
            this.lineAlocate = value;
        },
        enumerable: true,
        configurable: true
    });
    CarOnRoad.prototype.filterOnlyCarOnOtherLine = function (obj, line) {
        return obj.filter(function (item) {
            return item.type !== globalTypes_1.OnRoadObjectList.car || item.lineAlocate === line;
        });
    };
    CarOnRoad.prototype.setMaxSpeed = function (number) {
        this.MaxSpeed = number;
    };
    CarOnRoad.prototype.setMaxLine = function (number) {
        this.MaxLine = number;
    };
    CarOnRoad.prototype.getInfoForAP = function () {
        return {
            location: this.Location,
            type: this.type,
            vector: this.Vector,
            lineAlocate: this.lineAlocate,
        };
    };
    CarOnRoad.prototype.ApCall = function (time, cars) {
        var interval = {
            minSafe: 50,
            minDanger: 20,
        };
        var relatedObject = this.filterOnlyCarOnOtherLine(cars, this.lineAlocate);
        var preferedAction = this.AutoPilot.detectCloseObject(this.Location, relatedObject, interval, this.lineAlocate);
        switch (preferedAction) {
            case globalTypes_1.reactionLevel.acselerate: {
                if (this.car.CurrentSpeed < this.MaxSpeed) {
                    this.car.accelerate(time);
                }
                break;
            }
            case globalTypes_1.reactionLevel.break: {
                this.car.break(time);
                break;
            }
        }
        var reactionOnLight = this.AutoPilot.reactionOnLight(this.Location.x, relatedObject, interval);
        if (reactionOnLight !== globalTypes_1.reactionLevel.break) {
            var isWannaChangeLine = this.AutoPilot.isWannaToChangeLine(this.car, this.maxSpeed, time);
            if (isWannaChangeLine) {
                var preferedLine = this.AutoPilot.detectPosibleSideMove(cars, this.Location, this.lineAlocate, this.MaxLine, interval);
                this.AutoPilot.lineChanged();
                this.LineAlocate = preferedLine;
            }
        }
        var move = this.car.move(time);
        this.Location.x += move * this.Vector.x;
    };
    return CarOnRoad;
}());
exports.CarOnRoad = CarOnRoad;
//# sourceMappingURL=car.js.map