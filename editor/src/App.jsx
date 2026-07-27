import React, { useState, useEffect, useRef } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft/SidebarLeft.jsx';
import Viewport from './components/Viewport/Viewport.jsx';
import SidebarRight from './components/SidebarRight/SidebarRight.jsx';
import StatusBar from './components/StatusBar';

import { ProjectController } from './controllers/ProjectController.js';
import { EditorController } from './controllers/EditorController.js';

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
// 
// 3. Criar a lógica principal do Tab Workspace na área central (Viewport), 
//    permitindo abrir telas secundárias em abas (como Banco de Dados, Tilesets, etc.) 
//    em vez de usar modals bloqueantes.
// ==========================================

export default function App() {
  // Instancia os controladores globais usando refs para persistirem durante o ciclo de vida
  const projectControllerRef = useRef(new ProjectController());
  const editorControllerRef = useRef(new EditorController());
  
  const projectController = projectControllerRef.current;
  const editorController = editorControllerRef.current;

  // Estados locais para abas e componentes da UI que o React ainda precisa exibir
  const [activeLeftTab, setActiveLeftTab] = useState('maps');
  const [activeTab, setActiveTab] = useState('tilesets');

  const [showGrid, setShowGrid] = useState(true);

  // Estado que alimenta a Viewport com o modelo do mapa atual
  const [mapDataModel, setMapDataModel] = useState(null);

  // Vincula o ProjectController ao EditorController na montagem inicial
  useEffect(() => {
    editorController.setProjectController(projectController);
  }, [projectController, editorController]);

  useEffect(() => {
    async function initEditorSession() {
      const templatePath = "D:/projects/2026/zwyn2dengine/Editor/templates/default-project";
      const projectName = "Default Project";

      try {
        // Verifica se o diretório do template já existe
        const projectExists = await window.electronAPI.directoryExists(templatePath);

        if (!projectExists) {
          console.log("[App] Template não encontrado. Criando novo projeto padrão...");
          await projectController.createNewProject(templatePath, projectName);
        } else {
          console.log("[App] Template já existe. Abrindo projeto existente...");
          await projectController.openProject(templatePath);
        }

        // Pega o mapa atual diretamente da nova estrutura de cache da sessão
        const currentId = projectController.session.map.currentId;
        const currentCacheEntry = projectController.session.map.cache.get(currentId);

        

        if (currentCacheEntry && currentCacheEntry.model) {
          setMapDataModel(currentCacheEntry.model);
        }

      } catch (error) {
        console.error("[App] Erro ao inicializar a sessão do editor:", error);
      }
    }

    initEditorSession();
  }, [projectController]);

  return (
    <div className="app-container">
      <TopMenu />
      
      <div className="main-content">
        <SidebarLeft 
          className="sidebar-left" 
          projectController={projectController}
          editorController={editorController}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
          onSelectMap={async (mapId) => {
            // Garante que o mapa está no cache (carrega do disco se necessário)
            const mapModel = await projectController.mapManager.fetchMapDataById ? 
              // Se usarmos ID ou índice:
              null : null; 
          }}
        />
        
        <Viewport 
          className="viewport-container" 
          editorController={editorController}
          mapDataModel={mapDataModel}
        />

        <SidebarRight 
          className="sidebar-right"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTile={editorController.selectedTile}
        />
      </div>

      <StatusBar 
        className="status-bar"
        selectedTile={editorController.selectedTile} 
      />
    </div>
  );
}