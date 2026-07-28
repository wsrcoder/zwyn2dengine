import React, { useState, useEffect } from 'react';
import './MapsTab.css';

export default function MapsTab({ projectController, onSelectMap, activeProject }) {
    const [expandedMaps, setExpandedMaps] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [mapsList, setMapsList] = useState([]);

    // Roda exatamente quando o projeto termina de carregar ou o controller muda
    useEffect(() => {
        if (projectController && projectController.mapManager) {
            setMapsList([...projectController.mapManager.mapsList]);
        }
    }, [projectController, activeProject]); // <--- Dispara na hora certa

    const handleCreateNewMap = async () => {
        if (isCreating) return;
        setIsCreating(true);
        
        await projectController.createNewMap();
        
        if (projectController && projectController.mapManager) {
            setMapsList([...projectController.mapManager.mapsList]);
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
                                const fileName = mapItem.name || mapItem;
                                const displayName = fileName.replace('.json', '');
                                const isSelected = projectController.currentMapData?.name === displayName;

                                return (
                                    <li 
                                        key={idx} 
                                        className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => onSelectMap && onSelectMap(fileName)}
                                    >
                                        <span className="map-name">🗺️ {displayName}</span>
                                        
                                        <div className="map-actions" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                title="Renomear" 
                                                onClick={() => console.log("Renomear", fileName)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                title="Excluir" 
                                                onClick={() => console.log("Excluir", fileName)}
                                            >
                                                🗑️
                                            </button>
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