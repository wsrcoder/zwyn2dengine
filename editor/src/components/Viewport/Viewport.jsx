import React, { useEffect, useRef } from 'react';
import { MapRenderer } from '../../core/MapRenderer';

import './viewport.css';

export default function Viewport({ mapDataModel, activeLayerIndex, showGrid, onTileClick }) {
    const canvasRef = useRef(null);
    const mapRendererRef = useRef(null);

    // Inicializa o MapRenderer uma única vez na montagem do componente
    useEffect(() => {
        if (!canvasRef.current) return;

        const columns = mapDataModel?.columns || 20;
        const rows = mapDataModel?.rows || 15;
        const tileWidth = mapDataModel?.tile?.width || 32;

        mapRendererRef.current = new MapRenderer(canvasRef.current, columns, rows, tileWidth);
    }, []);

    // Cuida de carregar a imagem do tileset, atualizar os dados e renderizar sempre que o mapa ou as propriedades mudarem
    useEffect(() => {
        if (!mapRendererRef.current || !canvasRef.current) return;
        if (!mapDataModel || !mapDataModel.tilesets || mapDataModel.tilesets.length === 0) return;

        // Atualiza os dados e configurações iniciais no renderer
        mapRendererRef.current.updateMapData(mapDataModel, activeLayerIndex, showGrid);

        // Itera sobre os tilesets do mapa para carregar suas respectivas imagens
        mapDataModel.tilesets.forEach(tileset => {
            const img = new Image();
            
            // O caminho utiliza o nome do arquivo da imagem definido no model (ex: RiverForest001.png)
            img.src = `/templates/default-project/Assets/Tilesets/${tileset.name}.png`;
            console.log("img src: " + img);

            img.onload = () => {
                console.log(`Imagem do tileset [${tileset.name}] carregada com sucesso!`);
                
                // Injeta a imagem carregada no MapRenderer usando o nome do tileset
                mapRendererRef.current.setTilesetImage(tileset.name, img);
                
                // Manda renderizar novamente após a imagem estar pronta
                mapRendererRef.current.render();
            };

            img.onerror = (err) => {
                console.error(`Erro ao carregar a imagem do tileset [${tileset.name}]:`, err);
            };
        });

        // Renderiza imediatamente (caso a imagem já estivesse em cache ou para desenhar o grid/camadas vazias)
        mapRendererRef.current.render();

    }, [mapDataModel, activeLayerIndex, showGrid]);

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