import React from 'react';
import './TilesetPanel.css';

export default function TilesetPanel({ 
    tilesets = [], 
    activeTilesetId, 
    onSelectTileset, 
    onAddTileset, 
    onRemoveTileset,
    activeTool,
    onSelectTool 
}) {
    return (
        <div className="sidebar-section tileset-section">
            {/* Cabeçalho com Seletor de Tileset e Ações de Gerenciamento */}
            <div className="section-header tileset-toolbar-top">
                <select 
                    className="tileset-select"
                    value={activeTilesetId || ''}
                    onChange={(e) => onSelectTileset(e.target.value)}
                >
                    {tilesets.length === 0 ? (
                        <option value="">Nenhum Tileset</option>
                    ) : (
                        tilesets.map(ts => (
                            <option key={ts.id} value={ts.id}>{ts.name}</option>
                        ))
                    )}
                </select>

                <div className="tileset-actions">
                    <button className="small-action-btn" onClick={onAddTileset} title="Adicionar Novo Tileset">➕</button>
                    <button className="small-action-btn danger" onClick={onRemoveTileset} title="Remover Tileset Atual" disabled={tilesets.length === 0}>🗑</button>
                </div>
            </div>

            {/* Barra de Ferramentas de Pintura (Pincel, Balde, etc.) */}
            <div className="painting-toolbar">
                <button 
                    className={`tool-btn ${activeTool === 'brush' ? 'active' : ''}`}
                    onClick={() => onSelectTool('brush')}
                    title="Pincel (Brush)"
                >
                    🖌️
                </button>
                <button 
                    className={`tool-btn ${activeTool === 'bucket' ? 'active' : ''}`}
                    onClick={() => onSelectTool('bucket')}
                    title="Balde de Tinta (Fill)"
                >
                    🪣
                </button>
                <button 
                    className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => onSelectTool('eraser')}
                    title="Borracha (Eraser)"
                >
                    🧹
                </button>
            </div>

            {/* Área de Visualização do Grid de Tiles */}
            <div className="section-content-tileset">
                {tilesets.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-text">Nenhum tileset carregado</span>
                        <button className="action-btn" onClick={+onAddTileset}>Carregar Tileset</button>
                    </div>
                ) : (
                    <div className="tileset-grid-viewport">
                        {/* Aqui vai renderizar a imagem do tileset fatiada em grades */}
                        <span className="placeholder-info">Área de Seleção do Tileset</span>
                    </div>
                )}
            </div>
        </div>
    );
}