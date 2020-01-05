import {IApilotInfo, ItemLocatedOnRoad, OnRoadObjectList, PositionXAsix} from "./globalTypes";
import {Car, CarOnRoad} from "./car";
import {TrafficLight, BlockConstructionOnRoad} from "./onRoadItem";
import {Subject} from "rxjs";

export class RoadSegment {
    private registeredObject: ItemLocatedOnRoad[] = [];
    private despawnNotify: Subject<ItemLocatedOnRoad[]> = new Subject();

    get RegisteredObject() {
        return this.registeredObject;
    }

    get Length() {
        return this.length;
    }

    get LineCount() {
        return this.lineCount;
    }

    constructor(private maxSpeed: number, private length: number, private lineCount: number) {
        // numeration start from 1
    }

    private transformRoadObjectToApilotCall(): IApilotInfo[] {
        return this.registeredObject.map(object => {
            return object.getInfoForAP();
        })
    }

    private markCarForDespawn(): void {
        let toDespawn = [];
        let toSave = [];
        let registeredObjectList = this.registeredObject;
        let objectList = this.transformRoadObjectToApilotCall();

        for (let i = 0; i < objectList.length; i++) {
            if (objectList[i].type === OnRoadObjectList.car && objectList[i].location.x > this.length) {
                toDespawn.push(registeredObjectList[i]);
            } else {
                toSave.push(registeredObjectList[i])
            }
        }

        if (toDespawn.length) {
            this.registeredObject = toSave;
            this.despawnNotify.next(toDespawn);
        }
    }

    public getBrickList(): ItemLocatedOnRoad[] {
        return this.registeredObject.filter(obj => {
            return obj.type === OnRoadObjectList.brick;
        })
    }

    public isAbleToSpawnCar(interval: number, line: number): boolean {
        let carList = this.getCarList().map(car => car.getInfoForAP()).filter(car => car.lineAlocate === line && car.location.x < interval);
        return carList.length === 0;

    }

    public update(s: number): void {
        let objectList = this.transformRoadObjectToApilotCall();

        for (let i = 0; i < objectList.length; i++) {
            this.registeredObject[i].ApCall(s, objectList);
        }
        this.markCarForDespawn();
    }

    public onDespawn(): Subject<ItemLocatedOnRoad[]> {
        return this.despawnNotify;
    }

    public getTrafficLightList(): ItemLocatedOnRoad[] {
        return this.registeredObject.filter(obj => {
            return obj.type === OnRoadObjectList.trafficlight;
        });
    }

    public getCarList(): ItemLocatedOnRoad[] {
        return this.registeredObject.filter(obj => {
            return obj.type === OnRoadObjectList.car;
        })
    }

    public addCar(car: Car, position: PositionXAsix, move: PositionXAsix, line: number): CarOnRoad {
        if (line < 1 || line > this.lineCount) {
            throw "invalid line value";
        }
        let roadCar = new CarOnRoad(car, position, move, line);
        roadCar.setMaxLine(this.lineCount);
        roadCar.setMaxSpeed(this.maxSpeed);
        this.registeredObject.push(roadCar);
        return roadCar;
    }

    public addTrafficLight(light: TrafficLight): void {
        this.registeredObject.push(light);
    }

    public addBrick(brick: BlockConstructionOnRoad): void {
        this.registeredObject.push(brick);
    }
}
