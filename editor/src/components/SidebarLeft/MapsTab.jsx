import React, { useState } from 'react';
import './MapsTab.css';

export default function MapsTab({ projectController, onSelectMap }) {
    const [expandedMaps, setExpandedMaps] = useState(true);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, mapName: null });

    const mapsList = projectController?.mapsList || [];

    // Trancar o menu de contexto padrão do navegador e abrir o nosso
    const handleContextMenu = (e, fileName) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            mapName: fileName
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, mapName: null });
    };

    return (
        <div className="maps-tab-container" onClick={closeContextMenu}>
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
                        <button className="sidebar-btn-action" onClick={() => console.log("Criar novo mapa")}>
                            + Novo Mapa
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
                                        onContextMenu={(e) => handleContextMenu(e, fileName)}
                                    >
                                        <span className="map-name">🗺️ {displayName}</span>
                                        
                                        {/* Ações rápidas no Hover */}
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

            {/* Menu de Contexto Flutuante (Botão Direito) */}
            {contextMenu.visible && (
                <ul 
                    className="context-menu" 
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <li onClick={() => { console.log("Abrir", contextMenu.mapName); }}>Abrir Mapa</li>
                    <li onClick={() => { console.log("Duplicar", contextMenu.mapName); }}>Duplicar</li>
                    <li onClick={() => { console.log("Renomear", contextMenu.mapName); }}>Renomear</li>
                    <hr />
                    <li className="danger" onClick={() => { console.log("Excluir", contextMenu.mapName); }}>Excluir</li>
                </ul>
            )}
        </div>
    );
}