import React, { useEffect, useRef } from 'react';
import { MapRenderer } from '../core/MapRenderer';

export default function Viewport({ mapData, activeLayerIndex, showGrid, onTileClick }) {
    const canvasRef = useRef(null);
    const mapRendererRef = useRef(null);

    // Único useEffect que cuida da inicialização e de todas as atualizações
    useEffect(() => {
        if (!canvasRef.current) return;

        // 1. Se a instância ainda não existe, cria ela usando mapData ou valores padrão de segurança
        if (!mapRendererRef.current) {
            const mapWidth = mapData?.mapWidth || 20;
            const mapHeight = mapData?.mapHeight || 15;
            const tileSize = mapData?.tileSize || 32;

            mapRendererRef.current = new MapRenderer(canvasRef.current, mapWidth, mapHeight, tileSize);
        
            mapRendererRef.current.render();
        }

        // 2. Sempre atualiza os dados e manda renderizar (se mapData já estiver disponível)
        if (mapData) {
            mapRendererRef.current.updateMapData(mapData, activeLayerIndex, showGrid);
            mapRendererRef.current.render();
        }
    }, [mapData, activeLayerIndex, showGrid]);

    const handleCanvasClick = (event) => {
        if (!mapRendererRef.current) return;

        const clickData = mapRendererRef.current.handleClickEvent(event);

        if (clickData.isOutOfBounds) {
            console.log("Click outside the map bounds.");
            return;
        }

        if (onTileClick) {
            onTileClick(clickData);
        }
    };

    return (
        <div className="viewport-container">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
            />
        </div>
    );
}