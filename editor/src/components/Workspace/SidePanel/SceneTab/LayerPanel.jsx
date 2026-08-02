import React from 'react';
import './LayerPanel.css';

export default function LayerPanel({ activeScene, layers }) {
    return (
        <div className="sidebar-section">
            <div className="section-header">
                <span>CAMADAS {activeScene ? `(${activeScene.name})` : ''}</span>
                <button className="small-action-btn" title="Nova Camada">+ Nova</button>
            </div>
            
            <div className="section-content-layers">
                {layers.length === 0 ? (
                    <span className="empty-text">
                        {activeScene ? 'Nenhuma camada nesta cena' : 'Nenhuma cena ativa'}
                    </span>
                ) : (
                    <ul className="layers-list">
                        {layers.map((layer, index) => (
                            <li key={layer.id || index} className="layer-item">
                                {/* Drag handle */}
                                <span className="drag-handle" title="Reordenar">⠿</span>

                                {/* Mini tag de identificação no início da linha */}
                                <span className={`layer-type-badge ${layer.type}`}>
                                    {layer.typeLabel}
                                </span>
                                
                                {/* Botão de Visibilidade */}
                                <button className="icon-btn" title="Alternar Visibilidade">👁</button>
                                
                                {/* Nome da Camada */}
                                <span className="layer-name">{layer.name || `Camada ${index + 1}`}</span>
                                
                                {/* Ações à direita */}
                                <div className="layer-actions">
                                    <button className="icon-btn" title="Bloquear">🔓</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}