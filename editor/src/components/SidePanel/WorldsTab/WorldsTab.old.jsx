import React, { useState, useEffect } from 'react';
import './WorldsTab.css';

export default function WorldsTab({ projectController, uiController }) {
    const [expandedMaps, setExpandedMaps] = useState(true);
    const [isCreating, setIsCreating] = useState(false); // Corrigido para false inicialmente, senão o botão nasce desativado!
    const [worldsList, setWorldsList] = useState([]); // Nome do setter corrigido

    useEffect(() => {
        if (!uiController || !projectController) return;

        const updateWorldsList = () => {
            if (projectController.mapManager && projectController.mapManager.mapsList) {
                const list = projectController.mapManager.mapsList;
                console.log("[WorldsTab] Mapas encontrados no MapManager:", list);
                setWorldsList([...list]);
            }
        };

        updateWorldsList();

        // Nome do evento corrigido para 'projectLoaded'
        const unsubscribe = uiController.subscribe('projectLoaded', () => {
            console.log("[WorldsTab] Evento 'projectLoaded' recebido! Atualizando lista de mapas");
            updateWorldsList();
        });

        const unsubscribeMaps = uiController.subscribe('worldsListUpdated', updateWorldsList);

        return () => {
            unsubscribe();
            unsubscribeMaps();
        };
    }, [uiController, projectController]);

    const handleCreateNewMap = async () => {
        if (isCreating) return;
        setIsCreating(true);

        await projectController.createNewMap();
        
        if (projectController.mapManager) {
            setWorldsList([...projectController.mapManager.mapsList]);
        }

        if (uiController) {
            uiController.notifyListeners('worldsListUpdated'); // Corrigido para notifyListeners
        }

        setIsCreating(false);
    };

    const handleSelectMap = async (mapId) => {
        if (!projectController) return;

        console.log(`[WorldsTab] Selecionando e carregando mapa ID: ${mapId}`); // Corrigida a interpolação

        if (typeof projectController.setCurrentMap === 'function') {
            await projectController.setCurrentMap(mapId); // Adicionado await caso a troca seja assíncrona
        }

        // Notifica todos os ouvintes que o mapa ativo mudou
        if (uiController) {
            uiController.notifyListeners('mapChanged'); // Corrigido para notifyListeners
        }
    };

    return (
        <div className="maps-tab-container">
            <div className="sidebar-section">
                <div 
                    className="sidebar-header" 
                    onClick={() => setExpandedMaps(!expandedMaps)}
                >
                    <span>📁 Mapas e Cenas</span>
                    <span>{expandedMaps ? '▼' : '▶'}</span>
                </div>

                {expandedMaps && (
                    <div className="sidebar-content">
                        <button 
                            className="sidebar-btn-action" 
                            onClick={handleCreateNewMap}
                            disabled={isCreating}
                        >
                            {isCreating ? 'Criando...' : '+ Novo Mapa'}
                        </button>

                        <ul className="sidebar-list">
                            {worldsList.map((mapItem, idx) => {
                                const fileName = mapItem.fileName || mapItem.name || mapItem;
                                const displayName = typeof fileName === 'string' ? fileName.replace('.json', '') : `Mapa ${idx + 1}`;
                                const currentMap = projectController?.getCurrentMap ? projectController.getCurrentMap() : null;
                                const isSelected = currentMap?.name === displayName || currentMap?.fileName === fileName || currentMap?.id === mapItem.id;

                                return (
                                    <li 
                                        key={idx} 
                                        className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => handleSelectMap(mapItem.id || fileName)}
                                    >
                                        <span className="map-name">🗺️ {displayName}</span>
                                        
                                        <div className="map-actions" onClick={(e) => e.stopPropagation()}>
                                            <button title="Renomear" onClick={() => console.log("Renomear", fileName)}>✏️</button>
                                            <button title="Excluir" onClick={() => console.log("Excluir", fileName)}>🗑️</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}