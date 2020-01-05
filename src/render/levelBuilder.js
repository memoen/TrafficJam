"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var textureLoader_1 = require("./textureLoader");
var THREE = require("three");
var three_1 = require("three");
var mapRenderControler_1 = require("../mapRenderControler");
var LevelController = /** @class */ (function () {
    function LevelController() {
        this.objLoader = textureLoader_1.ObjModelLoaderSingle.getInstance();
        this.cameraControll = new mapRenderControler_1.LevelCameraControllerFactory();
    }
    LevelController.prototype.buildMap = function () {
        this.map = new mapRenderControler_1.PlaygroundMap(this.scene, this.camera, { x: 500, y: 500, z: 1 });
    };
    LevelController.prototype.initView = function () {
        var canvas = document.querySelector('#c');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        var renderer = new THREE.WebGLRenderer({ canvas: canvas });
        // renderer.shadowMap.enabled = true;
        var scene = new THREE.Scene();
        scene.background = new THREE.Color('#3498db');
        // let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        var cameraControl = this.cameraControll.build(canvas);
        var camera = cameraControl.setCamera(mapRenderControler_1.CameraType.free);
        {
            var color = 0xFFFFFF;
            var intensity = 1;
            var light = new THREE.SpotLight(color, intensity);
            light.position.set(-100, 100, 100);
            light.target.position.set(200, 200, 0);
            scene.add(light);
            scene.add(light.target);
        }
        {
            var color = 0xFFFFFF;
            var intensity = 1;
            var light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 0, 100);
            light.target.position.set(150, 150, 0);
            scene.add(light);
            scene.add(light.target);
        }
        {
            var color = 0xFFFFFF;
            var intensity = 2;
            var light = new THREE.PointLight(color, intensity);
            light.castShadow = true;
            light.distance = 500;
            light.position.set(10, 130, 200);
            scene.add(light);
        }
        var animate = function () {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        this.camera = camera;
        this.scene = scene;
    };
    LevelController.prototype.draw = function () {
        this.map.ground.build({ x: 800, y: 800, z: 0 });
        for (var i = 0; i < 100; i++) {
            var size = { x: 400, y: 400 };
            var x = Math.random() * (size.x - 1);
            var y = 200 + Math.random() * (size.y - 200);
            var tree = this.map.tree.build();
            tree.Position = { x: x, y: y, z: 0 };
            tree.render(this.scene);
        }
        this.map.city.buildCity({ x: 4, y: 3, z: 0 }, { x: 0, y: 80, z: 0 });
        this.map.offices.buildCity({ x: 7, y: 5, z: 0 }, { x: 500, y: 20, z: 0 });
        this.map.road.buildRoadSegment({ x: 100, y: 100, z: 0 }, 400, 6);
        this.map.road.spawnCar(0);
        this.map.road.spawnTrafficLight(0);
        this.map.road.spawnTrafficLight(0);
        this.map.road.spawnTrafficLight(0);
        this.map.road.renderStaticObject();
        this.map.city.addPopulation(100);
        this.map.city.addPopulation(70);
        this.map.city.addPopulation(70);
        this.map.city.addPopulation(30);
        this.map.city.addPopulation(10);
        this.map.city.addPopulation(10);
        this.map.city.addPopulation(10);
        this.map.city.addPopulation(10);
        this.map.city.addPopulation(30);
        this.map.city.addPopulation(30);
        this.map.city.addPopulation(30);
        this.map.city.addPopulation(70);
        this.map.city.addPopulation(100);
        var car = this.objLoader.getCarModel();
        car.scale.set(.01, .01, .01);
        car.position.set(100, 150, 1);
        car.rotateOnAxis(new three_1.Vector3(1, 0, 0), 1.5);
        this.scene.add(car);
    };
    LevelController.prototype.tickRenderer = function () {
        var _this = this;
        var frameTime = 20;
        setInterval(function () {
            _this.map.road.update(frameTime / 1000);
            _this.map.road.renderDynamicObject();
        }, frameTime);
        setInterval(function () {
            _this.map.road.spawnCar(0);
        }, 100);
    };
    return LevelController;
}());
exports.LevelController = LevelController;
//# sourceMappingURL=levelBuilder.js.map