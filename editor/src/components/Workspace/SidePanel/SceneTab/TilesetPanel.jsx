import React, { useRef, useEffect, useState } from 'react';
import TilesetRenderer from '../../../../renderers/TilesetRenderer';
import TilesetInputHandler from '../../../../handlers/TilesetInputHandler';
import { TileToolType } from '../../../../constants/ToolType';
import { EventHandler } from '../../../../core/EventBus';
import { EDITOR_EVENTS } from '../../../../core/EventTypes';
import { TileUtils } from '../../../../utils/TileUtils';
import './TilesetPanel.css';

export default function TilesetPanel({ 
    tilesets = [], 
    activeTileset,
    activeTilesetId, 
    onSelectTileset, 
    projectStore
}) {

    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const handlerRef = useRef(null);

    // Estado local para forçar re-render quando a ferramenta mudar via EventBus
    const [currentTool, setCurrentTool] = useState(() => {
        try {
            return projectStore?.getSession()?.tools?.getActiveTool() || TileToolType.BRUSH;
        } catch {
            return TileToolType.BRUSH;
        }
    });

    // Sincroniza a ferramenta ativa usando o EventBus
    useEffect(() => {
        const unsubscribe = EventHandler.subscribe(EDITOR_EVENTS.TOOL_CHANGED, (newTool) => {
            setCurrentTool(newTool);
        });
        return unsubscribe;
    }, []);

    const handleSelectTool = (toolType) => {
        if (!projectStore) return;
        
        try {
            projectStore.getSession().tools.setActiveTool(toolType);
            EventHandler.notify(EDITOR_EVENTS.TOOL_CHANGED, toolType);
        } catch (error) {
            console.error("Erro ao selecionar ferramenta:", error);
        }
    };

    // Instancia o renderer e consome o tileset diretamente do TilesetCache global da sessão
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new TilesetRenderer(canvasRef.current);
        }

        if (!rendererRef.current || !activeTileset || !projectStore) return;

        // Limpa o handler antigo se houver troca de tileset
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
        }

        const loadAndSetupTileset = async () => {
            try {
                const session = projectStore.getSession();
                const tilesetCache = session?.tilesetCache || projectStore.getTilesetCache();
                const rootPath = session?.rootPath;

                if (!tilesetCache || !rootPath) {
                    console.error("[TilesetPanel] Store ou rootPath inválidos para carregar o tileset.");
                    return;
                }

                // 🚀 BUSCA DO CACHE GLOBAL OU CARREGA DO DISCO SE NÃO ESTIVER LÁ
                // (Usando activeTileset.name já que o tileset não tem ID)
                const tilesetId = activeTileset.name; 

                const cachedEntry = await tilesetCache.getOrLoadTileset(
                    tilesetId, 
                    activeTileset, 
                    rootPath
                );

                if (!cachedEntry || !cachedEntry.image) {
                    console.error(`[TilesetPanel] Falha ao obter a imagem do tileset: ${tilesetId}`);
                    return;
                }

                // Injeta a imagem e as propriedades de tile usando o método que criamos no TilesetRenderer
                if (rendererRef.current) {
                    rendererRef.current.setLoadedImage(
                        cachedEntry.image, 
                        activeTileset.tileWidth || 32, 
                        activeTileset.tileHeight || 32
                    );
                }

                // Desenha o tileset inicialmente sem seleção
                //rendererRef.current.render();

                // Inicializa o Handler de Input
                if (canvasRef.current) {
                    handlerRef.current = new TilesetInputHandler(canvasRef.current, {
                        tileWidth: activeTileset.tileWidth,
                        tileHeight: activeTileset.tileHeight,
                        tilesetMatrix: rendererRef.current.tilesetMatrix, 

                        onSelectionStart: (data) => {
                            EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_STARTED, data);
                        },
                        onSelectionChange: (selectionData) => {
                            if (projectStore) {
                                try {
                                    const session = projectStore.getSession();
                                    const activeWorldId = session.navigation.activeWorldId;
                                    const activeSceneId = session.navigation.activeSceneId;

                                    const sceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
                                    const mapModel = sceneData ? sceneData.data : null;

                                    const tilesets = mapModel?.tilesets || mapModel?.mapTilesets || [];
                                    const activeTs = Array.isArray(tilesets) ? tilesets[0] : tilesets.values?.().next()?.value;
                                    const tsColumns = activeTs?.columns || 1;

                                    const rect = selectionData.sourceRect;
                                    const calculatedTiles = [];

                                    // Pega o firstgid correto do tileset ativo (geralmente 1 se for o primeiro/único)
                                    const firstGid = activeTs?.firstgid || 1;

                                    if (rect && typeof rect.startX === 'number') {
                                        const minX = Math.min(rect.startX, rect.endX);
                                        const maxX = Math.max(rect.startX, rect.endX);
                                        const minY = Math.min(rect.startY, rect.endY);
                                        const maxY = Math.max(rect.startY, rect.endY);

                                        for (let y = minY; y <= maxY; y++) {
                                            for (let x = minX; x <= maxX; x++) {
                                                // Soma o firstgid para alinhar o índice visual da matriz com o motor de renderização
                                                const tileId = (y * tsColumns + x) + firstGid;
                                                calculatedTiles.push(tileId);
                                            }
                                        }
                                    } else {
                                        const rawTiles = selectionData.tiles || [0];
                                        const flatRaw = Array.isArray(rawTiles) ? rawTiles.flat() : [rawTiles];
                                        // Aplica o deslocamento do firstgid caso os tiles crus venham em base 0
                                        const adjustedTiles = flatRaw.map(id => id === 0 ? 0 : id + (firstGid - 1));
                                        calculatedTiles.push(...adjustedTiles);
                                    }

                                    selectionData.tiles = calculatedTiles;
                                    const flattenedTiles = calculatedTiles.flat();

                                    session.tools.setTileSelection(
                                        selectionData.width,
                                        selectionData.height,
                                        flattenedTiles,
                                        selectionData.sourceRect
                                    );
                                } catch (error) {
                                    console.error("Erro ao salvar seleção na store:", error);
                                }
                            }

                            EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_CHANGED, selectionData);

                            if (rendererRef.current) {
                                rendererRef.current.render(selectionData.sourceRect);
                            }
                        },
                        onSelectionEnd: (data) => {
                            EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_ENDED, data);
                        }
                    });
                }

            } catch (err) {
                console.error("Erro ao carregar tileset no painel via cache global:", err);
            }
        };

        loadAndSetupTileset();

        return () => {
            if (handlerRef.current) {
                handlerRef.current.destroy();
                handlerRef.current = null;
            }
        };
    }, [activeTileset, projectStore]);

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
                    className={`tool-btn ${currentTool === TileToolType.BRUSH ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.BRUSH)}
                    title="Pincel (Brush)"
                >
                    🖌️
                </button>
                <button 
                    className={`tool-btn ${currentTool === TileToolType.BUCKET ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.BUCKET)}
                    title="Balde de Tinta (Fill)"
                >
                    🪣
                </button>
                <button 
                    className={`tool-btn ${currentTool === TileToolType.ERASER ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.ERASER)}
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