import {OBJLoader2} from "three/examples/jsm/loaders/OBJLoader2";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {MtlObjBridge} from "three/examples/jsm/loaders/obj2/bridge/MtlObjBridge";

export class ObjModelLoader {
    private carModel; /// .obj object texture

    public loadCarModel() {
        return new Promise((e) => {
            const mtlLoader = new MTLLoader();
            mtlLoader.load('./assets/car.mtl', (mtlParseResult) => {
                const objLoader = new OBJLoader2();
                const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);

                objLoader.addMaterials(materials, true);
                objLoader.load('./assets/car.obj', (root) => {
                    this.carModel = root;
                    e(root)
                });
            });
        })
    }

    public getCarModel() {
        return this.carModel;
    }

    public async loadAll() {

        //removed, load traffic usage 3mb,
        // change to lightweight jpeg img
        // await this.loadCarModel();
    }
}
