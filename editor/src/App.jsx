import React, { useState, useEffect, useRef } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft/SidebarLeft.jsx';
import Viewport from './components/Viewport/Viewport.jsx';
import SidebarRight from './components/SidebarRight/SidebarRight.jsx';
import StatusBar from './components/StatusBar';

import { ProjectController } from './controllers/ProjectController.js';
import { EditorController } from './controllers/EditorController.js';

import './index.css';
import './App.css';

export default function App() {
  // Instancia os controladores globais usando refs para persistirem durante o ciclo de vida
  const projectControllerRef = useRef(new ProjectController());
  const editorControllerRef = useRef(new EditorController());
  
  const projectController = projectControllerRef.current;
  const editorController = editorControllerRef.current;

  // Estados locais para abas e componentes da UI que o React ainda precisa exibir
  const [activeTab, setActiveTab] = useState('tilesets');
  const [showGrid, setShowGrid] = useState(true);

  // Estado que alimenta a Viewport com o modelo do mapa atual
  const [mapDataModel, setMapDataModel] = useState(null);

  // Vincula o ProjectController ao EditorController na montagem inicial
  useEffect(() => {
    editorController.setProjectController(projectController);
  }, [projectController, editorController]);

  const handleTestCreateProject = async () => {
    const targetPath = "D:/projects/2026/meu-novo-projeto-zwyn";
    
    try {
        await projectController.createNewProject(targetPath, "MeuProjetoZwyn");
        console.log("Tudo pronto! O mapa e as pastas foram gerados e carregados.");
    } catch (error) {
        console.error("Erro ao criar o novo projeto:", error);
    }
  };

  useEffect(() => {
    async function initEditorSession() {
      const templatePath = "D:/projects/2026/zwyn2dengine/Editor/templates/default-project";
      const mapsDir = `${templatePath}/Data/Maps`;
      const projectName = "Default Project";
      const initialMaps = ["Map0001.json"];

      try {
        // Verifica se o diretório do template já existe
        const projectExists = await window.electronAPI.directoryExists(templatePath);

        if (!projectExists) {
          console.log("[App] Template não encontrado. Criando novo projeto padrão...");
          await projectController.createNewProject(templatePath, projectName);
        } else {
          console.log("[App] Template já existe. Pulando criação.");
        }

        // Inicializa o projeto
        await projectController.initProject(projectName, mapsDir, initialMaps);

        // Carrega o mapa inicial e repassa para o estado do React
        const loadedMap = projectController.getCurrentMap();
        if (loadedMap) {
          setMapDataModel(loadedMap);
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
      
      {/* Botão temporário para testar a criação do projeto */}
      <div style={{ padding: '10px' }}>
          <button onClick={handleTestCreateProject}>
              Criar Novo Projeto de Teste
          </button>
      </div>

      <div className="main-content">
        <SidebarLeft className="sidebar-left" />
        
        {/* Viewport agora recebe o editorController injetado */}
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