"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var ElementThree = /** @class */ (function () {
    function ElementThree(color, location, size) {
        this.color = color;
        this.location = location;
        this.size = size;
        var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        var material = new THREE.MeshPhongMaterial({ color: color });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.element = mesh;
    }
    Object.defineProperty(ElementThree.prototype, "Location", {
        get: function () {
            return this.location;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementThree.prototype, "Element", {
        get: function () {
            return this.element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementThree.prototype, "Color", {
        set: function (value) {
            this.color = value;
            this.element.material = new THREE.MeshPhongMaterial({ color: value });
        },
        enumerable: true,
        configurable: true
    });
    ElementThree.prototype.changeMatial = function (material) {
        this.element.material = material;
    };
    ElementThree.prototype.addToScene = function (scene, position) {
        var cube = this.element;
        cube.position.x = position.x + this.location.x + this.size.x / 2;
        cube.position.y = position.y + this.location.y + this.size.y / 2;
        cube.position.z = position.z + this.location.z + this.size.z / 2;
        scene.add(cube);
    };
    ElementThree.prototype.move = function (vector) {
        this.element.translateX(vector.x);
        this.element.translateY(vector.y);
        this.element.translateZ(vector.z);
        return this;
    };
    ElementThree.prototype.moveLocation = function (vector) {
        this.location = { x: this.location.x + vector.x, y: this.location.y + vector.y, z: this.location.z + vector.z };
        return this;
    };
    ElementThree.prototype.setPosition = function (vector) {
        this.element.position.set(vector.x, vector.y, vector.z);
    };
    return ElementThree;
}());
exports.ElementThree = ElementThree;
var ElementMesh = /** @class */ (function () {
    function ElementMesh(elementList, position, size) {
        this.elementList = elementList;
        this.position = position;
        this.size = size;
    }
    Object.defineProperty(ElementMesh.prototype, "Position", {
        get: function () {
            return this.position;
        },
        set: function (value) {
            this.position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementMesh.prototype, "ElementList", {
        get: function () {
            return this.elementList;
        },
        enumerable: true,
        configurable: true
    });
    ElementMesh.prototype.decompose = function () {
        return this.elementList;
    };
    ElementMesh.prototype.render = function (scene) {
        var _this = this;
        this.elementList.forEach(function (part) {
            part.addToScene(scene, _this.position);
        });
    };
    ElementMesh.prototype.move = function (vector) {
        this.elementList.forEach(function (element) {
            element.moveLocation(vector);
        });
        return this;
    };
    ElementMesh.prototype.setPositionWithRender = function (vector) {
        this.elementList.forEach(function (element) {
            var elLocation = element.Location;
            var relativeVector = { x: vector.x + elLocation.x, y: vector.y + elLocation.y, z: vector.z + elLocation.z };
            element.setPosition(relativeVector);
        });
    };
    ElementMesh.prototype.calculateMargin = function (v1, v2) {
        return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
    };
    ElementMesh.prototype.merge = function (meshToMerge) {
        var _a;
        var margin = this.calculateMargin(this.Position, meshToMerge.Position);
        var elementList = meshToMerge.decompose().map(function (e) { return e.moveLocation(margin); });
        (_a = this.elementList).push.apply(_a, elementList);
        return this;
    };
    return ElementMesh;
}());
exports.ElementMesh = ElementMesh;
//# sourceMappingURL=elements.js.map