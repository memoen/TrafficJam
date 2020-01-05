import {ObjModelLoaderSingle} from "./textureLoader";
import * as THREE from "three";
import {Vector3} from "three";
import {CameraType, LevelCameraController, LevelCameraControllerFactory, PlaygroundMap} from "./mapRenderControler";

export class LevelController {
    public objLoader = ObjModelLoaderSingle.getInstance();
    public cameraControll: LevelCameraControllerFactory = new LevelCameraControllerFactory();
    public map: PlaygroundMap;
    public scene;
    public camera;

    constructor() {

    }

    buildMap() {
        this.map = new PlaygroundMap(this.scene, this.camera, {x: 500, y: 500, z: 1});
    }

    initView() {
        let canvas: HTMLCanvasElement = document.querySelector('#c');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        let renderer = new THREE.WebGLRenderer({canvas});
        // renderer.shadowMap.enabled = true;
        let scene = new THREE.Scene();
        scene.background = new THREE.Color('#3498db');

        // let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


        let cameraControl: LevelCameraController= this.cameraControll.build(canvas);
        let camera = cameraControl.setCamera(CameraType.free);


        {
            const color = 0xFFFFFF;
            let intensity = .5;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-100, 100, 20);
            light.target.position.set(200, 200, 0);
            scene.add(light);
            scene.add(light.target);
        }


        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 0, 500);
            light.target.position.set(150, 150, 0);
            scene.add(light);
            scene.add(light.target);


        }
        {

            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.PointLight(color, intensity);
            light.castShadow = true;
            light.distance = 500;

            light.position.set(10, 130, 200);
            scene.add(light);


        }


        let animate = function () {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        this.camera = camera;
        this.scene = scene;
    }


    draw() {
        this.map.ground.build({x: 800, y: 800, z: 0});
        for (let i = 0; i < 100; i++) {
            let size = {x: 400, y: 400};
            let x = Math.random() * (size.x - 1);
            let y = 200 + Math.random() * (size.y - 200);

            let tree = this.map.tree.build();
            tree.Position = {x: x, y: y, z: 0};
            tree.render(this.scene);

        }

        this.map.city.buildCity({x: 4, y: 3, z: 0}, {x: 0, y: 80, z: 0});
        this.map.offices.buildCity({x: 7, y: 5, z: 0}, {x: 500, y: 20, z: 0});


        this.map.road.buildRoadSegment({x: 100, y: 100, z: 0}, 400, 6);
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




    }


    tickRenderer() {

        let frameTime = 20;
        setInterval(() => {
            this.map.road.update(frameTime / 1000);
            this.map.road.renderDynamicObject();
        }, frameTime)

        setInterval(() => {
            this.map.road.spawnCar(0);
        }, 100);

    }


}
