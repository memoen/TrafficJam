import {ObjModelLoaderSingle} from "./render/textureLoader";
import {LevelController} from "./render/levelBuilder";

(async () => {
    let objLoader = ObjModelLoaderSingle.getInstance();
    await objLoader.loadAll();
    let level = new LevelController();
    level.initView();
    level.buildMap();
    level.draw();
    level.tickRenderer();
})();

