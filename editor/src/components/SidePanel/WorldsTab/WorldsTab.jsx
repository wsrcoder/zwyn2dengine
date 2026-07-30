
import React, { useState, useEffect } from 'react';
import { eventBus } from '../../../state/EventBus';
import './WorldsTab.css';

export default function WorldsTab({ projectController, worldController, projectStore }) {
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
        
        // 1. Pega a lista de mundos do project.json
        const worlds = session.project?.worlds || [];
        setWorldsList([...worlds]);

        // 2. Pega os IDs ativos da navegação
        const currentWorldId = session.world?.navigation?.activeWorldId;
        const currentSceneId = session.world?.navigation?.activeSceneId;
        setActiveWorldId(currentWorldId);
        setActiveSceneId(currentSceneId);

        // 3. Se houver um mundo ativo, extrai as cenas dele para a lista inferior
        if (currentWorldId) {
            const activeWorldObj = worlds.find(w => w.id === currentWorldId || w.name === currentWorldId);
            setScenesList(activeWorldObj?.scenes || []);
            console.log("scenes");
            console.log(activeWorldObj?.scenes);
        } else {
            setScenesList([]);
        }
    };

    useEffect(() => {
        syncFromStore();

        // Inscreve nos eventos do EventBus para manter a interface reativa
        const unsubProject = eventBus.subscribe('projectLoaded', syncFromStore);
        const unsubWorldsList = eventBus.subscribe('worldsListUpdated', syncFromStore);
        const unsubSceneChanged = eventBus.subscribe('sceneChanged', syncFromStore);
        const unsubWorldChanged = eventBus.subscribe('worldChanged', syncFromStore);

        return () => {
            unsubProject();
            unsubWorldsList();
            unsubSceneChanged();
            unsubWorldChanged();
        };
    }, [projectStore]);

    // Ações de Mundo
    const handleSelectWorld = async (worldId) => {
        console.log("[WorldsTab] Selecionando mundo:", worldId);
        if (projectController && typeof projectController.setActiveWorld === 'function') {
            await projectController.setActiveWorld(worldId);
        } else {
            // Fallback direto na session caso o controller ainda não tenha o método
            projectStore.session.world.navigation.activeWorldId = worldId;
        }
        eventBus.notify('worldChanged', worldId);
        syncFromStore();
    };

    const handleCreateWorld = async () => {
        console.log("[WorldsTab] Criando novo mundo...");
        if (worldController && typeof worldController.createWorld === 'function') {
            console.log("entrou em handleCreateworld")
            await worldController.createWorld();
            eventBus.notify('worldsListUpdated');
        }
    };

    // Ações de Cena
    const handleSelectScene = async (sceneId) => {
        console.log("[WorldsTab] Selecionando cena:", sceneId);
        if (projectController && typeof projectController.setActiveScene === 'function') {
            await projectController.setActiveScene(sceneId);
        } else {
            projectStore.session.world.navigation.activeSceneId = sceneId;
        }
        eventBus.notify('sceneChanged', sceneId);
        syncFromStore();
    };

    const handleCreateScene = async () => {
        console.log("[WorldsTab] Criando nova cena no mundo ativo...");
        if (projectController && typeof projectController.createScene === 'function') {
            await projectController.createScene();
            eventBus.notify('sceneChanged');
        }
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
                        <button className="sidebar-btn-action" onClick={handleCreateWorld}>
                            + Novo Mundo
                        </button>

                        <ul className="sidebar-list">
                            {worldsList.length === 0 ? (
                            <li className="sidebar-empty">Nenhum mundo encontrado</li>
                            
                            ) : (
                            
                            worldsList.map((world, idx) => {
                            // Garante que pegamos um ID ou usamos o nome/índice como fallback seguro
                            const worldId = world.id || idx;
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
                            disabled={!activeWorldId}
                        >
                            + Nova Cena
                        </button>

                        <ul className="sidebar-list">
                            {!activeWorldId ? (
                                <li className="sidebar-empty">Selecione um mundo primeiro</li>
                            ) : scenesList.length === 0 ? (
                                <li className="sidebar-empty">Nenhuma cena neste mundo</li>
                            ) : (
                                scenesList.map((scene, idx) => {
                                    const sceneId = scene.id || scene.name;
                                    const isSelected = activeSceneId === sceneId;

                                    return (
                                        <li 
                                            key={sceneId || idx}
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