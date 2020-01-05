import {IApilotInfo, ISafeInterval, OnRoadObjectList, PositionXAsix, reactionLevel} from "./globalTypes";
import {Car} from "./car";

export class AutoPilotLevel1 {

    private basePoliteToChangeLine: number = 100;

    private detectIsAbleToSafeSideMove(myPosition: number, onLineCarPosition: number[], interval: ISafeInterval) {
        for (let i = 0; i < onLineCarPosition.length; i++) {
            let otherCar = onLineCarPosition[i];
            if (myPosition + interval.minSafe > otherCar && otherCar > myPosition) {
                return false;
            }
            if (myPosition - interval.minSafe < otherCar && otherCar < myPosition) {
                return false;
            }
        }
        return true;
    }

    private changePoliteLevel(value: number): number {
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
    }

    private findTypedObjectOnMyLine(objectType: OnRoadObjectList, objectList: IApilotInfo[], line: number) {
        return objectList.filter(obj => {
            return obj.type === objectType && obj.lineAlocate === line;
        })
    }

    private findTypeObj(objectType: OnRoadObjectList, objList: IApilotInfo[]) {
        return objList.filter(obj => {
            return obj.type === objectType;
        })
    }

    private findAllObjectOnMyLine(objectList: IApilotInfo[], line: number) {
        return objectList.filter(obj => {
            return obj.lineAlocate === line;
        })
    }

    private reactionOnCar(myPosition: number, nearestObject: IApilotInfo[], safeInterval: ISafeInterval) {
        let nearestCarMap = nearestObject.filter(obj => obj.type === OnRoadObjectList.car).map(car => {
            return car.location.x;
        });
        let myIndex = nearestCarMap.indexOf(myPosition);
        let nearestCarRight = nearestCarMap[myIndex + 1];


        if (!nearestCarRight) {
            return reactionLevel.acselerate;
        }

        if (myPosition + safeInterval.minDanger > nearestCarRight && myPosition < nearestCarRight) {
            return reactionLevel.break;
        }

        if (myPosition + safeInterval.minSafe > nearestCarRight && myPosition < nearestCarRight) {
            return reactionLevel.move
        }
        return reactionLevel.acselerate;

    }

    private reactionOnBrick(myPosition: number, nearestObject: IApilotInfo[], safeInterval: ISafeInterval) {
        let nearestBrickLocationList = nearestObject.filter(e => e.type === OnRoadObjectList.brick).map(e => e.location.x);
        let indexOnNearestBrick = this.findIndexIndexOfNearestObjFromPositionArr(myPosition, nearestBrickLocationList);
        let nearestBrick = nearestBrickLocationList[indexOnNearestBrick];
        if (myPosition + safeInterval.minDanger > nearestBrick && myPosition < nearestBrick) {
            return reactionLevel.break;
        }
        return reactionLevel.move;
    }

    public detectCloseObject(point: PositionXAsix, nearestObject: IApilotInfo[], safeInterval: ISafeInterval, myLine: number): reactionLevel {


        let nearestSorted = nearestObject.sort((a, b) => {
            return a.location.x - b.location.x;
        });

        let myPosition = point.x;
        let brickOnlyOnMyLine = nearestSorted.filter(brick => brick.lineAlocate === myLine && brick.type === OnRoadObjectList.brick);
        let brickReaction = this.reactionOnBrick(myPosition, brickOnlyOnMyLine, safeInterval);
        if (brickReaction !== reactionLevel.move) {
            return brickReaction;
        }

        let lightReaction = this.reactionOnLight(myPosition, nearestObject, safeInterval);
        if (lightReaction !== reactionLevel.move) {
            return lightReaction;
        }
        let carReaction = this.reactionOnCar(myPosition, nearestSorted, safeInterval);

        if (carReaction !== reactionLevel.move) {
            return carReaction;
        }

        return reactionLevel.acselerate
    }

    public isWannaToChangeLine(car: Car, roadMaxSpeed: number, timer: number): boolean {
        let currentSpeed = car.CurrentSpeed;
        let maxSpeed = car.MaxSpeed;
        if (currentSpeed < roadMaxSpeed / 2) {
            this.changePoliteLevel(-30 * timer);
        } else {
            this.changePoliteLevel(5 * timer);
        }

        if (this.basePoliteToChangeLine < 20) {
            return true;
        }
        return false;

    }

    public reactionOnLight(myPosition: number, nearestObject: IApilotInfo[], safeInterval: ISafeInterval) {
        let nearestTrafficLightArr = nearestObject.filter(obj => obj.type === OnRoadObjectList.trafficlight);

        if (nearestTrafficLightArr.length === 0) {
            return reactionLevel.move;
        }
        let nearestTrafficLightArrPosition = nearestTrafficLightArr.map(light => light.location.x);
        let nearestTrafficLightIndex: number = this.findIndexIndexOfNearestObjFromPositionArr(myPosition, nearestTrafficLightArrPosition);
        let nearestTrafficLight = nearestTrafficLightArr[nearestTrafficLightIndex];
        let nearestTrafficLightPosition: number = nearestTrafficLight.location.x;


        if (myPosition + safeInterval.minDanger > nearestTrafficLightPosition && myPosition < nearestTrafficLightPosition) {

            if (!nearestTrafficLight.lightInfo.isAbleToRun) {
                return reactionLevel.break;
            }
        }
        return reactionLevel.move;
    }

    public lineChanged() {
        this.basePoliteToChangeLine = 100;
    }

    public findIndexIndexOfNearestObjFromPositionArr(position: number, positionArr: number[]): number {
        for (let i = 0; i < positionArr.length; i++) {
            if (position < positionArr[i]) {
                return i;
            }
        }
        return positionArr.length - 1;
    }

    public detectPosibleSideMove(nearestObject: IApilotInfo[], myPosition: PositionXAsix,
                                 currentLine: number, maxLine: number, interval: ISafeInterval): number {
        let nearestCar = this.findTypeObj(OnRoadObjectList.car, nearestObject);

        let lineLeftIndex = -1;
        let lineRightIndex = -1;


        if (currentLine > 1) {
            lineLeftIndex = currentLine - 1;
            let objectOnLeftPositionList = this.findAllObjectOnMyLine(nearestCar, lineLeftIndex).map(car => car.location.x);
            let isAble = this.detectIsAbleToSafeSideMove(myPosition.x, objectOnLeftPositionList, interval);
            if (isAble) {
                return lineLeftIndex;
            }
        }
        if (currentLine + 1 <= maxLine) {
            lineRightIndex = currentLine + 1;
            let objectOnLeftPositionList = this.findAllObjectOnMyLine(nearestCar, lineRightIndex).map(car => car.location.x);
            let isAble = this.detectIsAbleToSafeSideMove(myPosition.x, objectOnLeftPositionList, interval);
            if (isAble) {
                return lineRightIndex;
            }
        }

        return currentLine;
    }
}
