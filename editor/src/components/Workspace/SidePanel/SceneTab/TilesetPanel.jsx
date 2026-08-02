
import React, { useRef, useEffect } from 'react';
import TilesetRenderer from '../../../../renderers/TilesetRenderer';
import TilesetInputHandler from '../../../../handlers/TilesetInputHandler';
import { TileToolType } from '../../../../constants/ToolType';
// Importe a sua store ou o mecanismo de gerenciamento de estado aqui:
// import { projectStore } from '../../../../store/ProjectStore'; 
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
    const handlerRef = useRef(null);

    // Instancia o renderer do canvas quando o componente monta
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new TilesetRenderer(canvasRef.current);
        }

        return () => {
            // Limpeza geral ao desmontar
            if (handlerRef.current) handlerRef.current.destroy();
        };
    }, []);

    // Atualiza a imagem e o handler de input sempre que o tileset ativo mudar
    useEffect(() => {
        if (!rendererRef.current || !activeTileset?.imagePath) return;

        // Limpa o handler antigo se houver troca de tileset
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
        }

        rendererRef.current.loadTileset(
            activeTileset.imagePath, 
            activeTileset.tileWidth, 
            activeTileset.tileHeight
        ).then(() => {
            // Desenha o tileset inicialmente sem seleção
            rendererRef.current.render();

            // Inicializa o Handler de Input agora que o canvas tem dimensões e dados reais
            if (canvasRef.current) {
                handlerRef.current = new TilesetInputHandler(canvasRef.current, {
                    tileWidth: activeTileset.tileWidth,
                    tileHeight: activeTileset.tileHeight,
                    tilesetMatrix: rendererRef.current.tilesetMatrix, // se houver gerado no renderer

                    onSelectionChange: (selectionData) => {
                        // 1. Atualiza a store / ToolState (substitua pelo seu caminho real da store)
                        /*
                        projectStore.getSession().tools.setTileSelection(
                            selectionData.width,
                            selectionData.height,
                            selectionData.tiles,
                            selectionData.sourceRect
                        );
                        */
                        console.log("Seleção atualizada:", selectionData);

                        // 2. Pede para o renderer redesenhar a imagem + o retângulo de seleção
                        if (rendererRef.current) {
                             rendererRef.current.render(selectionData.sourceRect);
                        }
                    }
                });
            }
        }).catch(() => {});

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

            {/* Barra de Ferramentas de Pintura (Modos de Edição) */}
            <div className="painting-toolbar">
                <button 
                    className={`tool-btn ${activeTool === TileToolType.BRUSH ? 'active' : ''}`}
                    onClick={() => onSelectTool(TileToolType.BRUSH)}
                    title="Pincel (Brush)"
                >
                    🖌️
                </button>
                <button 
                    className={`tool-btn ${activeTool === TileToolType.BUCKET ? 'active' : ''}`}
                    onClick={() => onSelectTool(TileToolType.BUCKET)}
                    title="Balde de Tinta (Fill)"
                >
                    🪣
                </button>
                <button 
                    className={`tool-btn ${activeTool === TileToolType.ERASER ? 'active' : ''}`}
                    onClick={() => onSelectTool(TileToolType.ERASER)}
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