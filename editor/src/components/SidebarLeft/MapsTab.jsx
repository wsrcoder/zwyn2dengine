

import React, { useState } from 'react';

import './MapsTab.css';

export default function MapsTab({ projectController, onSelectMap }) {
    const [expandedMaps, setExpandedMaps] = useState(true);

    const mapsList = projectController?.mapsList || [];

    return (
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
                                    onClick={() => {
                                        console.log("[MapsTab] Clicou no mapa:", fileName);
                                        if (onSelectMap) {
                                            onSelectMap(fileName);
                                        }
                                    }}
                                >
                                    🗺️ {displayName}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}