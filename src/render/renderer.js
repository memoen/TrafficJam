"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var elements_1 = require("./elements");
var rxjs_1 = require("rxjs");
var road_1 = require("../road");
var THREE = require("three");
var typedFactory_1 = require("../typedFactory");
var ItemLocatedOnRoadRenderer = /** @class */ (function () {
    function ItemLocatedOnRoadRenderer(physicalCar, virtualCar, parentPosition) {
        this.physicalCar = physicalCar;
        this.virtualCar = virtualCar;
        this.parentPosition = parentPosition;
        this.isDrawn = false;
    }
    ItemLocatedOnRoadRenderer.prototype.firstInit = function (scene) {
        this.physicalCar.render(scene);
        this.isDrawn = true;
    };
    ItemLocatedOnRoadRenderer.prototype.reDraw = function () {
        this.physicalCar.setPositionWithRender(this.physicalCar.Position);
    };
    ItemLocatedOnRoadRenderer.prototype.updatePosition = function () {
        var currentVirt = this.virtualCar.Location;
        var parrent = this.parentPosition;
        var lineHight = 5;
        var newPosition = {
            x: parrent.x + currentVirt.x,
            y: parrent.y + 2 + (this.virtualCar.lineAlocate - 1) * lineHight,
            z: parrent.z + 1
        };
        this.physicalCar.Position = newPosition;
    };
    ItemLocatedOnRoadRenderer.prototype.destroy = function (scene) {
        this.physicalCar.ElementList.forEach(function (element) {
            var object = scene.getObjectByProperty('uuid', element.Element.uuid);
            object.geometry.dispose();
            object.material.dispose();
            scene.remove(object);
        });
        scene.remove(this.physicalCar);
    };
    ItemLocatedOnRoadRenderer.prototype.render = function (scene) {
        this.updatePosition();
        if (!this.isDrawn) {
            return this.firstInit(scene);
        }
        this.reDraw();
    };
    return ItemLocatedOnRoadRenderer;
}());
var GroundRenderer = /** @class */ (function () {
    function GroundRenderer(scene) {
        this.scene = scene;
        this.loader = new THREE.TextureLoader();
    }
    GroundRenderer.prototype.build = function (size) {
        var atomarGround = new elements_1.ElementThree("#16a085", { x: 0, y: 0, z: -0.1 }, { x: size.x, y: size.y, z: 0.1 });
        var texture = this.loader.load('/assets/grasshd.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        var groundMaterial = new THREE.MeshPhongMaterial({
            map: texture,
        });
        atomarGround.changeMatial(groundMaterial);
        console.log(groundMaterial);
        var ground = new elements_1.ElementMesh([atomarGround], { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        ground.render(this.scene);
    };
    return GroundRenderer;
}());
exports.GroundRenderer = GroundRenderer;
var CarRenderer = /** @class */ (function (_super) {
    __extends(CarRenderer, _super);
    function CarRenderer(physicalCar, virtualCar, parentPosition) {
        var _this = _super.call(this, physicalCar, virtualCar, parentPosition) || this;
        _this.physicalCar = physicalCar;
        _this.virtualCar = virtualCar;
        _this.parentPosition = parentPosition;
        return _this;
    }
    return CarRenderer;
}(ItemLocatedOnRoadRenderer));
exports.CarRenderer = CarRenderer;
var BrickRenderer = /** @class */ (function (_super) {
    __extends(BrickRenderer, _super);
    function BrickRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BrickRenderer;
}(ItemLocatedOnRoadRenderer));
exports.BrickRenderer = BrickRenderer;
var RoadSegmentRenderer = /** @class */ (function (_super) {
    __extends(RoadSegmentRenderer, _super);
    function RoadSegmentRenderer(maxSpeed, length, line, position) {
        var _this = _super.call(this, maxSpeed, length, line) || this;
        _this.position = position;
        return _this;
    }
    return RoadSegmentRenderer;
}(road_1.RoadSegment));
exports.RoadSegmentRenderer = RoadSegmentRenderer;
var TrafficLightRenderer = /** @class */ (function (_super) {
    __extends(TrafficLightRenderer, _super);
    function TrafficLightRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrafficLightRenderer.prototype.update = function () {
        var lightState = this.virtualCar.getInfoForAP();
        var elementOfLight = this.physicalCar.ElementList;
        if (lightState.lightInfo.isAbleToRun) {
            elementOfLight[1].Color = "#27ae60";
        }
        else {
            elementOfLight[1].Color = "#e74c3c";
        }
    };
    return TrafficLightRenderer;
}(ItemLocatedOnRoadRenderer));
exports.TrafficLightRenderer = TrafficLightRenderer;
var TreeRenderer = /** @class */ (function () {
    function TreeRenderer() {
        this.objectFactory = new onMapObjectModelFactory();
    }
    TreeRenderer.prototype.build = function () {
        return this.objectFactory.buildTree();
    };
    return TreeRenderer;
}());
exports.TreeRenderer = TreeRenderer;
var RoadRendered = /** @class */ (function () {
    function RoadRendered(scene) {
        this.scene = scene;
        this.loader = new THREE.TextureLoader();
        this.teslaFactory = new typedFactory_1.TeslaFactory();
        this.lanosFact = new typedFactory_1.SlowCarFactory();
        this.lightFactory = new typedFactory_1.TrafficLightFactory();
        this.objectFacotry = new onMapObjectModelFactory();
        this.brickFactory = new typedFactory_1.BlockConstructionOnRoadFactory();
        this.outOfRoadNotify = new rxjs_1.Subject();
        this.cityRoadMaxSpeed = 20;
        this.roadList = [];
        this.carListToCheck = [];
        this.brickListToCheck = [];
        this.trafficLightToCheck = [];
    }
    RoadRendered.prototype.renderRoadSegment = function (road) {
        var road3d = this.objectFacotry.buildRoadSegment(road.LineCount, road.Length);
        road3d.Position = road.position;
        road3d.render(this.scene);
    };
    RoadRendered.prototype.renderBrick = function (brick) {
        brick.render(this.scene);
    };
    RoadRendered.prototype.buildRoadSegment = function (position, length, line) {
        var _this = this;
        var road = new RoadSegmentRenderer(this.cityRoadMaxSpeed, length, line, position);
        road.onDespawn().subscribe(function (cars) {
            for (var i = 0; i < cars.length; i++) {
                var car = cars[i];
                _this.outOfRoadNotify.next(1);
                var _loop_1 = function (j) {
                    var carRend = _this.carListToCheck[j];
                    if (carRend.virtualCar === car) {
                        carRend.destroy(_this.scene);
                        _this.carListToCheck = _this.carListToCheck.filter(function (carR) { return carR !== carRend; });
                    }
                };
                for (var j = 0; j < _this.carListToCheck.length; j++) {
                    _loop_1(j);
                }
            }
        });
        this.roadList.push(road);
        return road;
    };
    RoadRendered.prototype.onCarOutOfRoad = function () {
        return this.outOfRoadNotify;
    };
    RoadRendered.prototype.spawnBrick = function (roadSegmentIndex) {
        var segment = this.roadList[roadSegmentIndex];
        var brick = this.brickFactory.build();
        segment.addBrick(brick);
        var brick3D = this.objectFacotry.buildBrickModel();
        var brickIndexer = new BrickRenderer(brick3D, brick, segment.position);
        this.brickListToCheck.push(brickIndexer);
    };
    RoadRendered.prototype.spawnCar = function (roadSegmentIndex) {
        var segment = this.roadList[roadSegmentIndex];
        var maxLine = segment.LineCount;
        var currentLine = Math.ceil(Math.random() * maxLine);
        var carPhys = this.objectFacotry.buildCarModel();
        var car;
        if (Math.random() * 5 > 2) {
            car = this.teslaFactory.build();
        }
        else {
            car = this.lanosFact.build();
            carPhys.ElementList.forEach(function (el) {
                el.Color = "#34495e";
            });
        }
        if (segment.isAbleToSpawnCar(50, currentLine)) {
            var carVirt = segment.addCar(car, { x: 0 }, { x: 1 }, currentLine);
            var a = new CarRenderer(carPhys, carVirt, segment.position);
            this.carListToCheck.push(a);
            return true;
        }
        return false;
    };
    RoadRendered.prototype.spawnTrafficLight = function (roadSegmentIndex) {
        var segment = this.roadList[roadSegmentIndex];
        var light = this.lightFactory.build();
        var lightPhys = this.objectFacotry.buildTrafficLight();
        segment.addTrafficLight(light);
        var a = new TrafficLightRenderer(lightPhys, light, segment.position);
        this.trafficLightToCheck.push(a);
    };
    RoadRendered.prototype.renderStaticObject = function () {
        for (var i = 0; i < this.roadList.length; i++) {
            var segmentRoad = this.roadList[i];
            this.renderRoadSegment(segmentRoad);
        }
        for (var i = 0; i < this.brickListToCheck.length; i++) {
            var brick = this.brickListToCheck[i];
            this.renderBrick(brick);
        }
    };
    RoadRendered.prototype.renderDynamicObject = function () {
        for (var i = 0; i < this.carListToCheck.length; i++) {
            var car = this.carListToCheck[i];
            car.render(this.scene);
        }
        for (var i = 0; i < this.trafficLightToCheck.length; i++) {
            var light = this.trafficLightToCheck[i];
            light.update();
            light.render(this.scene);
        }
    };
    RoadRendered.prototype.update = function (timer) {
        for (var i = 0; i < this.roadList.length; i++) {
            var segmentRoad = this.roadList[i];
            segmentRoad.update(timer);
        }
    };
    return RoadRendered;
}());
exports.RoadRendered = RoadRendered;
var TextureCreator = /** @class */ (function () {
    function TextureCreator() {
        this.loader = new THREE.TextureLoader();
    }
    return TextureCreator;
}());
var BrickCreator = /** @class */ (function (_super) {
    __extends(BrickCreator, _super);
    function BrickCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BrickCreator.prototype.build = function () {
        var brick = new elements_1.ElementThree("#ff3e52", { x: 0, y: 0, z: 0 }, { x: 1, y: 3, z: 3 });
        var brickObj = new elements_1.ElementMesh([brick], { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        return brickObj;
    };
    return BrickCreator;
}(TextureCreator));
var CarCreator = /** @class */ (function (_super) {
    __extends(CarCreator, _super);
    function CarCreator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.carMaterial = new THREE.MeshPhongMaterial({
            map: _this.loader.load('/assets/carW.jpg'),
        });
        return _this;
    }
    CarCreator.prototype.build = function () {
        var car = new elements_1.ElementThree("#f1c40f", { x: 0, y: 0, z: 0 }, { x: 5, y: 2, z: 2 });
        var carTop = new elements_1.ElementThree("#f1c40f", { x: 0, y: 0, z: 1 }, { x: 3, y: 2, z: 2 });
        car.changeMatial(this.carMaterial);
        carTop.changeMatial(this.carMaterial);
        var carObj = new elements_1.ElementMesh([car, carTop], { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        return carObj;
    };
    return CarCreator;
}(TextureCreator));
var RoadSegmentCreator = /** @class */ (function (_super) {
    __extends(RoadSegmentCreator, _super);
    function RoadSegmentCreator() {
        var _this = _super.call(this) || this;
        _this.loadRoadTexture();
        return _this;
    }
    RoadSegmentCreator.prototype.loadRoadTexture = function () {
        var texture = this.loader.load('/assets/road.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 1);
        this.roadMaterial = new THREE.MeshPhongMaterial({
            map: texture,
        });
    };
    RoadSegmentCreator.prototype.build = function (lineCount, length) {
        var lineList = [];
        var lineHeight = 5;
        for (var i = 0; i < lineCount; i++) {
            var newLineOffset = i * lineHeight;
            var leftWhite = new elements_1.ElementThree("#fff", { x: 0, y: newLineOffset, z: 0 }, {
                x: length,
                y: 0.1,
                z: 1
            });
            var line = new elements_1.ElementThree("#888", { x: 0, y: newLineOffset + 0.1, z: 0 }, {
                x: length,
                y: 4.8,
                z: 1
            });
            line.changeMatial(this.roadMaterial);
            var rightWhite = new elements_1.ElementThree("#fff", { x: 0, y: newLineOffset + 4.9, z: 0 }, {
                x: length,
                y: 0.1,
                z: 1
            });
            lineList.push(leftWhite);
            lineList.push(line);
            lineList.push(rightWhite);
        }
        var road3d = new elements_1.ElementMesh(lineList, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        return road3d;
    };
    return RoadSegmentCreator;
}(TextureCreator));
var TrafficLightCreator = /** @class */ (function (_super) {
    __extends(TrafficLightCreator, _super);
    function TrafficLightCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrafficLightCreator.prototype.build = function () {
        var lightLeg = new elements_1.ElementThree("#bdc3c7", { x: 0.25, y: 0.25, z: 0 }, { x: .5, y: .5, z: 4 });
        var lightTop = new elements_1.ElementThree("#e74c3c", { x: 0, y: 0, z: 3 }, { x: 1, y: 1, z: 1 });
        var light = new elements_1.ElementMesh([lightLeg, lightTop], { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 });
        return light;
    };
    return TrafficLightCreator;
}(TextureCreator));
var TreeCreator = /** @class */ (function (_super) {
    __extends(TreeCreator, _super);
    function TreeCreator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.treeTexture = new THREE.MeshPhongMaterial({
            map: _this.loader.load('/assets/leafs.jpg'),
        });
        _this.treeRootMaterial = new THREE.MeshPhongMaterial({
            map: _this.loader.load('/assets/tree.png'),
        });
        return _this;
    }
    TreeCreator.prototype.build = function () {
        var colorArr = ["#2ecc71", "#40407a", '#218c74', '#e74c3c'];
        var treeRootColor = "#cd6133";
        var treeColor = colorArr[Math.floor(Math.random() * colorArr.length)];
        var treePart = new elements_1.ElementThree(treeColor, { x: 0, y: 0, z: 5 }, { x: 3, y: 3, z: 3 });
        treePart.changeMatial(this.treeTexture);
        var treeRoot = new elements_1.ElementThree(treeRootColor, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 5 });
        treeRoot.changeMatial(this.treeRootMaterial);
        var tree = new elements_1.ElementMesh([treePart, treeRoot], { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        return tree;
    };
    return TreeCreator;
}(TextureCreator));
var onMapObjectModelFactory = /** @class */ (function () {
    function onMapObjectModelFactory() {
        this.brickObj = new BrickCreator();
        this.roadObj = new RoadSegmentCreator();
        this.carObj = new CarCreator();
        this.lightObj = new TrafficLightCreator();
        this.treeObj = new TreeCreator();
    }
    onMapObjectModelFactory.prototype.buildBrickModel = function () {
        return this.brickObj.build();
    };
    onMapObjectModelFactory.prototype.buildCarModel = function () {
        return this.carObj.build();
    };
    onMapObjectModelFactory.prototype.buildRoadSegment = function (lineCount, length) {
        return this.roadObj.build(lineCount, length);
    };
    onMapObjectModelFactory.prototype.buildTrafficLight = function () {
        return this.lightObj.build();
    };
    onMapObjectModelFactory.prototype.buildTree = function () {
        return this.treeObj.build();
    };
    return onMapObjectModelFactory;
}());
exports.onMapObjectModelFactory = onMapObjectModelFactory;
//# sourceMappingURL=renderer.js.map