import * as THREE from "three";
import {Position3D} from "../globalTypes";

export class ElementThree {
    private readonly element: THREE.Mesh;

    get Location() {
        return this.location;
    }

    get Element() {
        return this.element;
    }

    set Color(value: string) {
        this.color = value;
        this.element.material = new THREE.MeshPhongMaterial({color: value});
    }

    constructor(
        private color: string,
        private location: Position3D,
        private size: Position3D,
    ) {

        let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        let material = new THREE.MeshPhongMaterial({color: color});

        let mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.element = mesh;

    }

    public changeMatial(material): void {
        this.element.material = material;
    }

    public addToScene(scene, position: Position3D): void {
        let cube = this.element;
        cube.position.x = position.x + this.location.x + this.size.x / 2;
        cube.position.y = position.y + this.location.y + this.size.y / 2;
        cube.position.z = position.z + this.location.z + this.size.z / 2;
        scene.add(cube);
    }

    public move(vector: Position3D): ElementThree {
        this.element.translateX(vector.x);
        this.element.translateY(vector.y);
        this.element.translateZ(vector.z);
        return this;
    }

    public moveLocation(vector: Position3D): ElementThree {
        this.location = {x: this.location.x + vector.x, y: this.location.y + vector.y, z: this.location.z + vector.z};
        return this;
    }

    public setPosition(vector: Position3D): void {
        this.element.position.set(vector.x, vector.y, vector.z);
    }

}

export class ElementMesh {

    set Position(value: Position3D) {
        this.position = value;
    }

    get Position() {
        return this.position;
    }

    get ElementList() {
        return this.elementList;
    }


    constructor(private elementList: ElementThree[], private position: Position3D, private size: Position3D) {
    }

    public decompose(): ElementThree[] {
        return this.elementList;
    }

    public render(scene):void {
        this.elementList.forEach(part => {
            part.addToScene(scene, this.position);
        })
    }

    public move(vector: Position3D):ElementMesh {
        this.elementList.forEach(element => {
            element.moveLocation(vector);
        })
        return this;
    }

    public setPositionWithRender(vector: Position3D):void {
        this.elementList.forEach(element => {
            let elLocation = element.Location;
            let relativeVector = {x: vector.x + elLocation.x, y: vector.y + elLocation.y, z: vector.z + elLocation.z};
            element.setPosition(relativeVector);
        })
    }

    public calculateMargin(v1: Position3D, v2: Position3D) {
        return {x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z};
    }

    public merge(meshToMerge: ElementMesh): ElementMesh {
        let margin = this.calculateMargin(this.Position, meshToMerge.Position);
        let elementList = meshToMerge.decompose().map(e => e.moveLocation(margin));
        this.elementList.push(...elementList);

        return this;
    }
}
