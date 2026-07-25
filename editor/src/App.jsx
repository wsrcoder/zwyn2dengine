import React, { useState, useEffect, useRef } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import SidebarLeft from './components/SidebarLeft';
import Viewport from './components/Viewport/Viewport.jsx';
import SidebarRight from './components/SidebarRight/SidebarRight.jsx';
import StatusBar from './components/StatusBar';

import { ProjectController } from './controllers/ProjectController.js';

import './index.css';
import './App.css';

export default function App() {
  const projectControllerRef = useRef(new ProjectController());
  const projectController = projectControllerRef.current;

  const [selectedTile, setSelectedTile] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('tilesets');
  const [activeLayerIndex, setActiveLayerIndex] = useState({ bucketId: 0, index: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // Estado que alimenta o MapRenderer na Viewport
  const [mapDataModel, setMapDataModel] = useState(null);

  const handleTestCreateProject = async () => {
        const controller = new ProjectController();
        
        // Caminho de exemplo no disco onde o projeto será gerado
        const targetPath = "D:/projects/2026/meu-novo-projeto- زwyn";
        
        try {
            await controller.createNewProject(targetPath, "MeuProjetoZwyn");
            console.log("Tudo pronto! O mapa e as pastas foram gerados e carregados.");
            
            // Aqui você pode atualizar o estado do React para guardar o controller ativo
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

        // Carrega o mapa na Viewport
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
        
        <Viewport 
          className="viewport-container" 
          mapDataModel={mapDataModel}
          activeLayerIndex={activeLayerIndex}
          showGrid={showGrid}
        />

        <SidebarRight 
          className="sidebar-right"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTile={selectedTile}
        />
      </div>

      <StatusBar 
        className="status-bar"
        selectedTile={selectedTile} 
      />
    </div>
  );
}