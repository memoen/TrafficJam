"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalTypes_1 = require("./globalTypes");
var AutoPilotLevel1 = /** @class */ (function () {
    function AutoPilotLevel1() {
        this.basePoliteToChangeLine = 100;
    }
    AutoPilotLevel1.prototype.detectIsAbleToSafeSideMove = function (myPosition, onLineCarPosition, interval) {
        for (var i = 0; i < onLineCarPosition.length; i++) {
            var otherCar = onLineCarPosition[i];
            if (myPosition + interval.minSafe > otherCar && otherCar > myPosition) {
                return false;
            }
            if (myPosition - interval.minSafe < otherCar && otherCar < myPosition) {
                return false;
            }
        }
        return true;
    };
    AutoPilotLevel1.prototype.changePoliteLevel = function (value) {
        if (this.basePoliteToChangeLine + value < 0) {
            this.basePoliteToChangeLine = 0;
            value = 0;
        }
        if (this.basePoliteToChangeLine + value > 100) {
            this.basePoliteToChangeLine = 100;
            value = 0;
        }
        this.basePoliteToChangeLine += value;
        return this.basePoliteToChangeLine;
    };
    AutoPilotLevel1.prototype.findTypedObjectOnMyLine = function (objectType, objectList, line) {
        return objectList.filter(function (obj) {
            return obj.type === objectType && obj.lineAlocate === line;
        });
    };
    AutoPilotLevel1.prototype.findTypeObj = function (objectType, objList) {
        return objList.filter(function (obj) {
            return obj.type === objectType;
        });
    };
    AutoPilotLevel1.prototype.findAllObjectOnMyLine = function (objectList, line) {
        return objectList.filter(function (obj) {
            return obj.lineAlocate === line;
        });
    };
    AutoPilotLevel1.prototype.reactionOnCar = function (myPosition, nearestObject, safeInterval) {
        var nearestCarMap = nearestObject.filter(function (obj) { return obj.type === globalTypes_1.OnRoadObjectList.car; }).map(function (car) {
            return car.location.x;
        });
        var myIndex = nearestCarMap.indexOf(myPosition);
        var nearestCarRight = nearestCarMap[myIndex + 1];
        if (!nearestCarRight) {
            return globalTypes_1.reactionLevel.acselerate;
        }
        if (myPosition + safeInterval.minDanger > nearestCarRight && myPosition < nearestCarRight) {
            return globalTypes_1.reactionLevel.break;
        }
        if (myPosition + safeInterval.minSafe > nearestCarRight && myPosition < nearestCarRight) {
            return globalTypes_1.reactionLevel.move;
        }
        return globalTypes_1.reactionLevel.acselerate;
    };
    AutoPilotLevel1.prototype.reactionOnBrick = function (myPosition, nearestObject, safeInterval) {
        var nearestBrickLocationList = nearestObject.filter(function (e) { return e.type === globalTypes_1.OnRoadObjectList.brick; }).map(function (e) { return e.location.x; });
        var indexOnNearestBrick = this.findIndexIndexOfNearestObjFromPositionArr(myPosition, nearestBrickLocationList);
        var nearestBrick = nearestBrickLocationList[indexOnNearestBrick];
        if (myPosition + safeInterval.minDanger > nearestBrick && myPosition < nearestBrick) {
            return globalTypes_1.reactionLevel.break;
        }
        return globalTypes_1.reactionLevel.move;
    };
    AutoPilotLevel1.prototype.detectCloseObject = function (point, nearestObject, safeInterval, myLine) {
        var nearestSorted = nearestObject.sort(function (a, b) {
            return a.location.x - b.location.x;
        });
        var myPosition = point.x;
        var brickOnlyOnMyLine = nearestSorted.filter(function (brick) { return brick.lineAlocate === myLine && brick.type === globalTypes_1.OnRoadObjectList.brick; });
        var brickReaction = this.reactionOnBrick(myPosition, brickOnlyOnMyLine, safeInterval);
        if (brickReaction !== globalTypes_1.reactionLevel.move) {
            return brickReaction;
        }
        var lightReaction = this.reactionOnLight(myPosition, nearestObject, safeInterval);
        if (lightReaction !== globalTypes_1.reactionLevel.move) {
            return lightReaction;
        }
        var carReaction = this.reactionOnCar(myPosition, nearestSorted, safeInterval);
        if (carReaction !== globalTypes_1.reactionLevel.move) {
            return carReaction;
        }
        return globalTypes_1.reactionLevel.acselerate;
    };
    AutoPilotLevel1.prototype.isWannaToChangeLine = function (car, roadMaxSpeed, timer) {
        var currentSpeed = car.CurrentSpeed;
        var maxSpeed = car.MaxSpeed;
        if (currentSpeed < roadMaxSpeed / 2) {
            this.changePoliteLevel(-30 * timer);
        }
        else {
            this.changePoliteLevel(5 * timer);
        }
        if (this.basePoliteToChangeLine < 20) {
            return true;
        }
        return false;
    };
    AutoPilotLevel1.prototype.reactionOnLight = function (myPosition, nearestObject, safeInterval) {
        var nearestTrafficLightArr = nearestObject.filter(function (obj) { return obj.type === globalTypes_1.OnRoadObjectList.trafficlight; });
        if (nearestTrafficLightArr.length === 0) {
            return globalTypes_1.reactionLevel.move;
        }
        var nearestTrafficLightArrPosition = nearestTrafficLightArr.map(function (light) { return light.location.x; });
        var nearestTrafficLightIndex = this.findIndexIndexOfNearestObjFromPositionArr(myPosition, nearestTrafficLightArrPosition);
        var nearestTrafficLight = nearestTrafficLightArr[nearestTrafficLightIndex];
        var nearestTrafficLightPosition = nearestTrafficLight.location.x;
        if (myPosition + safeInterval.minDanger > nearestTrafficLightPosition && myPosition < nearestTrafficLightPosition) {
            if (!nearestTrafficLight.lightInfo.isAbleToRun) {
                return globalTypes_1.reactionLevel.break;
            }
        }
        return globalTypes_1.reactionLevel.move;
    };
    AutoPilotLevel1.prototype.lineChanged = function () {
        this.basePoliteToChangeLine = 100;
    };
    AutoPilotLevel1.prototype.findIndexIndexOfNearestObjFromPositionArr = function (position, positionArr) {
        for (var i = 0; i < positionArr.length; i++) {
            if (position < positionArr[i]) {
                return i;
            }
        }
        return positionArr.length - 1;
    };
    AutoPilotLevel1.prototype.detectPosibleSideMove = function (nearestObject, myPosition, currentLine, maxLine, interval) {
        var nearestCar = this.findTypeObj(globalTypes_1.OnRoadObjectList.car, nearestObject);
        var lineLeftIndex = -1;
        var lineRightIndex = -1;
        if (currentLine > 1) {
            lineLeftIndex = currentLine - 1;
            var objectOnLeftPositionList = this.findAllObjectOnMyLine(nearestCar, lineLeftIndex).map(function (car) { return car.location.x; });
            var isAble = this.detectIsAbleToSafeSideMove(myPosition.x, objectOnLeftPositionList, interval);
            if (isAble) {
                return lineLeftIndex;
            }
        }
        if (currentLine + 1 <= maxLine) {
            lineRightIndex = currentLine + 1;
            var objectOnLeftPositionList = this.findAllObjectOnMyLine(nearestCar, lineRightIndex).map(function (car) { return car.location.x; });
            var isAble = this.detectIsAbleToSafeSideMove(myPosition.x, objectOnLeftPositionList, interval);
            if (isAble) {
                return lineRightIndex;
            }
        }
        return currentLine;
    };
    return AutoPilotLevel1;
}());
exports.AutoPilotLevel1 = AutoPilotLevel1;
//# sourceMappingURL=autoPilot.js.map