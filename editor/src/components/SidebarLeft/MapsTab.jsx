import React, { useState, useEffect } from 'react';
import './MapsTab.css';

export default function MapsTab({ projectController, uiController, onSelectMap }) {
    const [expandedMaps, setExpandedMaps] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [mapsList, setMapsList] = useState([]);

    useEffect(() => {
        if (!uiController || !projectController) return;

        const updateMaps = () => {
            if (projectController.mapManager && projectController.mapManager.mapsList) {
                const list = projectController.mapManager.mapsList;
                console.log("[MapsTab] Mapas encontrados no MapManager:", list);
                setMapsList([...list]);
            }
        };

        // Tenta carregar caso o projeto já estivesse aberto antes de montar a aba
        updateMaps();

        // Se inscreve no evento do UIController
        const unsubscribe = uiController.subscribe('projectLoaded', () => {
            console.log("[MapsTab] Evento 'projectLoaded' recebido! Atualizando lista...");
            updateMaps();
        });

        const unsubscribeMaps = uiController.subscribe('mapsListUpdated', updateMaps);

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
            setMapsList([...projectController.mapManager.mapsList]);
        }
        if (uiController) {
            uiController.notifyListeners('mapsListUpdated');
        }
        
        setIsCreating(false);
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
                            {mapsList.map((mapItem, idx) => {
                                // Proteção para extrair o nome corretamente independente da estrutura do objeto
                                const fileName = mapItem.fileName || mapItem.name || mapItem;
                                const displayName = typeof fileName === 'string' ? fileName.replace('.json', '') : `Mapa ${idx + 1}`;
                                const isSelected = projectController?.getCurrentMap()?.name === displayName;

                                return (
                                    <li 
                                        key={idx} 
                                        className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => onSelectMap && onSelectMap(fileName)}
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