

import React, {useState, useEffect} from 'react';
import TopMenu from './components/TopMenu';
import SidebarLeft from './components/SidebarLeft';
import Viewport from './components/Viewport';
import SidebarRight from './components/SidebarRight';
import StatusBar from './components/StatusBar';

import './index.css' // Importa o reset global aqui
import './App.css';


export default function App(){
  const [selectedTile, isSelectedTile] = useState({x: 0, y:0});
  const [activeTab, setActiveTab] = useState('tilesets'); //tilesets or events tab

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