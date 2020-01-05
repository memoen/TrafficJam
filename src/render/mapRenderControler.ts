import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { Position3D} from '../globalTypes';

import {CityArea} from "../city";
import {Subject} from "rxjs";
import {ElementMesh, ElementThree} from "./elements";
import {GroundRenderer, onMapObjectModelFactory, RoadRendered, TreeRenderer} from "./renderer";


export enum CameraType {
    free,
    build,
    walking,
}


interface ElementCustomOption {
    geometry: THREE.BoxGeometry,
    material: THREE.MeshPhongMaterial,
}

export class CityRendererComposer {
    private loader: THREE.TextureLoader = new THREE.TextureLoader();
    private standardGameObjectFactory = new onMapObjectModelFactory();
    private oneHouseFieldSize = 25;
    private oneFloorHeight = 5;
    private houseMaterial = new THREE.MeshPhongMaterial({
        map: this.loader.load('/assets/brickhd.jpg'),
    });
    private windowTexture = new THREE.MeshPhongMaterial({
        map: this.loader.load('/assets/window.jpg'),
    });

    constructor() {

    }

    private buildStreetModel(): ElementMesh {
        let nearHouseGround = new ElementThree("#16a085", {x: 0, y: 0, z: 0}, {x: 25, y: 25, z: 1});

        let floor = this.buildHouseFloor().decompose().map(e => e.moveLocation({x: 7.5, y: 7.5, z: 1}));


        let roadLine = new ElementThree("#fff", {x: 0, y: 0, z: 1}, {x: 25, y: .5, z: 0.1});
        let roadSegment = new ElementThree("#7f8c8d", {x: 0, y: 0.5, z: 1}, {x: 25, y: 2, z: 0.1});
        let roadSegmentEnd = new ElementThree("#7f8c8d", {x: 0, y: 22.5, z: 1}, {x: 25, y: 2, z: 0.1});
        let roadSegmentRight = new ElementThree("#7f8c8d", {x: 0, y: 2.5, z: 1}, {x: 2, y: 20, z: 0.1});
        let roadSegmentLeft = new ElementThree("#7f8c8d", {x: 22.5, y: 2.5, z: 1}, {x: 2, y: 20, z: 0.1});
        let roadSegmentLeftLine = new ElementThree("#fff", {x: 24.5, y: 2.5, z: 1}, {x: .5, y: 20, z: 0.1});

        let tree = this.standardGameObjectFactory.buildTree().decompose().map(e => e.moveLocation({x: 5, y: 3, z: 1}));
        let tree2 = this.standardGameObjectFactory.buildTree().decompose().map(e => e.moveLocation({
            x: 10,
            y: 3,
            z: 1
        }));
        let tree3 = this.standardGameObjectFactory.buildTree().decompose().map(e => e.moveLocation({
            x: 20,
            y: 3,
            z: 1
        }));


        let carObj = new ElementMesh([...floor, ...tree, ...tree2, ...tree3, roadSegmentLeftLine, roadSegmentLeft, roadSegmentRight, nearHouseGround, roadSegment, roadLine, roadSegmentEnd], {
            x: 0,
            y: 0,
            z: 0
        }, {
            x: 0,
            y: 0,
            z: 0
        });
        return carObj;
    }

    protected buildToBuildingField(numberOfBuiling3d: Position3D) {
        let houseArr: ElementMesh[] = [];
        for (let i = 0; i < numberOfBuiling3d.y; i++) {
            for (let j = 0; j < numberOfBuiling3d.x; j++) {
                let cellStartCoord = {x: this.oneHouseFieldSize * j, y: this.oneHouseFieldSize * i, z: 0};
                let house = this.buildStreetModel();
                house.Position = cellStartCoord;
                houseArr.push(house);
            }
        }
        return houseArr;

    }

    public addFloorToConcreteHouse(housePosition: Position3D, floorIndex: number): ElementMesh {
        // let floorStartPosition = {x: houseIndex.x * this.oneHouseFieldSize, y: houseIndex.y * this.oneHouseFieldSize, z:floorIndex*this.oneFloorHeight+1};
        // console.log(floorStartPosition);
        let x = housePosition.x + 7.5;
        let y = housePosition.y + 7.5;
        let z = housePosition.z + floorIndex * this.oneFloorHeight + 1;

        let floor = this.buildHouseFloor();
        floor.Position = {x: x, y: y, z: z};
        return floor;
    }

    public buildHouseFloor(): ElementMesh {
        let houseFloor = new ElementThree("#f39c12", {x: 0, y: 0, z: 0}, {x: 10, y: 10, z: this.oneFloorHeight});


        houseFloor.changeMatial(this.houseMaterial);


        let window = new ElementThree("#3498db", {x: 2, y: -0.1, z: 1}, {x: 2, y: 0.1, z: 3});
        let window2 = new ElementThree("#3498db", {x: 6, y: -0.1, z: 1}, {x: 2, y: 0.1, z: 3});

        window.changeMatial(this.windowTexture);
        window2.changeMatial(this.windowTexture);

        return new ElementMesh([houseFloor, window, window2], {x: 0, y: 0, z: 0}, {
            x: 0,
            y: 0,
            z: 0
        });

    }

    public buildHouseFloorRange(from: number, to: number): ElementMesh[] {
        let floorStack = [];
        for (let i = from; i < to; i++) {
            let floor = this.buildHouseFloor();
            floorStack.push(floor);
        }
        return floorStack;
    }

}


class CityRenderer extends CityRendererComposer {

    city: CityArea;
    citySize: Position3D;
    houseCellArr: ElementMesh[] = [];
    basePosition: Position3D;

    newCitizen(subj: Subject<number>) {
        subj.subscribe(() => {
            this.addPopulation(7);
            this.addPopulation(7);
            this.addPopulation(7);
            this.addPopulation(7);
        })
    }

    constructor(private scene) {
        super()
    }


    /// with mistake , calculate offset
    private getPositionOfBuildingByIndex(index: number): Position3D {
        let y = Math.floor(index / this.citySize.y);
        let x = index / this.citySize.x;
        return {y: y, x: x, z: 0};
    }

    private handleBuildingLevelUp() {
        this.city.subscribe((ev) => {

            let buildingCell = this.houseCellArr[ev.index];
            let floor = this.addFloorToConcreteHouse(buildingCell.Position, ev.level);
            floor.move(this.basePosition);

            buildingCell.merge(floor);
            buildingCell.render(this.scene);

        })
    }


    public buildCity(numberOfBuiling3d: Position3D, position: Position3D) {
        this.city = new CityArea(numberOfBuiling3d.x, numberOfBuiling3d.y);
        this.handleBuildingLevelUp();
        this.citySize = numberOfBuiling3d;
        this.basePosition = position;
        let houseCellArr = this.buildToBuildingField(numberOfBuiling3d).map(house => house.move(position));
        this.houseCellArr = houseCellArr;
        for (let i = 0; i < houseCellArr.length; i++) {
            houseCellArr[i].render(this.scene);
        }
    }


    addPopulation(value: number) {
        this.city.addPopulationToRandomBuilding(value);
    }


}


export class PlaygroundMap {
    public city: CityRenderer;
    public offices: CityRenderer;
    public tree: TreeRenderer;
    public ground: GroundRenderer;
    public road: RoadRendered;


    constructor(private scene, private camera, private size: Position3D) {
        this.road = new RoadRendered(scene);
        this.city = new CityRenderer(scene);
        this.offices = new CityRenderer(scene);
        this.tree = new TreeRenderer();
        this.ground = new GroundRenderer(scene);

        this.offices.newCitizen(this.road.onCarOutOfRoad());

    }
}


export class LevelCameraController {
    public cameraBuild: THREE.PerspectiveCamera;
    public freeBuild: THREE.PerspectiveCamera;


    constructor(private canvas) {
        this.freeBuild = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.freeBuild.position.set(200, 200, 200);

        this.cameraBuild = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraBuild.position.set(150, 150, 200);
    }

    public setCamera(type: CameraType): THREE.PerspectiveCamera {
        if (type === CameraType.free) {

            let controls = new OrbitControls(this.freeBuild, this.canvas);
            controls.target.set(200, 200, 0);
            controls.update();
            return this.freeBuild;
        } else if (type === CameraType.build) {

            let a = 0;
            let controls = new OrbitControls(this.cameraBuild, this.canvas);
            controls.target.set(150, 150, 0);
            controls.enableRotate = false;
            controls.update();
            return this.cameraBuild;
        }
    }

}

export class LevelCameraControllerFactory {

    build(canvas): LevelCameraController {
        return new LevelCameraController(canvas);
    }
}




