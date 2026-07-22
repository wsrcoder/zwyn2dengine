import Camera from "../../Camera/Camera.js";
import SceneMapPipeline from "./SceneMapPipeline.js";
import Player from "../Entities/Player.js";
import EntityManager from "../Entities/EntitiyManager.js";

import Config from "../../Config.js";

export default class SceneMap {
    constructor(screen, tileMap, tilesetImage, input) {
        this.screen = screen;
        this.tileMap = tileMap;
        this.tilesetImage = tilesetImage;
        this.input = input;

        this.mapEntities = new EntityManager();
        this.mapPipeline = new SceneMapPipeline();

        this.camera = new Camera({
            worldWidth: tileMap.width * (tileMap.tileWidth || tileMap.tilewidth),
            worldHeight: tileMap.height * (tileMap.tileHeight || tileMap.tileheight),
            viewportWidth: screen.canvas.width,
            viewportHeight: screen.canvas.height
        });

        this.devTarget = null;

        // Cria o player principal
        this.player = new Player({             
            x: screen.canvas.width / 2,
            y: screen.canvas.height / 2,
            width: 32,
            height: 32
        });

        // Adiciona o player principal no gerenciador de entidades e bota a câmera para segui-lo
        this.mapEntities.add(this.player);
        this.camera.follow(this.player);
    }

    update(deltaTime) {
        const mapReference = this.map || this.currentMap || this.tileMap;

        this.camera.update(deltaTime);
        
        // O EntityManager já vai atualizar o player (e o devTarget se houver) passando (deltaTime, mapReference, this.input)
        this.mapEntities.update(deltaTime, mapReference, this.input);
    }

    render() {
        const renderQueue = this.mapPipeline.build({
            tileMap: this.tileMap,
            entities: this.mapEntities,
            camera: this.camera,
            tilesetImage: this.tilesetImage,
            debugTarget: Config.devMode ? this.devTarget : null
        });

        this.screen.draw(renderQueue);
    }
}