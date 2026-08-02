import React, {useRef, useEffect, useState} from 'react';
import TilesetRenderer from '../../../../renderers/TilesetRenderer';
import './TilesetPanel.css';

export default function TilesetPanel({ 
    tilesets = [], 
    activeTileset,
    activeTilesetId, 
    onSelectTileset, 
    activeTool,
    onSelectTool 
}) {

    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    // Instancia o renderer do canvas quando o componente monta
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new TilesetRenderer(canvasRef.current);
        }
    }, []);

    // Atualiza a imagem sempre que o tileset ativo mudar
    useEffect(() => {
        if (rendererRef.current && activeTileset?.imagePath) {
            rendererRef.current.loadTileset(
                activeTileset.imagePath, 
                activeTileset.tileWidth, 
                activeTileset.tileHeight
            ).catch(() => {
                // Tratamento caso falhe o file:// direto, podemos evoluir para fetch blob se precisar
            });
        }
    }, [activeTileset]);


    return (
        <div className="sidebar-section tileset-section">
            {/* Toolbar Superior: Seletor e Ações */}
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
                    <button className="small-action-btn" title="Adicionar Novo Tileset">➕</button>
                    <button className="small-action-btn danger" title="Remover Tileset Atual" disabled={tilesets.length === 0}>🗑</button>
                </div>
            </div>

            {/* Barra de Ferramentas de Pintura */}
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

            {/* Área de Visualização do Tileset Real */}
            <div className="section-content-tileset">
                {!activeTileset ? (
                    <div className="empty-state">
                        <span className="empty-text">Nenhum tileset carregado</span>
                    </div>
                ) : (
                    <div className="tileset-canvas-viewport">
                        <canvas ref={canvasRef} className="tileset-canvas" />
                    </div>
                )}
            </div>
        </div>
    );
}