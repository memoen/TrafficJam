"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalTypes_1 = require("./globalTypes");
var typedFactory_1 = require("./typedFactory");
var road_1 = require("./road");
var factory = new typedFactory_1.TeslaFactory();
var lanosFact = new typedFactory_1.SlowCarFactory();
var lightFactory = new typedFactory_1.TrafficLightFactory();
var brickFactory = new typedFactory_1.BlockConstructionOnRoadFactory();
var road = new road_1.RoadSegment(40, 500, 4);
var insertBlockInTemplate = function (id, isGood) {
    var a = document.createElement("div");
    a.id = id;
    if (!isGood) {
        a.className = 'lanos';
    }
    document.getElementById("root").appendChild(a);
};
var renderAllCar = function () {
    var ourObject = road.getCarList();
    for (var i = 0; i < ourObject.length; i++) {
        var car = ourObject[i];
        var el = document.getElementById('a' + i);
        el.style.left = car.Location.x + 'px';
        el.style.top = (car.lineAlocate - 1) * 50 + 'px';
    }
};
var registerCar = function (isGood) {
    var car1;
    if (isGood) {
        car1 = factory.build();
    }
    else {
        car1 = lanosFact.build();
    }
    var id = road.RegisteredObject.length;
    road.addCar(car1, { x: id * 30 }, { x: 1 }, 1);
    insertBlockInTemplate('a' + id, isGood);
    renderAllCar();
};
var registerTrafficLight = function () {
    var id = road.getTrafficLightList().length;
    var light = lightFactory.build();
    insertBlockInTemplate('l' + id, true);
    road.addTrafficLight(light);
};
var renderAllTrafficLight = function () {
    var ourObject = road.RegisteredObject.filter(function (obj) { return obj.type === globalTypes_1.OnRoadObjectList.trafficlight; });
    for (var i = 0; i < ourObject.length; i++) {
        var light = ourObject[i];
        var el = document.getElementById('l' + i);
        el.style.left = light.Location.x + 'px';
        if (light.getInfoForAP().lightInfo.isAbleToRun) {
            el.style.background = "#0f0";
        }
        else {
            el.style.background = "#f00";
        }
    }
};
var registerBrick = function () {
    var id = road.getBrickList().length;
    var brick = brickFactory.build();
    insertBlockInTemplate('b' + id, true);
    road.addBrick(brick);
};
var renderBricks = function () {
    var ourObject = road.RegisteredObject.filter(function (obj) { return obj.type === globalTypes_1.OnRoadObjectList.brick; });
    for (var i = 0; i < ourObject.length; i++) {
        var brick = ourObject[i];
        var el = document.getElementById('b' + i);
        el.style.left = brick.Location.x + 'px';
    }
};
registerCar(true);
registerCar(true);
registerTrafficLight();
registerTrafficLight();
registerTrafficLight();
registerBrick();
var frameTime = 50;
setInterval(function () {
    road.update(frameTime / 1000);
    renderAllCar();
    renderAllTrafficLight();
    renderBricks();
}, frameTime);
//# sourceMappingURL=render.js.map