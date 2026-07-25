import React, { useEffect, useRef } from 'react';
import { MapRenderer } from '../../renderers/MapRenderer';
import './Viewport.css';

export default function Viewport({ editorController, mapDataModel }) {
    const canvasRef = useRef(null);
    const mapRendererRef = useRef(null);
    const tilesetImagesRef = useRef({}); // Cache para evitar recarregar imagens toda vez

    // 1. Inicializa o MapRenderer e vincula ao Controller uma única vez
    useEffect(() => {
        if (!canvasRef.current || !editorController) return;

        const columns = mapDataModel?.columns || 20;
        const rows = mapDataModel?.rows || 15;
        const tileWidth = mapDataModel?.tile?.width || 32;

        const renderer = new MapRenderer(canvasRef.current, columns, rows, tileWidth);
        mapRendererRef.current = renderer;
        editorController.setMapRenderer(renderer);

        // Inscreve-se para escutar atualizações do mapa vindas do controller
        const unsubscribe = editorController.subscribe('mapUpdated', (updatedMap) => {
            if (mapRendererRef.current) {
                mapRendererRef.current.updateMapData(updatedMap);
                mapRendererRef.current.render();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [editorController]);

    // 2. Gerencia o carregamento das imagens dos tilesets (Apenas quando o mapa/tilesets mudam de fato)
    useEffect(() => {
        if (!mapRendererRef.current || !mapDataModel) return;

        const activeLayer = editorController ? editorController.activeLayer : { category: 'mapLayers', index: 0 };
        mapRendererRef.current.updateMapData(mapDataModel, activeLayer, true);

        if (!mapDataModel.tilesets || mapDataModel.tilesets.length === 0) {
            mapRendererRef.current.render();
            return;
        }

        mapDataModel.tilesets.forEach(tileset => {
            if (!tileset.name || tileset.name === 'unknow') return;

            // Se a imagem já foi carregada antes, reaproveita do cache
            if (tilesetImagesRef.current[tileset.name]) {
                mapRendererRef.current.setTilesetImage(tileset.name, tilesetImagesRef.current[tileset.name]);
                mapRendererRef.current.render();
                return;
            }

            const img = new Image();
            img.src = `../../Assets/Tilesets/${tileset.image?.name || tileset.name}`;

            img.onload = () => {
                console.log(`[Viewport] Tileset [${tileset.name}] carregado com sucesso.`);
                tilesetImagesRef.current[tileset.name] = img; // Guarda no cache
                mapRendererRef.current.setTilesetImage(tileset.name, img);
                mapRendererRef.current.render();
            };

            img.onerror = (err) => {
                console.error(`[Viewport] Erro ao carregar tileset [${tileset.name}]:`, err);
            };
        });

        mapRendererRef.current.render();

    }, [mapDataModel]); // Depende apenas do mapDataModel estrutural, evitando recargas desnecessárias

    // 3. Tratamento de cliques e pintura
    const handleCanvasClick = (event) => {
        if (!mapRendererRef.current || !editorController) return;

        const clickData = mapRendererRef.current.handleClickEvent(event);

        if (clickData.isOutOfBounds) return;

        editorController.paintTile(clickData.tileX, clickData.tileY);
    };

    return (
        <div className="viewport-container">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ display: 'block', cursor: 'crosshair' }}
            />
        </div>
    );
}