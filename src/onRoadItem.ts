import {IApilotInfo, ITrafficSession, ItemLocatedOnRoad, OnRoadObjectList, PositionXAsix} from "./globalTypes";

export class SignOnRoad implements ItemLocatedOnRoad {
    type: OnRoadObjectList = OnRoadObjectList.sign;
    lineAlocate: number = 0;
    constructor(public Location: PositionXAsix) {
    }

    public getInfoForAP(): IApilotInfo {
        return {
            location: this.Location,
            type: this.type,
            vector: {x: 0},
            lineAlocate: this.lineAlocate

        }
    }

    public ApCall() {

    }
}


export class BlockConstructionOnRoad implements ItemLocatedOnRoad {
    type: OnRoadObjectList = OnRoadObjectList.brick;
    constructor(public Location: PositionXAsix, public lineAlocate:number) {
    }

    public getInfoForAP(): IApilotInfo {
        return {
            location: this.Location,
            type: this.type,
            vector: {x: 0},
            lineAlocate: this.lineAlocate,

        }
    }

    public ApCall() {

    }
}

export class TrafficSession  implements ITrafficSession{
    isAbleToRun: boolean = false;
    private greenLightTime: number;
    private redLightTime: number;
    timeToChange: number = 0;

    constructor(greenTimer: number, redTimer) {
        this.greenLightTime = greenTimer;
        this.redLightTime = redTimer;
    }

    getState() {
        return {
            isAbleToRun: this.isAbleToRun,
        }
    }

    move(time: number) {

        if (this.timeToChange - time <= 0) {
            time -= this.timeToChange;
            if (this.isAbleToRun) {
                this.timeToChange = this.redLightTime;
            } else {
                this.timeToChange = this.greenLightTime;
            }

            this.isAbleToRun = !this.isAbleToRun;
        }

        this.timeToChange -= time;
    }

}


export class TrafficLight implements ItemLocatedOnRoad {

    type: OnRoadObjectList = OnRoadObjectList.trafficlight;
    vector: PositionXAsix = {x: 0};
    lineAlocate:number = 0;

    constructor(public Location: PositionXAsix, public light: TrafficSession) {

    }

    getInfoForAP(): IApilotInfo {
        return {
            location: this.Location,
            type: this.type,
            vector: this.vector,
            lightInfo: this.light,
            lineAlocate: this.lineAlocate,
        }
    }

    ApCall(timer: number, inVisionObj: IApilotInfo[]) {
        this.light.move(timer);
    }

}

