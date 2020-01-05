import {ObjModelLoader} from "./carTextureLoader";

export class ObjModelLoaderSingle {
    private static instance: ObjModelLoaderSingle;
    private objLoader = new ObjModelLoader();

    private constructor() {

    }

    public static getInstance(): ObjModelLoaderSingle {
        if (!ObjModelLoaderSingle.instance) {
            ObjModelLoaderSingle.instance = new ObjModelLoaderSingle();
        }

        return ObjModelLoaderSingle.instance
    }

    public async loadAll() {
        return await this.objLoader.loadAll();
    }

    public getCarModel() {
        return this.objLoader.getCarModel();
    }

}
