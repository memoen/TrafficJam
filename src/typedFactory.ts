import {Car, CarModelList} from "./car";
import {TrafficSession, TrafficLight, BlockConstructionOnRoad} from "./onRoadItem";

abstract class OnRoadObjectFactor {
    build() {
    }
}

export class TeslaFactory implements OnRoadObjectFactor {
    build() {
        return new Car(CarModelList.telsaX, 5, 2, 2, 400, 200, 50);
    }
}

export class SlowCarFactory implements OnRoadObjectFactor {
    build() {
        return new Car(CarModelList.fordModelT, 5, 2, 2, 400, 20000, 10);
    }
}

export class TrafficLightFactory implements OnRoadObjectFactor {
    positionIterator: number = 0;

    build() {
        let trafficSession = new TrafficSession(4, 5);
        this.positionIterator++;
        return new TrafficLight({x: this.positionIterator * 100}, trafficSession);
    }

}

export class BlockConstructionOnRoadFactory implements OnRoadObjectFactor {
    positionIterator: number = 1;

    build() {
        let brick = new BlockConstructionOnRoad({x: this.positionIterator * 100}, 1);
        console.log(brick);
        this.positionIterator++;
        return brick;
    }
}

