
import {OnRoadObjectList} from "./globalTypes";
import {BlockConstructionOnRoadFactory, SlowCarFactory, TeslaFactory, TrafficLightFactory} from "./typedFactory";
import {RoadSegment} from "./road";
let factory = new TeslaFactory();
let lanosFact = new SlowCarFactory();
let lightFactory = new TrafficLightFactory();
let brickFactory = new BlockConstructionOnRoadFactory();

let road = new RoadSegment(40, 500,4);

let insertBlockInTemplate = (id, isGood) => {
    let a = document.createElement("div");
    a.id = id;
    if (!isGood) {
        a.className = 'lanos';
    }
    document.getElementById("root").appendChild(a);
};


let renderAllCar = () => {
    let ourObject = road.getCarList();
    for (let i = 0; i < ourObject.length; i++) {
        let car = ourObject[i];
        let el = document.getElementById('a' + i);
        el.style.left = car.Location.x + 'px';
        el.style.top = (car.lineAlocate-1)*50+ 'px';
    }
};


let registerCar = (isGood: boolean,) => {
    let car1;
    if (isGood) {

        car1 = factory.build();
    } else {
        car1 = lanosFact.build();
    }
    let id = road.RegisteredObject.length;
    road.addCar(car1, {x: id * 30}, {x: 1}, 1);
    insertBlockInTemplate('a' + id, isGood);

    renderAllCar();
};

let registerTrafficLight = () => {
    let id = road.getTrafficLightList().length;
    let light = lightFactory.build();
    insertBlockInTemplate('l' + id, true);
    road.addTrafficLight(light);
};


let renderAllTrafficLight = () => {
    let ourObject = road.RegisteredObject.filter(obj => obj.type === OnRoadObjectList.trafficlight);
    for (let i = 0; i < ourObject.length; i++) {
        let light = ourObject[i];

        let el = document.getElementById('l' + i);
        el.style.left = light.Location.x + 'px';

        if (light.getInfoForAP().lightInfo.isAbleToRun) {
            el.style.background = "#0f0";
        } else {
            el.style.background = "#f00";
        }

    }
};

let registerBrick = () => {
    let id = road.getBrickList().length;
    let brick = brickFactory.build();
    insertBlockInTemplate('b' + id, true);
    road.addBrick(brick);
};


let renderBricks = () => {
    let ourObject = road.RegisteredObject.filter(obj => obj.type === OnRoadObjectList.brick);

    for (let i = 0; i < ourObject.length; i++) {
        let brick = ourObject[i];

        let el = document.getElementById('b' + i);
        el.style.left = brick.Location.x + 'px';

    }
};

registerCar(true);
registerCar(true);
registerTrafficLight();
registerTrafficLight();
registerTrafficLight();

registerBrick();

let frameTime =50;
setInterval(() => {
    road.update(frameTime / 1000);
    renderAllCar();
    renderAllTrafficLight();
    renderBricks();
}, frameTime);








