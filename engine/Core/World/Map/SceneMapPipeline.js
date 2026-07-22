
import TerrainType from "../Data/TerrainType.js";
import WaterWavesEffect from "../../Effects/WaterWavesEffect.js";
import Config from "../../Config.js";

export default class SceneMapPipeline {
    constructor() {}

    /**
     * Constrói a fila de comandos de renderização.
     * @returns {Array} Uma lista de objetos que a Screen sabe processar.
     */
    build({ tileMap, entities, camera, tilesetImage, debugTarget }) {

        const renderQueue = [];
        const tset = tileMap.tilesets[0];
        const mapTileW = parseInt(tileMap.tileWidth || tileMap.tilewidth, 10);
        const mapTileH = parseInt(tileMap.tileHeight || tileMap.tileheight, 10);
        const tsetColumns = parseInt(tset.columns, 10);
        const tsetTileW = parseInt(tset.tileWidth || tset.tilewidth, 10);
        const tsetTileH = parseInt(tset.tileHeight || tset.tileheight, 10);
        const bounds = camera.getVisibleTileBounds(mapTileW, mapTileH);

        // Função interna para processar camadas normais (Buckets 0, 1, etc.)
        const processLayer = (layer) => {
            for (let row = bounds.startY; row < bounds.endY; row++) {
                for (let col = bounds.startX; col < bounds.endX; col++) {
                    const tileId = layer.getTile(col, row);
                    if (!tileId || tileId === 0) continue;

                    const localId = tileId - tset.firstgid;
                    renderQueue.push({
                        type: 'TILE',
                        image: tilesetImage,
                        opacity: layer.opacity,
                        srcX: (localId % tsetColumns) * tsetTileW,
                        srcY: Math.floor(localId / tsetColumns) * tsetTileH,
                        srcW: tsetTileW, srcH: tsetTileH,
                        destX: (col * mapTileW) - camera.x,
                        destY: (row * mapTileH) - camera.y,
                        destW: mapTileW, destH: mapTileH
                    });
                }
            }
        };

        // --- A MÁGICA DOS BUCKETS ---
        for (let i = 0; i < tileMap.buckets.length; i++) {
            const bucket = tileMap.buckets[i];

            // 1. Processa as camadas de tile normais (para os buckets que não exigem oclusão especial)
            if (i !== 3 && bucket && bucket.length > 0) {
                for (const layer of bucket) {
                    if (layer.visible) {
                        processLayer(layer);
                    }
                }
            }

            // 2. Insere as Entidades e o DebugTarget nativamente no Bucket de Entidades (ID 2)
            if (i === 2) {
                const sortedEntities = entities.getSortedList(); // Ordenação automática

                sortedEntities.forEach(entity => {
                    // 1. Verifica se a entidade está se movendo e se está na água para gerar o efeito
                    if (entity.isMoving && entity.isInWater) {
                        entity.splashTimer = (entity.splashTimer || 0) + 1;
            
                        // A cada 10 frames de movimento na água, cria uma nova marola
                        if (entity.splashTimer >= 10) {
                            entity.splashTimer = 0;
                
                        if (!entity.waterWaves) entity.waterWaves = [];
                
                            // Posição exata no centro inferior dos pés
                            const footX = entity.x + (entity.width / 2);
                            const footY = entity.y + entity.height;
                
                            entity.waterWaves.push(new WaterWavesEffect(footX, footY));
                        }
                    }

                    // 2. Atualiza e envia as ondas/marolas para a renderQueue (desenhadas nos pés, logo abaixo do sprite ou junto)
                    if (entity.waterWaves && entity.waterWaves.length > 0) {
                        entity.waterWaves.forEach(wave => {
                            wave.update();

                            renderQueue.push({
                                type: 'ELLIPSE', // Ou 'CIRCLE' dependendo do suporte da sua Screen
                                color: `rgba(255, 255, 255, ${wave.life * 0.5})`, // Branco translúcido sumindo suavemente
                                x: wave.x - camera.x,
                                y: wave.y - camera.y,
                                radiusX: wave.radiusX,
                                radiusY: wave.radiusY
                            });
                        });

                        // Limpa as ondas que já terminaram o tempo de vida
                        entity.waterWaves = entity.waterWaves.filter(wave => !wave.isDead());
                    }

                    // 3. Desenha o sprite da entidade normalmente
                    if (entity.sprite) {
                        renderQueue.push({
                            type: 'SPRITE',
                            sprite: entity.sprite,
                            destX: entity.x - camera.x,
                            destY: entity.y - camera.y
                        });
                    }
                });

                if (debugTarget) {
                    renderQueue.push({
                        type: 'RECT',
                        color: 'blue',
                        x: debugTarget.x - camera.x,
                        y: debugTarget.y - camera.y,
                        width: debugTarget.width,
                        height: debugTarget.height
                    });
                }
            }

            // 3. Processamento especial do Bucket 3 com Oclusão Dinâmica por Y (para arbustos) + Água Fixa
            if (i === 3 && bucket && bucket.length > 0) {
                const allEntities = entities.getSortedList();

                for (const layer of bucket) {
                    if (!layer.visible) continue;

                    for (let row = bounds.startY; row < bounds.endY; row++) {
                        
                        let rowShouldHide = false;
                        let triggeringCol = -1;
                        let activeEntity = null;

                        for (const entity of allEntities) {
                            const entityFeetY = entity.y + (entity.height || 0);
                            const tileWorldY = row * mapTileH;
                            const tileBaseY = tileWorldY + mapTileH;

                            if (entityFeetY > tileBaseY - 32) {
                                const entityCol = Math.floor((entity.x + (entity.width / 2)) / mapTileW);
                                if (entityCol >= bounds.startX && entityCol < bounds.endX) {
                                    rowShouldHide = true;
                                    triggeringCol = entityCol;
                                    activeEntity = entity;
                                    break;
                                }
                            }
                        }

                        for (let col = bounds.startX; col < bounds.endX; col++) {
                            const tileId = layer.getTile(col, row);
                            if (!tileId || tileId === 0) continue;

                            let skipTile = false;
                            let customSrcH = null; // Usado para encolher o tile da água verticalmente

                            const isWater = tileMap.terrainData && 
                                            tileMap.terrainData[col] && 
                                            tileMap.terrainData[col][row] === TerrainType.WATER;

                            if (rowShouldHide) {
                                if (isWater) {
                                    const entityLeft = activeEntity.x;
                                    const entityRight = activeEntity.x + (activeEntity.width || 0);
                                    const tileLeft = col * mapTileW;
                                    const tileRight = tileLeft + mapTileW;

                                    if (entityLeft < tileRight && entityRight > tileLeft) {
                                        const tileWorldY = row * mapTileH;
                                        const entityFeetY = activeEntity.y + (activeEntity.height || 0);
                                        
                                        // O quanto o pé do player invadiu o tile a partir do topo dele (0 a mapTileH)
                                        const penetrationY = entityFeetY - tileWorldY;

                                        // Queremos que a água cubra apenas os pés (ex: os últimos 12 a 16 pixels de baixo para cima).
                                        // Conforme o player sobe ou desce, ajustamos dinamicamente o quanto do tile desenhamos.
                                        let targetWaterHeight = 16; // Altura base da água cobrindo os pés

                                        // Se o player está na parte mais alta do tile (entrando por cima), 
                                        // a água precisa ser menor para não cobrir o peito dele.
                                        if (penetrationY > 0 && penetrationY < mapTileH) {
                                            // Faz a água acompanhar suavemente a profundidade do passo
                                            targetWaterHeight = Math.min(penetrationY, 18);
                                        }

                                        if (targetWaterHeight > 0) {
                                            const ratio = targetWaterHeight / mapTileH;
                                            customSrcH = tsetTileH * ratio;
                                        }
                                    }
                                } else {
                                    // Para arbustos, continua a regra normal de apagar a largura de 3 tiles
                                    if (Math.abs(col - triggeringCol) <= 1) {
                                        skipTile = true;
                                    }
                                }
                            }

                            // Se não deve pular o tile inteiro, envia para a renderQueue
                            if (!skipTile) {
                                const tileWorldX = col * mapTileW;
                                const tileWorldY = row * mapTileH;
                                const localId = tileId - tset.firstgid;
                                
                                let finalSrcH = tsetTileH;
                                let finalDestH = mapTileH;
                                let finalDestY = tileWorldY - camera.y;

                                // Se for o corte parcial da água, ajustamos a altura de origem e destino na tela
                                if (customSrcH !== null) {
                                    finalSrcH = customSrcH;
                                    finalDestH = mapTileH * (customSrcH / tsetTileH);
                                    // Mantém a água ancorada na base inferior do tile
                                    finalDestY = (tileWorldY + mapTileH - finalDestH) - camera.y;
                                }

                                renderQueue.push({
                                    type: 'TILE',
                                    image: tilesetImage,
                                    opacity: layer.opacity,
                                    srcX: (localId % tsetColumns) * tsetTileW,
                                    srcY: Math.floor(localId / tsetColumns) * tsetTileH,
                                    srcW: tsetTileW, 
                                    srcH: finalSrcH,
                                    destX: tileWorldX - camera.x,
                                    destY: finalDestY,
                                    destW: mapTileW, 
                                    destH: finalDestH
                                });
                            }
                        }
                    }
                }
            }
        }

        return renderQueue;
    }
}