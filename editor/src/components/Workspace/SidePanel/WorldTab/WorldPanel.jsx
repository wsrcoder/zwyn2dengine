import React, { useState, useEffect } from 'react';
import { EDITOR_EVENTS } from '../../../../state/EventTypes';
import { EventHandler } from '../../../../state/EventBus';

import './WorldPanel.css';

export default function WorldsTab({ projectController, worldController, projectStore }) {
    // Adicione um estado para saber se há projeto carregado
    const [hasProject, setHasProject] = useState(false);

    const [expandedWorlds, setExpandedWorlds] = useState(true);
    const [expandedScenes, setExpandedScenes] = useState(true);

    const [worldsList, setWorldsList] = useState([]);
    const [activeWorldId, setActiveWorldId] = useState(null);
    const [scenesList, setScenesList] = useState([]);
    const [activeSceneId, setActiveSceneId] = useState(null);

    // Função para puxar os dados atualizados de dentro da session da projectStore
    const syncFromStore = () => {
        console.log("[WorldsTab] Sincronizando com a Store...", projectStore.session);
        if (!projectStore || !projectStore.session) return;

        const session = projectStore.session;
        
        // 1. Pega a lista de mundos do projeto
        const projectData = session.project;

        // Define se existe um projeto ativo válido
        setHasProject(!!projectData);

        const worlds = projectData?.worlds || [];
        setWorldsList([...worlds]);

        // 2. Pega os IDs ativos direto da raiz da navegação
        const currentWorldId = session.navigation?.activeWorldId;
        const currentSceneId = session.navigation?.activeSceneId;
        
        setActiveWorldId(currentWorldId);
        setActiveSceneId(currentSceneId);

        // 3. Se houver um mundo ativo, extrai as cenas dele
        if (currentWorldId !== undefined && currentWorldId !== null) {
            const activeWorldObj = worlds.find(w => w.id === currentWorldId || w.name === currentWorldId);
            setScenesList(activeWorldObj?.scenes || []);
        } else {
            setScenesList([]);
        }
    };

    useEffect(() => {
        syncFromStore();

        // Inscreve nos eventos do EventBus para manter a interface reativa
        const unsubProjectLoaded = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, syncFromStore);
        const unsubProjectClosed = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_CLOSED, syncFromStore);
        const unsubWorldsList = EventHandler.subscribe(EDITOR_EVENTS.WORLDS_LIST_UPDATED, syncFromStore);
        const unsubSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, syncFromStore);
        const unsubWorldChanged = EventHandler.subscribe(EDITOR_EVENTS.WORLD_CHANGED, syncFromStore);

        return () => {
            unsubProjectLoaded();
            unsubProjectClosed();
            unsubWorldsList();
            unsubSceneChanged();
            unsubWorldChanged();
        };
    }, [projectStore]);

    // Ações de Mundo
    const handleSelectWorld = async (worldId) => {
        console.log("[WorldsTab] Selecionando mundo:", worldId);
        if (worldController && typeof worldController.setActiveWorld === 'function') {
            await worldController.setActiveWorld(worldId);
        } else {
            projectStore.session.navigation.activeWorldId = worldId;
        }

        syncFromStore();
    };

    const handleCreateWorld = async () => {
        console.log("[WorldsTab] Criando novo mundo...");
        if (worldController && typeof worldController.createWorld === 'function') {
            await worldController.createWorld();

            syncFromStore();
        }
    };

    const handleCreateScene = async () => {
        console.log("[WorldsTab] Criando nova cena no mundo ativo...");
        if (worldController && typeof worldController.createScene === 'function') {
            await worldController.createScene(projectStore.session.navigation.currentWorldId);
            
            syncFromStore();
        }
    };

    // Ações de Cena
    const handleSelectScene = async (sceneId) => {
        console.log("[WorldsTab] Selecionando cena:", sceneId);
        if (worldController && typeof worldController.setActiveScene === 'function') {
            await worldController.setActiveScene(activeWorldId, sceneId);
        } else {
            projectStore.session.navigation.activeSceneId = sceneId;
        }
    
        syncFromStore();
    };

    

    return (
        <div className="worlds-tab-container">
            
            {/* 1. SEÇÃO SUPERIOR: LISTA DE MUNDOS */}
            <div className="sidebar-section">
                <div 
                    className="sidebar-header" 
                    onClick={() => setExpandedWorlds(!expandedWorlds)}
                >
                    <span>🌍 Mundos</span>
                    <span>{expandedWorlds ? '▼' : '▶'}</span>
                </div>

                {expandedWorlds && (
                    <div className="sidebar-content">
                        <button className="sidebar-btn-action" 
                                onClick={handleCreateWorld}
                                disabled={!hasProject}>
                            + Novo Mundo
                        </button>

                        <ul className="sidebar-list">
                            {worldsList.length === 0 ? (
                                <li className="sidebar-empty">Nenhum mundo encontrado</li>
                            ) : (
                                worldsList.map((world, idx) => {
                                    const worldId = world.id !== undefined ? world.id : idx;
                                    const worldName = world.name || `Mundo ${idx + 1}`;
                                    const isSelected = activeWorldId === worldId || activeWorldId === world.name;

                                    return (
                                        <li 
                                            key={worldId}
                                            className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                            onClick={() => handleSelectWorld(worldId)}
                                        >
                                            <span>🌐 {worldName}</span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* 2. SEÇÃO INFERIOR: LISTA DE CENAS DO MUNDO SELECIONADO */}
            <div className="sidebar-section">
                <div 
                    className="sidebar-header" 
                    onClick={() => setExpandedScenes(!expandedScenes)}
                >
                    <span>🗺️ Cenas</span>
                    <span>{expandedScenes ? '▼' : '▶'}</span>
                </div>

                {expandedScenes && (
                    <div className="sidebar-content">
                        <button 
                            className="sidebar-btn-action" 
                            onClick={handleCreateScene}
                            disabled={!hasProject || activeWorldId === null || activeWorldId === undefined}
                        >
                            + Nova Cena
                        </button>

                        <ul className="sidebar-list">
                            {activeWorldId === null || activeWorldId === undefined ? (
                                <li className="sidebar-empty">Selecione um mundo primeiro</li>
                            ) : scenesList.length === 0 ? (
                                <li className="sidebar-empty">Nenhuma cena neste mundo</li>
                            ) : (
                                scenesList.map((scene, idx) => {
                                    const sceneId = scene.id !== undefined ? scene.id : idx;
                                    const isSelected = activeSceneId === sceneId;

                                    return (
                                        <li 
                                            key={sceneId}
                                            className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                            onClick={() => handleSelectScene(sceneId)}
                                        >
                                            <span>📄 {scene.name || `Cena ${idx + 1}`}</span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>

        </div>
    );
}