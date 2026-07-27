import React, { useRef } from 'react';
import { ProjectController } from './controllers/ProjectController.js';
import { EditorController } from './controllers/EditorController.js';

import './index.css';
import './App.css';

export default function App() {
  // Instancia os controladores globais usando refs
  const projectControllerRef = useRef(new ProjectController());
  const editorControllerRef = useRef(new EditorController());
  
  const projectController = projectControllerRef.current;

  const targetPath = "D:/projects/2026/zwyn2dengine/editor/templates/default-project";

  // Função focada apenas em testar a criação do novo projeto
  const handleTestCreateProject = async () => {
    try {
        console.log("[App] Iniciando teste de criação de projeto...");
        await projectController.createNewProject(targetPath, "Default Project");
        console.log("[App] Sucesso! Pastas, project.json e mapa criados corretamente.");
    } catch (error) {
        console.error("[App] Erro ao criar o novo projeto:", error);
    }
  };

  // Função focada em testar a abertura de um projeto já existente
  const handleTestOpenProject = async () => {
    try {
        console.log("[App] Iniciando teste de abertura de projeto...");
        const success = await projectController.openProject(targetPath);
        
        if (success) {
            console.log("[App] Sucesso! Projeto aberto e sessão carregada.");
            console.log("[App] Estado atual da sessão:", projectController.session);
        } else {
            console.warn("[App] Falha ao abrir o projeto.");
        }
    } catch (error) {
        console.error("[App] Erro ao abrir o projeto:", error);
    }
  };

  // Função focada em testar o fechamento do projeto
  const handleTestCloseProject = async () => {
    try {
        console.log("[App] Iniciando teste de fechamento de projeto...");
        await projectController.closeProject();
        console.log("[App] Sucesso! Estado atual da sessão após fechar:", projectController.session);
    } catch (error) {
        console.error("[App] Erro ao fechar o projeto:", error);
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px', color: '#fff' }}>
      <h1>Testes Isolados: ProjectController</h1>
      <p>Use os botões abaixo para testar a criação e a leitura dos arquivos de projeto.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={handleTestCreateProject}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Testar createNewProject()
        </button>

        <button 
          onClick={handleTestOpenProject}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#2e7d32', color: '#fff', border: 'none' }}
        >
          Testar openProject()
        </button>

        <button 
          onClick={handleTestCloseProject}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#c62828', color: '#fff', border: 'none' }}
        >
          Testar closeProject()
        </button>
      </div>
    </div>
  );
}