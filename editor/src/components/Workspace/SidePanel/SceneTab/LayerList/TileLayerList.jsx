
import React from 'react';
import {LayerCategoryEnum} from "../../../../../constants/Enums.js";

export default function TileLayerList({ activeScene, sceneHandlers, onLayerSelect, activeLayerIndex }) {
    // Pega as camadas de tile do SceneModel ou array vazio se não houver cena
    const tileLayers = activeScene?.tileLayers || [];

    const handleAddTileLayer = async () => {
        if (!activeScene || !sceneHandlers) return;

        // O componente React agora fica "burro" e apenas delega a ação ao handler
        const result = await sceneHandlers.handleAddLayer(LayerCategoryEnum.TILE, activeScene.id);
        
        if (!result.success) {
            console.error("[TileLayerList]", result.message);
            // Futuramente, aqui você pode disparar um Toast de erro na UI
        }
    };

    const handleToggleVisibility = async (e, layerId) => {
        e.stopPropagation(); // Evita que o clique selecione a camada ao tentar ocultar
        if (!activeScene || !sceneHandlers) return;

        const result = await sceneHandlers.handleToggleLayerVisibility(layerId, activeScene.id);
        
        if (!result.success) {
            console.error("[TileLayerList]", result.message);
        }
    };

    return (
        <div className="sidebar-section">
            {/* Toolbar superior exclusiva da aba Tile */}
            <div className="section-header">
                <span>MAP LAYERS ({tileLayers.length})</span>
                <button 
                    className="small-action-btn" 
                    title="Adicionar Nova Camada de Tile"
                    onClick={handleAddTileLayer}
                >
                    + Nova
                </button>
            </div>

            {/* Conteúdo da Lista */}
            <div className="section-content-layers">
                {tileLayers.length === 0 ? (
                    <span className="empty-text">
                        {activeScene ? 'Nenhuma camada de tile' : 'Nenhuma cena ativa'}
                    </span>
                ) : (
                    <ul className="layers-list">
                        {tileLayers.map((layer, index) => {
                            const isActive = activeLayerIndex === index;
                            return (
                                <li 
                                    key={layer.id || index} 
                                    className={`layer-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onLayerSelect && onLayerSelect(index)}
                                >
                                    {/* Drag handle */}
                                    <span className="drag-handle" title="Reordenar">⠿</span>

                                    {/* Mini tag de identificação */}
                                    <span className="layer-type-badge tile">
                                        TILE
                                    </span>
                                    
                                    {/* Botão de Visibilidade usando o Handler */}
                                    <button 
                                        className="icon-btn" 
                                        title="Alternar Visibilidade"
                                        onClick={(e) => handleToggleVisibility(e, layer.id)}
                                    >
                                        {layer.visible !== false ? '👁' : '👁‍🗨'}
                                    </button>
                                    
                                    {/* Nome da Camada */}
                                    <span className="layer-name">{layer.name || `Camada ${index + 1}`}</span>
                                    
                                    {/* Ações à direita */}
                                    <div className="layer-actions">
                                        <button className="icon-btn" title="Bloquear">🔓</button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}