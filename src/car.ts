import {IApilotInfo, ItemLocatedOnRoad, OnRoadObjectList, PositionXAsix, reactionLevel} from "./globalTypes";

import {AutoPilotLevel1} from "./autoPilot";

export enum CarModelList {
    telsaX,
    fordModelT
}


export class Car {
    private currentSpeed: number = 0;

    get MaxSpeed() {
        return this.maxSpeed;
    }

    get CurrentSpeed() {
        return this.currentSpeed;
    }

    set CurrentSpeed(value: number) {
        if (value <= 0) {
            this.currentSpeed = 0;
        } else if (value > this.maxSpeed) {
            this.currentSpeed = this.maxSpeed;
        } else {
            this.currentSpeed = value;
        }
    }

    constructor(private model: CarModelList, private weight: number, private height: number, private depth: number, private breakPower: number, private motorPower: number, private maxSpeed: number) {

    }

    private calculateDeltaSpeed(energy: number) {
        return Math.sqrt(2 * energy / this.weight);
    }

    private newSpeedByEnergyChange(newEnergy: number) {
        let delta = this.calculateDeltaSpeed(Math.abs(newEnergy));

        if (newEnergy > 0) {
            return this.currentSpeed + delta

        }
        return this.currentSpeed - delta;
    }

    public accelerate(time: number): number {
        if (time < 0) {
            return this.currentSpeed;
        }
        let newSpeed = this.newSpeedByEnergyChange(time * this.motorPower);

        this.CurrentSpeed = newSpeed
        return this.currentSpeed;
    }

    public break(time: number) {
        if (time < 0) {
            return this.currentSpeed;
        }

        let newSpeed = this.newSpeedByEnergyChange(-1 * time * this.breakPower);

        this.CurrentSpeed = newSpeed;
        return this.currentSpeed;
    }

    public move(time: number) {
        return time * this.currentSpeed;
    }

}


export class CarOnRoad implements ItemLocatedOnRoad {
    private maxSpeed: number = 0;
    private readonly location: PositionXAsix;
    private readonly vector: PositionXAsix;
    private autoPilot: AutoPilotLevel1 = new AutoPilotLevel1();
    private maxLineCount = 0;
    public readonly type: OnRoadObjectList = OnRoadObjectList.car;

    get Location() {
        return this.location;
    }

    get Vector() {
        return this.vector;
    }

    get AutoPilot() {
        return this.autoPilot;
    }

    get MaxLine() {
        return this.maxLineCount;
    }

    get MaxSpeed() {
        return this.maxSpeed
    }

    set MaxLine(value: number) {
        if (value < 0) {
            throw "imposible to set negative max line index";
        }
        this.maxLineCount = value;
    }

    set MaxSpeed(value: number) {
        if (value < 0) {
            value = 0;
        }
        this.maxSpeed = value;
    }

    set LineAlocate(value: number) {
        if (value < 1 || value > this.MaxLine) {


            throw 'line index out of range';
        }
        this.lineAlocate = value;
    }

    constructor(private car: Car, startPosition: PositionXAsix, movement: PositionXAsix, public lineAlocate: number) {
        this.location = startPosition;
        this.vector = movement;
    }

    private filterOnlyCarOnOtherLine(obj: IApilotInfo[], line: number) {
        return obj.filter(item => {
            return item.type !== OnRoadObjectList.car || item.lineAlocate === line;
        })
    }

    public setMaxSpeed(number) {
        this.MaxSpeed = number;
    }

    public setMaxLine(number) {
        this.MaxLine = number;
    }

    public getInfoForAP(): IApilotInfo {
        return {
            location: this.Location,
            type: this.type,
            vector: this.Vector,
            lineAlocate: this.lineAlocate,

        }
    }

    public ApCall(time: number, cars: IApilotInfo[]) {

        const interval = {
            minSafe: 50,
            minDanger: 20,
        };


        let relatedObject = this.filterOnlyCarOnOtherLine(cars, this.lineAlocate);
        let preferedAction = this.AutoPilot.detectCloseObject(this.Location, relatedObject, interval, this.lineAlocate);

        switch (preferedAction) {
            case reactionLevel.acselerate: {

                if (this.car.CurrentSpeed < this.MaxSpeed) {
                    this.car.accelerate(time);
                }
                break;
            }
            case reactionLevel.break: {

                this.car.break(time);
                break;
            }
        }


        let reactionOnLight = this.AutoPilot.reactionOnLight(this.Location.x, relatedObject, interval);

        if (reactionOnLight !== reactionLevel.break) {

            let isWannaChangeLine = this.AutoPilot.isWannaToChangeLine(this.car, this.maxSpeed, time);

            if (isWannaChangeLine) {
                let preferedLine = this.AutoPilot.detectPosibleSideMove(cars, this.Location, this.lineAlocate, this.MaxLine, interval);
                this.AutoPilot.lineChanged();
                this.LineAlocate = preferedLine;

            }
        }

        let move = this.car.move(time);
        this.Location.x += move * this.Vector.x;

    }


}
