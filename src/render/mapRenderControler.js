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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
var city_1 = require("../city");
var elements_1 = require("./elements");
var renderer_1 = require("./renderer");
var CameraType;
(function (CameraType) {
    CameraType[CameraType["free"] = 0] = "free";
    CameraType[CameraType["build"] = 1] = "build";
    CameraType[CameraType["walking"] = 2] = "walking";
})(CameraType = exports.CameraType || (exports.CameraType = {}));
var CityRendererComposer = /** @class */ (function () {
    function CityRendererComposer() {
        this.loader = new THREE.TextureLoader();
        this.standardGameObjectFactory = new renderer_1.onMapObjectModelFactory();
        this.oneHouseFieldSize = 25;
        this.oneFloorHeight = 5;
        this.houseMaterial = new THREE.MeshPhongMaterial({
            map: this.loader.load('/assets/brickhd.jpg'),
        });
        this.windowTexture = new THREE.MeshPhongMaterial({
            map: this.loader.load('/assets/franc2.png'),
        });
    }
    CityRendererComposer.prototype.buildStreetModel = function () {
        var nearHouseGround = new elements_1.ElementThree("#16a085", { x: 0, y: 0, z: 0 }, { x: 25, y: 25, z: 1 });
        var floor = this.buildHouseFloor().decompose().map(function (e) { return e.moveLocation({ x: 7.5, y: 7.5, z: 1 }); });
        var roadLine = new elements_1.ElementThree("#fff", { x: 0, y: 0, z: 1 }, { x: 25, y: .5, z: 0.1 });
        var roadSegment = new elements_1.ElementThree("#7f8c8d", { x: 0, y: 0.5, z: 1 }, { x: 25, y: 2, z: 0.1 });
        var roadSegmentEnd = new elements_1.ElementThree("#7f8c8d", { x: 0, y: 22.5, z: 1 }, { x: 25, y: 2, z: 0.1 });
        var roadSegmentRight = new elements_1.ElementThree("#7f8c8d", { x: 0, y: 2.5, z: 1 }, { x: 2, y: 20, z: 0.1 });
        var roadSegmentLeft = new elements_1.ElementThree("#7f8c8d", { x: 22.5, y: 2.5, z: 1 }, { x: 2, y: 20, z: 0.1 });
        var roadSegmentLeftLine = new elements_1.ElementThree("#fff", { x: 24.5, y: 2.5, z: 1 }, { x: .5, y: 20, z: 0.1 });
        var tree = this.standardGameObjectFactory.buildTree().decompose().map(function (e) { return e.moveLocation({ x: 5, y: 3, z: 1 }); });
        var tree2 = this.standardGameObjectFactory.buildTree().decompose().map(function (e) { return e.moveLocation({
            x: 10,
            y: 3,
            z: 1
        }); });
        var tree3 = this.standardGameObjectFactory.buildTree().decompose().map(function (e) { return e.moveLocation({
            x: 20,
            y: 3,
            z: 1
        }); });
        var carObj = new elements_1.ElementMesh(__spreadArrays(floor, tree, tree2, tree3, [roadSegmentLeftLine, roadSegmentLeft, roadSegmentRight, nearHouseGround, roadSegment, roadLine, roadSegmentEnd]), {
            x: 0,
            y: 0,
            z: 0
        }, {
            x: 0,
            y: 0,
            z: 0
        });
        return carObj;
    };
    CityRendererComposer.prototype.buildToBuildingField = function (numberOfBuiling3d) {
        var houseArr = [];
        for (var i = 0; i < numberOfBuiling3d.y; i++) {
            for (var j = 0; j < numberOfBuiling3d.x; j++) {
                var cellStartCoord = { x: this.oneHouseFieldSize * j, y: this.oneHouseFieldSize * i, z: 0 };
                var house = this.buildStreetModel();
                house.Position = cellStartCoord;
                houseArr.push(house);
            }
        }
        return houseArr;
    };
    CityRendererComposer.prototype.addFloorToConcreteHouse = function (housePosition, floorIndex) {
        // let floorStartPosition = {x: houseIndex.x * this.oneHouseFieldSize, y: houseIndex.y * this.oneHouseFieldSize, z:floorIndex*this.oneFloorHeight+1};
        // console.log(floorStartPosition);
        var x = housePosition.x + 7.5;
        var y = housePosition.y + 7.5;
        var z = housePosition.z + floorIndex * this.oneFloorHeight + 1;
        var floor = this.buildHouseFloor();
        floor.Position = { x: x, y: y, z: z };
        return floor;
    };
    CityRendererComposer.prototype.buildHouseFloor = function () {
        var houseFloor = new elements_1.ElementThree("#f39c12", { x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: this.oneFloorHeight });
        houseFloor.changeMatial(this.houseMaterial);
        var window = new elements_1.ElementThree("#3498db", { x: 2, y: -0.1, z: 1 }, { x: 2, y: 0.1, z: 3 });
        var window2 = new elements_1.ElementThree("#3498db", { x: 6, y: -0.1, z: 1 }, { x: 2, y: 0.1, z: 3 });
        window.changeMatial(this.windowTexture);
        window2.changeMatial(this.windowTexture);
        return new elements_1.ElementMesh([houseFloor, window, window2], { x: 0, y: 0, z: 0 }, {
            x: 0,
            y: 0,
            z: 0
        });
    };
    CityRendererComposer.prototype.buildHouseFloorRange = function (from, to) {
        var floorStack = [];
        for (var i = from; i < to; i++) {
            var floor = this.buildHouseFloor();
            floorStack.push(floor);
        }
        return floorStack;
    };
    return CityRendererComposer;
}());
exports.CityRendererComposer = CityRendererComposer;
var CityRenderer = /** @class */ (function (_super) {
    __extends(CityRenderer, _super);
    function CityRenderer(scene) {
        var _this = _super.call(this) || this;
        _this.scene = scene;
        _this.houseCellArr = [];
        return _this;
    }
    CityRenderer.prototype.newCitizen = function (subj) {
        var _this = this;
        subj.subscribe(function () {
            _this.addPopulation(7);
            _this.addPopulation(7);
            _this.addPopulation(7);
            _this.addPopulation(7);
        });
    };
    /// with mistake , calculate offset
    CityRenderer.prototype.getPositionOfBuildingByIndex = function (index) {
        var y = Math.floor(index / this.citySize.y);
        var x = index / this.citySize.x;
        return { y: y, x: x, z: 0 };
    };
    CityRenderer.prototype.handleBuildingLevelUp = function () {
        var _this = this;
        this.city.subscribe(function (ev) {
            var buildingCell = _this.houseCellArr[ev.index];
            var floor = _this.addFloorToConcreteHouse(buildingCell.Position, ev.level);
            floor.move(_this.basePosition);
            buildingCell.merge(floor);
            buildingCell.render(_this.scene);
        });
    };
    CityRenderer.prototype.buildCity = function (numberOfBuiling3d, position) {
        this.city = new city_1.CityArea(numberOfBuiling3d.x, numberOfBuiling3d.y);
        this.handleBuildingLevelUp();
        this.citySize = numberOfBuiling3d;
        this.basePosition = position;
        var houseCellArr = this.buildToBuildingField(numberOfBuiling3d).map(function (house) { return house.move(position); });
        this.houseCellArr = houseCellArr;
        for (var i = 0; i < houseCellArr.length; i++) {
            houseCellArr[i].render(this.scene);
        }
    };
    CityRenderer.prototype.addPopulation = function (value) {
        this.city.addPopulationToRandomBuilding(value);
    };
    return CityRenderer;
}(CityRendererComposer));
var PlaygroundMap = /** @class */ (function () {
    function PlaygroundMap(scene, camera, size) {
        this.scene = scene;
        this.camera = camera;
        this.size = size;
        this.road = new renderer_1.RoadRendered(scene);
        this.city = new CityRenderer(scene);
        this.offices = new CityRenderer(scene);
        this.tree = new renderer_1.TreeRenderer();
        this.ground = new renderer_1.GroundRenderer(scene);
        this.offices.newCitizen(this.road.onCarOutOfRoad());
    }
    return PlaygroundMap;
}());
exports.PlaygroundMap = PlaygroundMap;
var LevelCameraController = /** @class */ (function () {
    function LevelCameraController(canvas) {
        this.canvas = canvas;
        this.freeBuild = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.freeBuild.position.set(200, 200, 200);
        this.cameraBuild = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraBuild.position.set(150, 150, 200);
    }
    LevelCameraController.prototype.setCamera = function (type) {
        if (type === CameraType.free) {
            var controls = new OrbitControls_1.OrbitControls(this.freeBuild, this.canvas);
            controls.target.set(200, 200, 0);
            controls.update();
            return this.freeBuild;
        }
        else if (type === CameraType.build) {
            var a = 0;
            var controls = new OrbitControls_1.OrbitControls(this.cameraBuild, this.canvas);
            controls.target.set(150, 150, 0);
            controls.enableRotate = false;
            controls.update();
            return this.cameraBuild;
        }
    };
    return LevelCameraController;
}());
exports.LevelCameraController = LevelCameraController;
var LevelCameraControllerFactory = /** @class */ (function () {
    function LevelCameraControllerFactory() {
    }
    LevelCameraControllerFactory.prototype.build = function (canvas) {
        return new LevelCameraController(canvas);
    };
    return LevelCameraControllerFactory;
}());
exports.LevelCameraControllerFactory = LevelCameraControllerFactory;
//# sourceMappingURL=mapRenderControler.js.map
