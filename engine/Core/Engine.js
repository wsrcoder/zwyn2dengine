

import Input from "./Input/Input.js";
import GameScreen from "./Rendering/GameScreen.js"
import GameTime from "./Time/GameTime.js";
import SceneMap from "./World/Map/SceneMap.js";

import FileLoader from "./Utils/FileLoader.js";
import TiledParser from "./World/Parsers/TiledParser.js";

export default class Engine{

    constructor(options){
        
        this.screen = new GameScreen(options.canvas, {autoResize: false});

        this.time = new GameTime();

        this.input = new Input(this.screen.canvas);

        this.currentScene = null;
        this.isRunning = false;
    }

    async initialize(){
        console.log("Zwyn Engine: Initializing game systems...");

        // 1. Baixa o arquivo JSON do mapa assincronamente
        const dadosDoJson = await FileLoader.loadJSON("./Editor/project1/Map002.json");

        console.log('passou do file loader');
    
        // 2. Passa o JSON para o parser criar a nossa estrutura interna de dados
        const tileMap = await TiledParser.parse(dadosDoJson, "./Editor/project1/");

        console.log('passou do tiled parser');
    
        // 3. Agora seu mapa está pronto na memória!

        console.log("MAPA FINAL NO LOCAL DE USO:", tileMap);
        console.log("TILESETS NO MAPA:", tileMap.tilesets);
        console.log("METADATA DO PRIMEIRO TILESET:", tileMap.tilesets[0]?.tileMetadata);

        if (!tileMap.tilesets || tileMap.tilesets.length === 0) {
            throw new Error("Zwyn Engine: Nenhum tileset encontrado no JSON do mapa!");
        }

        // 1. Carrega a imagem do Tileset de forma assíncrona
        const imagemTileset = await FileLoader.loadImage("./Assets/Tilesets/" + tileMap.tilesets[0].name + ".png");

        this.currentScene = new SceneMap(this.screen, tileMap, imagemTileset, this.input);
        this.run();
    }

    run(){
        
        if(this.isRunning) return;

        this.isRunning = true;

        // PONTAPÉ INICIAL: Dispara o loop da Engine passando o primeiro timestamp
        requestAnimationFrame((timestamp) => this.loop(timestamp));
        
    }

    loop(timestamp){
        if(!this.isRunning) return;

        // Atualiza o gerenciador de tempo
        this.time.update(timestamp);

        // Passamos o time.elapsed para o update
        this.update(this.time.elapsed);
        this.render();

        // Corrigido: Frane -> Frame
        requestAnimationFrame((timestamp) => this.loop(timestamp)); 
    }

    update(deltaTime){

        // 1. Atualiza a lógica da cena atual (onde está a movimentação do alvo e a câmera!)
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }

        // No final de tudo, limpa os gatilhos para o próximo frame
        this.input.update();
    }

    render(){

        this.screen.clear();

        if (this.currentScene) {
            this.currentScene.render();
        }

        
    }
}