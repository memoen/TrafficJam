import {ElementMesh, ElementThree} from "./elements";
import {Subject} from "rxjs";
import {ItemLocatedOnRoad, Position3D, PositionXAsix} from "../globalTypes";
import {RoadSegment} from "../road";
import * as THREE from "three";
import {ObjModelLoaderSingle} from "./textureLoader";
import {BlockConstructionOnRoadFactory, SlowCarFactory, TeslaFactory, TrafficLightFactory} from "../typedFactory";
import {CarOnRoad} from "../car";


abstract class ItemLocatedOnRoadRenderer {

    private isDrawn = false;

    constructor(public physicalCar: ElementMesh, public virtualCar: ItemLocatedOnRoad, protected  parentPosition: Position3D) {

    }

    public firstInit(scene): void {
        this.physicalCar.render(scene);
        this.isDrawn = true;
    }

    public reDraw(): void {
        this.physicalCar.setPositionWithRender(this.physicalCar.Position);
    }

    public updatePosition(): void {
        let currentVirt: PositionXAsix = this.virtualCar.Location;
        let parrent = this.parentPosition;
        let lineHight = 5;

        let newPosition = {
            x: parrent.x + currentVirt.x,
            y: parrent.y + 2 + (this.virtualCar.lineAlocate - 1) * lineHight,
            z: parrent.z + 1
        };
        this.physicalCar.Position = newPosition;
    }

    public destroy(scene): void {

        this.physicalCar.ElementList.forEach(element => {
            const object = scene.getObjectByProperty('uuid', element.Element.uuid);

            object.geometry.dispose();
            object.material.dispose();
            scene.remove(object);
        });

        scene.remove(this.physicalCar);
    }


    public render(scene): void {
        this.updatePosition();
        if (!this.isDrawn) {
            return this.firstInit(scene);
        }

        this.reDraw()

    }
}

export class GroundRenderer {
    constructor(private scene) {

    }

    private loader: THREE.TextureLoader = new THREE.TextureLoader();

    public build(size: Position3D): void {
        let atomarGround = new ElementThree("#16a085", {x: 0, y: 0, z: -0.1}, {x: size.x, y: size.y, z: 0.1});

        let texture = this.loader.load('/assets/grasshd.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);

        let groundMaterial = new THREE.MeshPhongMaterial({
            map: texture,

        });

        atomarGround.changeMatial(groundMaterial);

        console.log(groundMaterial);
        let ground = new ElementMesh([atomarGround], {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});
        ground.render(this.scene);
    }


}

export class CarRenderer extends ItemLocatedOnRoadRenderer {

    constructor(public physicalCar: ElementMesh, public virtualCar: ItemLocatedOnRoad, protected  parentPosition: Position3D) {
        super(physicalCar, virtualCar, parentPosition);

    }
}

export class BrickRenderer extends ItemLocatedOnRoadRenderer {

}

export class RoadSegmentRenderer extends RoadSegment {

    constructor(maxSpeed: number, length: number, line: number, public position: Position3D) {
        super(maxSpeed, length, line);

    }
}

export class TrafficLightRenderer extends ItemLocatedOnRoadRenderer {
    update() {
        let lightState = this.virtualCar.getInfoForAP();
        let elementOfLight = this.physicalCar.ElementList;

        if (lightState.lightInfo.isAbleToRun) {
            elementOfLight[1].Color = "#27ae60";
        } else {
            elementOfLight[1].Color = "#e74c3c";

        }
    }
}

export class TreeRenderer {
    objectFactory = new onMapObjectModelFactory();

    build(): ElementMesh {
        return this.objectFactory.buildTree();
    }
}

export class RoadRendered {
    private loader: THREE.TextureLoader = new THREE.TextureLoader();
    private teslaFactory: TeslaFactory = new TeslaFactory();
    private lanosFact: SlowCarFactory = new SlowCarFactory();
    private lightFactory: TrafficLightFactory = new TrafficLightFactory();
    private objectFacotry = new onMapObjectModelFactory();
    private brickFactory: BlockConstructionOnRoadFactory = new BlockConstructionOnRoadFactory();
    private outOfRoadNotify: Subject<number> = new Subject();

    cityRoadMaxSpeed: number = 20;
    roadList: RoadSegmentRenderer[] = [];
    carListToCheck: CarRenderer[] = [];
    brickListToCheck: BrickRenderer[] = [];
    trafficLightToCheck: TrafficLightRenderer[] = [];

    constructor(private scene) {
    }

    private renderRoadSegment(road: RoadSegmentRenderer): void {
        let road3d = this.objectFacotry.buildRoadSegment(road.LineCount, road.Length);
        road3d.Position = road.position;
        road3d.render(this.scene);
    }

    private renderBrick(brick: BrickRenderer): void {
        brick.render(this.scene);
    }

    public buildRoadSegment(position: Position3D, length: number, line: number): RoadSegmentRenderer {
        let road = new RoadSegmentRenderer(this.cityRoadMaxSpeed, length, line, position);
        road.onDespawn().subscribe((cars: CarOnRoad[]) => {
            for (let i = 0; i < cars.length; i++) {
                let car = cars[i];
                this.outOfRoadNotify.next(1);
                for (let j = 0; j < this.carListToCheck.length; j++) {
                    let carRend: CarRenderer = this.carListToCheck[j];
                    if (carRend.virtualCar === car) {
                        carRend.destroy(this.scene);
                        this.carListToCheck = this.carListToCheck.filter(carR => carR !== carRend);
                    }
                }

            }
        });

        this.roadList.push(road);

        return road;
    }

    public onCarOutOfRoad(): Subject<number> {
        return this.outOfRoadNotify;
    }

    public spawnBrick(roadSegmentIndex: number): void {
        let segment = this.roadList[roadSegmentIndex];
        let brick = this.brickFactory.build();
        segment.addBrick(brick);
        let brick3D = this.objectFacotry.buildBrickModel();
        let brickIndexer = new BrickRenderer(brick3D, brick, segment.position);
        this.brickListToCheck.push(brickIndexer);

    }

    public spawnCar(roadSegmentIndex: number): boolean {
        let segment = this.roadList[roadSegmentIndex];
        let maxLine = segment.LineCount;
        let currentLine = Math.ceil(Math.random() * maxLine);
        let carPhys = this.objectFacotry.buildCarModel();
        let car;
        if (Math.random() * 5 > 2) {

            car = this.teslaFactory.build();
        } else {
            car = this.lanosFact.build();
            carPhys.ElementList.forEach(el => {
                el.Color = "#34495e";
            })
        }

        if (segment.isAbleToSpawnCar(50, currentLine)) {
            let carVirt = segment.addCar(car, {x: 0}, {x: 1}, currentLine);
            let a = new CarRenderer(carPhys, carVirt, segment.position);
            this.carListToCheck.push(a);
            return true;
        }
        return false;
    }

    public spawnTrafficLight(roadSegmentIndex: number): void {
        let segment = this.roadList[roadSegmentIndex];

        let light = this.lightFactory.build();
        let lightPhys = this.objectFacotry.buildTrafficLight();
        segment.addTrafficLight(light);
        let a = new TrafficLightRenderer(lightPhys, light, segment.position);
        this.trafficLightToCheck.push(a);

    }

    public renderStaticObject(): void {
        for (let i = 0; i < this.roadList.length; i++) {
            let segmentRoad = this.roadList[i];
            this.renderRoadSegment(segmentRoad);
        }
        for (let i = 0; i < this.brickListToCheck.length; i++) {
            let brick = this.brickListToCheck[i];
            this.renderBrick(brick);
        }
    }

    public renderDynamicObject(): void {
        for (let i = 0; i < this.carListToCheck.length; i++) {
            let car = this.carListToCheck[i];
            car.render(this.scene);
        }

        for (let i = 0; i < this.trafficLightToCheck.length; i++) {
            let light = this.trafficLightToCheck[i];

            light.update();
            light.render(this.scene);
        }
    }

    public update(timer): void {
        for (let i = 0; i < this.roadList.length; i++) {
            let segmentRoad = this.roadList[i];
            segmentRoad.update(timer);
        }
    }
}

abstract class TextureCreator {
    protected loader: THREE.TextureLoader = new THREE.TextureLoader();

}

class BrickCreator extends TextureCreator {
    build(): ElementMesh {
        let brick = new ElementThree("#ff3e52", {x: 0, y: 0, z: 0}, {x: 1, y: 3, z: 3});

        let brickObj = new ElementMesh([brick], {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});
        return brickObj;
    }
}

class CarCreator extends TextureCreator {
    private carMaterial = new THREE.MeshPhongMaterial({
        map: this.loader.load('/assets/carW.jpg'),
    });

    build(): ElementMesh {
        let car = new ElementThree("#f1c40f", {x: 0, y: 0, z: 0}, {x: 5, y: 2, z: 2});
        let carTop = new ElementThree("#f1c40f", {x: 0, y: 0, z: 1}, {x: 3, y: 2, z: 2});

        car.changeMatial(this.carMaterial);
        carTop.changeMatial(this.carMaterial);

        let carObj = new ElementMesh([car, carTop], {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});
        return carObj;
    }
}

class RoadSegmentCreator extends TextureCreator {
    private roadMaterial;

    constructor() {
        super();
        this.loadRoadTexture();
    }

    private loadRoadTexture() {
        let texture = this.loader.load('/assets/road.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 1);

        this.roadMaterial = new THREE.MeshPhongMaterial({
            map: texture,
        });
    }

    public build(lineCount: number, length: number): ElementMesh {
        let lineList = [];
        let lineHeight = 5;
        for (let i = 0; i < lineCount; i++) {
            let newLineOffset = i * lineHeight
            let leftWhite = new ElementThree("#fff", {x: 0, y: newLineOffset, z: 0}, {
                x: length,
                y: 0.1,
                z: 1
            });
            let line = new ElementThree("#888", {x: 0, y: newLineOffset + 0.1, z: 0}, {
                x: length,
                y: 4.8,
                z: 1
            });
            line.changeMatial(this.roadMaterial);
            let rightWhite = new ElementThree("#fff", {x: 0, y: newLineOffset + 4.9, z: 0}, {
                x: length,
                y: 0.1,
                z: 1
            });

            lineList.push(leftWhite);
            lineList.push(line);
            lineList.push(rightWhite);
        }

        let road3d = new ElementMesh(lineList, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});
        return road3d;
    }
}

class TrafficLightCreator extends TextureCreator {

    public build(): ElementMesh {
        let lightLeg = new ElementThree("#bdc3c7", {x: 0.25, y: 0.25, z: 0}, {x: .5, y: .5, z: 4});
        let lightTop = new ElementThree("#e74c3c", {x: 0, y: 0, z: 3}, {x: 1, y: 1, z: 1});

        let light = new ElementMesh([lightLeg, lightTop], {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: 0});
        return light;
    }
}

class TreeCreator extends TextureCreator {

    private treeTexture = new THREE.MeshPhongMaterial({
        map: this.loader.load('/assets/leafs.jpg'),
    });
    private treeRootMaterial = new THREE.MeshPhongMaterial({
        map: this.loader.load('/assets/tree.png'),
    })

    public build(): ElementMesh {
        let colorArr = ["#2ecc71", "#40407a", '#218c74', '#e74c3c'];
        let treeRootColor = "#cd6133";
        let treeColor = colorArr[Math.floor(Math.random() * colorArr.length)];
        let treePart = new ElementThree(treeColor, {x: 0, y: 0, z: 5}, {x: 3, y: 3, z: 3});

        treePart.changeMatial(this.treeTexture);

        let treeRoot = new ElementThree(treeRootColor, {x: 1, y: 1, z: 0}, {x: 1, y: 1, z: 5});
        treeRoot.changeMatial(this.treeRootMaterial);

        let tree = new ElementMesh([treePart, treeRoot], {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});
        return tree;
    }
}


export class onMapObjectModelFactory {

    private brickObj: BrickCreator = new BrickCreator();
    private roadObj: RoadSegmentCreator = new RoadSegmentCreator();
    private carObj: CarCreator = new CarCreator();
    private lightObj: TrafficLightCreator = new TrafficLightCreator();
    private treeObj: TreeCreator = new TreeCreator();

    constructor() {

    }

    public buildBrickModel(): ElementMesh {
        return this.brickObj.build();
    }

    public buildCarModel(): ElementMesh {
        return this.carObj.build();
    }

    public buildRoadSegment(lineCount: number, length: number): ElementMesh {
        return this.roadObj.build(lineCount, length);
    }

    public buildTrafficLight(): ElementMesh {
        return this.lightObj.build();
    }

    public buildTree(): ElementMesh {
        return this.treeObj.build();
    }
}

