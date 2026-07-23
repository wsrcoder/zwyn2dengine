

import React, {useState, useEffect} from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft';
import Viewport from './components/Viewport';
import SidebarRight from './components/SidebarRight';
import StatusBar from './components/StatusBar';

import { TiledLoader } from './parsers/Tiled/TiledLoader.js';
import { MapModel } from './models/MapModel/MapModel.js';

import './index.css' // Importa o reset global aqui
import './App.css';


export default function App(){
  const [selectedTile, isSelectedTile] = useState({x: 0, y:0});
  const [activeTab, setActiveTab] = useState('tilesets'); //tilesets or events tab

  useEffect(() => {
        async function testMapLoading() {
            // Caminho absoluto para o seu arquivo JSON de teste no computador
            // (Substitua pelo caminho real do seu arquivo .json exportado pelo Tiled)
            const dirPath = "D:/projects/2026/zwyn2dengine/engine/Editor/project1";
            const fileName = "Map002.json";

            console.log("1. Solicitando leitura do arquivo ao Electron...");
            const result = await TiledLoader.loadTiledJsonMap(dirPath, fileName);

          
            if (result.success === false) {

                console.error(" Erro ao ler arquivo do disco:", result.error);
                return;
            }

            console.log("2. Arquivo JSON lido com sucesso pelo TiledLoader!");
            
            // Instancia o MapModel passando o JSON bruto
            const mapModel = new MapModel(result.data);

            console.log("3. MapModel criado com sucesso! Objeto final:", mapModel);
            console.log(`Número de camadas: ${mapModel.layers.length}`);
        }

        testMapLoading();
    }, []);

  return(
    <div className="app-container">
      {/*1 - Menu Superior*/}
      <TopMenu />

      {/** Corpo principal - dividido em colunas */}
      <div className ="main-content">
        {/**2 -Barra lateral esquerda(Mapas e acesso ao layer de eventos) */}
        <SidebarLeft className="sidebar-left" />
        {/**3 - Área de Visualização (Viewport) */}
        <Viewport className="viewport-container" />
        {/**4 -Barra lateral direita (Tabset: Tilesets/eventos) */}
        <SidebarRight className="sidebar-right"
          aciveTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTile={selectedTile}
        />
      </div>

      {/** 5 - Barra de Status inferior*/}
      <StatusBar className="status-bar"
       selectedTile={selectedTile} />
    </div>
  );
}