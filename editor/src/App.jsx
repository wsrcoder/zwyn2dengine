import React, { useState, useEffect, useRef } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft/SidebarLeft.jsx';
import Viewport from './components/Viewport/Viewport.jsx';
import SidebarRight from './components/SidebarRight/SidebarRight.jsx';
import StatusBar from './components/StatusBar';

import { ProjectController } from './controllers/ProjectController.js';
import { UIController } from './controllers/UIController.js';

import { MapDataModel } from './models/MapDataModel/MapDataModel.js';

import './index.css';
import './App.css';

// ==========================================
// TODO LIST - PRÓXIMOS PASSOS DO EDITOR
// ==========================================
// 1. [ALTA PRIORIDADE] Implementar o redimensionamento arrastável (Resizer) 
//    para a Sidebar Right e Sidebar Left, permitindo customizar a largura da UI.
// 
// 2. Implementar a lógica de Troca de Mapas (Switch Map) utilizando 
//    a nova estrutura baseada em cache e currentId do MapManager.
//      Toda vez que um mapa novo é criado ele já deve ser jogado na estrutura de cache
//    se um mapa for deletado ele deve ser "escondido" na interface mas só apagado ao salvar
// 
// 3. Criar a lógica principal do Tab Workspace na área central (Viewport), 
//    permitindo abrir telas secundárias em abas (como Banco de Dados, Tilesets, etc.) 
//    em vez de usar modals bloqueantes.
// ==========================================

// ==========================================
// TODO LIST - REESTRUTURAÇÃO DA UI E MAPAS
// ==========================================
// 1. [LAYOUT] Unificar a SidebarLeft e SidebarRight em um único componente 
//    centralizado chamado `SidebarPanel` (ou `SidebarContainer`).
// 
// 2. [ABAS DA SIDEBAR] Configurar a nova `SidebarPanel` com exatamente 3 abas principais:
//    - Aba "Mapas": Para listagem e navegação de mapas do projeto.
//    - Aba "Pintura": Dividida verticalmente (Camadas na parte superior e 
//      Tilesets na parte inferior) para acesso simultâneo e ágil.
//    - Aba "Eventos": Para gerenciamento e lógica de eventos do mapa.
// 
// 3. [LÓGICA DE MAPAS] Implementar as funções no MapManager:
//    - `createNewMap`: Cria um novo mapa, instancia o modelo, joga direto 
//      no cache de sessão e marca o projeto como modificado.
//    - `deleteMap`: Realiza o "soft delete" (esconde na interface, remove do cache) 
//      e deixa a deleção física em disco apenas para o momento de Salvar.
// 
// 4. [TAB WORKSPACE] Preparar a área central (Viewport) para gerenciar telas 
//    secundárias baseadas em abas (substituindo modals bloqueantes).
// ==========================================

export default function App() {
  // Instancia os controladores globais usando refs para persistirem durante o ciclo de vida
  const projectControllerRef = useRef(new ProjectController());
  const uiControllerRef = useRef(new UIController());
  
  const projectController = projectControllerRef.current;
  const uiController = uiControllerRef.current;

  // Quando o projeto terminar de carregar
  const [activeProject, setActiveProject] = useState(false);

  // Estados locais para abas e componentes da UI que o React precisa exibir
  const [activeLeftTab, setActiveLeftTab] = useState('maps');
  const [activeTab, setActiveTab] = useState('tilesets');

  const [showGrid, setShowGrid] = useState(true);

  // Estado que alimenta a Viewport com o modelo do mapa atual
  const [mapDataModel, setMapDataModel] = useState(null);

  useEffect(() => {
    // Vincula a referência cruzada dos controllers logo na montagem
    uiController.setProjectController(projectController);

    // Escuta os eventos disparados pelo UIController quando um projeto é carregado pelo TopMenu
    const unsubscribe = uiController.subscribe('projectLoaded', () => {
      const currentId = projectController.session.map.currentId;
      const currentCacheEntry = projectController.session.map.cache.get(currentId);

      if (currentCacheEntry && currentCacheEntry.mapDataModel) {
        setMapDataModel(currentCacheEntry.mapDataModel);
      }
      setActiveProject(true);
    });

    return () => {
      unsubscribe();
    };
  }, [projectController, uiController]);

  return (
    <div className="app-container">
      <TopMenu 
        projectController={projectController} 
        uiController={uiController}
      />
      
      <div className="main-content">
        <SidebarLeft 
          className="sidebar-left" 
          projectController={projectController}
          uiController={uiController}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
          onSelectMap={async (mapId) => {
            // Garante que o mapa está no cache (carrega do disco se necessário)
            const mapModel = await projectController.mapManager.fetchMapDataById ? 
              null : null; 
          }}
        />
        
        <Viewport 
          className="viewport-container" 
          uiController={uiController}
          mapDataModel={mapDataModel}
        />

        <SidebarRight 
          className="sidebar-right"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTile={uiController.selectedTile}
        />
      </div>

      <StatusBar 
        className="status-bar"
        selectedTile={uiController.selectedTile} 
      />
    </div>
  );
}