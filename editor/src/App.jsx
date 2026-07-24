import React, { useState, useEffect } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft';
import Viewport from './components/Viewport/Viewport.jsx';
import SidebarRight from './components/SidebarRight';
import StatusBar from './components/StatusBar';

import { TiledLoader } from './parsers/Tiled/TiledLoader.js';
import { MapDataModel } from './models/MapDataModel/MapDataModel.js';
import './index.css';
import './App.css';

export default function App() {
  const [selectedTile, setSelectedTile] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('tilesets'); // tilesets or events tab
  
  // Estado central do mapa que faltava para abastecer a Viewport
  const [mapDataModel, setMapDataModel] = useState(null);
  const [activeLayerIndex, setActiveLayerIndex] = useState({ bucketId: 0, index: 0 });
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    async function loadInitialMap() {
      const dirPath = "D:/projects/2026/zwyn2dengine/engine/Editor/project1";
      const fileName = "Map002.json";

      const result = await TiledLoader.loadTiledJsonMap(dirPath, fileName);

      if (result.success === false) {
        console.error("Erro ao ler arquivo do disco:", result.error);
        return;
      }

      // Instancia o MapModel passando o JSON bruto
      const loadedMap = new MapDataModel(result.data);
      console.log("3. MapModel criado com sucesso! Objeto final:", loadedMap);

      // Joga no estado do React para renderizar na tela
      setMapDataModel(loadedMap);
    }

    loadInitialMap();
  }, []);

  return (
    <div className="app-container">
      {/* 1 - Menu Superior */}
      <TopMenu />

      {/* Corpo principal - dividido em colunas */}
      <div className="main-content">
        {/* 2 - Barra lateral esquerda */}
        <SidebarLeft className="sidebar-left" />
        
        {/* 3 - Área de Visualização (Viewport) com os dados passando agora */}
        <Viewport 
          className="viewport-container" 
          mapDataModel={mapDataModel}
          activeLayerIndex={activeLayerIndex}
          showGrid={showGrid}
        />

        {/* 4 - Barra lateral direita */}
        <SidebarRight 
          className="sidebar-right"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTile={selectedTile}
        />
      </div>

      {/* 5 - Barra de Status inferior */}
      <StatusBar 
        className="status-bar"
        selectedTile={selectedTile} 
      />
    </div>
  );
}