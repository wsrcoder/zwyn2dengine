import TileMap from "../Data/TileMap.js";
import TileLayer from "../Data/TileLayer.js"; // Certifique-se de importar a classe de layer
import FileLoader from "../../Utils/FileLoader.js";

import TerrainType from "../Data/TerrainType.js";

export default class TiledParser {
    static async parse(tiledJson, mapDirectory = "./Editor/") {
        const map = new TileMap(
            tiledJson.width, tiledJson.height, 
            tiledJson.tilewidth, tiledJson.tileheight
        );

        // Garante que o dicionário lógico de terreno existe no mapa
        map.terrainData = {};

        // 1. PRIMEIRO: Carrega os tilesets e seus metadados (XML/TSX)
        map.tilesets = [];

        if (tiledJson.tilesets && tiledJson.tilesets.length > 0) {
            for (const tset of tiledJson.tilesets) {
                const filename = tset.source || `${tset.name}.tsx`;
                const tsxUrl = `${mapDirectory}${filename}`;
                
                let processedTileset = { ...tset, tileMetadata: {} };

                try {
                    console.log(`Zwyn Engine: Carregando metadados de: ${tsxUrl}`);
                    const xmlDoc = await FileLoader.loadXML(tsxUrl);
                    
                    const tilesetNode = xmlDoc.querySelector("tileset");
                    const imageNode = xmlDoc.querySelector("image");

                    processedTileset = {
                            ...tset,
                            name: tilesetNode.getAttribute("name") || tset.name,
                            tileWidth: parseInt(tilesetNode.getAttribute("tilewidth"), 10) || tset.tilewidth || 32,
                            tileHeight: parseInt(tilesetNode.getAttribute("tileheight"), 10) || tset.tileheight || 32,
                            columns: parseInt(tilesetNode.getAttribute("columns"), 10) || 0,
                            tilecount: parseInt(tilesetNode.getAttribute("tilecount"), 10) || tset.tilecount || 0, // <--- Ajustado para tilecount minúsculo
                            image: imageNode ? imageNode.getAttribute("source") : tset.image,
                            imageWidth: imageNode ? parseInt(imageNode.getAttribute("width"), 10) : 0,
                            imageHeight: imageNode ? parseInt(imageNode.getAttribute("height"), 10) : 0,
                            tileMetadata: this.extractMetadataFromXML(xmlDoc)
                    };
                } catch (error) {
                    console.warn(`Zwyn Engine: Arquivo XML não encontrado/inválido em ${tsxUrl}. Tentando metadados embutidos no JSON...`);
                    
                    processedTileset.tileMetadata = this.extractMetadataFromJSON(tset);
                }

                map.tilesets.push(processedTileset);
                console.log(`Zwyn Engine: Tileset '${processedTileset.name}' processado.`);
            }
        }

        // 2. SEGUNDO: Com os tilesets prontos, processa as camadas do mapa
        const tileLayers = tiledJson.layers.filter(layer => layer.type === "tilelayer");
        map.collisionData = {};
        
        for (const tLayer of tileLayers) {
            const layerType = TiledParser.getLayerType(tLayer);
            const layerName = tLayer.name;
            const layerOpacity = tLayer.opacity !== undefined ? tLayer.opacity : 1.0;

            


            // Instancia a camada base usando o novo formato de objeto de opções
            const baseLayer = new TileLayer({
                name: layerName,
                width: tLayer.width,
                height: tLayer.height,
                tileWidth: map.tilewidth, 
                tileHeight: map.tileheight,
                opacity: layerOpacity
            });

            let occlusionLayer = null;
            let waterOverlayLayer = null;

            // Percorre todos os tiles da camada original
            for (let y = 0; y < tLayer.height; y++) {
                for (let x = 0; x < tLayer.width; x++) {
                    const gid = tLayer.data[x + y * tLayer.width];
                    if (gid === 0) continue;

                    // Define na camada base (Bucket 1 / Ground)
                    baseLayer.setTile(x, y, gid);

                    // Verifica metadados utilizando o map.tilesets populado
                    const metadata = TiledParser.getMetadataForGid(gid, map.tilesets);

                    // LOG DE TESTE: Descubra se o tile achou o metadado
                    if ((metadata && metadata.isWater)) {
                        console.log(`[DEBUG GID ${gid}] Metadado encontrado:`, metadata);
                    }
                    
                    if (metadata) {

                        //dados de colisao
                        if (metadata.isSolid) {
                            map.collisionData[`${x},${y}`] = true; // ou o gid, se preferir
                        }
                        // 1. Oclusão (telhados/árvores) -> Vai para o Overlay (Bucket 3) com opacidade total
                        if (metadata.isOccluder) {
                            if (!occlusionLayer) {
                                occlusionLayer = new TileLayer({
                                    name: `${layerName}_occlusion`,
                                    width: tLayer.width,
                                    height: tLayer.height,
                                    tileWidth: map.tilewidth,
                                    tileHeight: map.tileheight,
                                    opacity: 1.0
                                });
                                map.addOverlayLayer(occlusionLayer); 
                            }
                            occlusionLayer.setTile(x, y, gid);
                        }

                        // 2. Água -> Alimenta o terrainData lógico E vai para o Overlay com opacidade reduzida
                        if (metadata.isWater) {
                            // Registra o dado lógico para a física/gameplay
                            map.terrainData[`${x},${y}`] = TerrainType.WATER;

                            if (!waterOverlayLayer) {
                                waterOverlayLayer = new TileLayer({
                                    type: "foreheadOverlay",
                                    name: `${layerName}_water_foreheadOverlay`,
                                    width: tLayer.width,
                                    height: tLayer.height,
                                    tileWidth: map.tilewidth,
                                    tileHeight: map.tileheight,
                                    opacity: 0.8 // Opacidade customizada para o efeito de líquido
                                });
                                map.addOverlayLayer(waterOverlayLayer);
                            }
                            waterOverlayLayer.setTile(x, y, gid);
                        }


                        if(metadata.isGlass){
                            map.terrainData[`${x},${y}`] = TerrainType.GLASS;
    
                            // Alerta arquitetural: O vidro exige um bucket especial de refração 
                            // ou tratamento de alpha para não bugar a ordem dos sprites e oclusões.
                            // TODO: Implementar camada translúcida de piso ou frustum de visão.
                        }

                        if(metadata.isIce){
                            // Registra o tipo lógico para o sistema de movimento aplicar o "deslize"
                            map.terrainData[`${x},${y}`] = TerrainType.ICE;
                        }
                    }
                }       
            }

            // Adiciona a camada base processada ao mapa no respectivo bucket
            map.addLayer(baseLayer, layerType);
        }

        return map;
    }

    static getMetadataForGid(gid, tilesets) {
        if (gid === 0) return null;

        for (const ts of tilesets) {
            if (gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount) {
                const localId = gid - ts.firstgid;
                return ts.tileMetadata[localId] || {};
            }
        }
        return null;
    }

    static getLayerType(layer) {
        if (!layer.properties) return 'worldGround';
        
        const typeProp = layer.properties.find(p => p.name === 'layerType');
        return typeProp ? typeProp.value : 'worldGround';
    }

    static extractMetadataFromXML(xmlDoc) {
        const metadata = {};
        const tileNodes = xmlDoc.querySelectorAll("tile");

        tileNodes.forEach(tileNode => {
            const localId = parseInt(tileNode.getAttribute("id"), 10);
            const properties = {};

            const propertyNodes = tileNode.querySelectorAll("properties > property");
            propertyNodes.forEach(propNode => {
                const name = propNode.getAttribute("name");
                const type = propNode.getAttribute("type");
                let value = propNode.getAttribute("value");

                // Converte os tipos primitivos corretamente do XML
                if (type === "bool" || value === "true" || value === "false") {
                    value = value === "true";
                } else if (type === "int" || type === "float") {
                    value = Number(value);
                }

                properties[name] = value;
            });

            metadata[localId] = properties;
        });

        return metadata;
    }

    static extractMetadataFromJSON(tset) {
        const metadata = {};
        if (tset.tiles) {
            tset.tiles.forEach(tile => {
                metadata[tile.id] = {};
                if (tile.properties) {
                    tile.properties.forEach(prop => {
                        metadata[tile.id][prop.name] = prop.value;
                    });
                }
            });
        }
        return metadata;
    }

    static parseValue(value, type, propNode) {
        if (type === "list") {
            const items = propNode.getElementsByTagName("item");
            const itemType = propNode.getAttribute("propertytype") || "string";

            return Array.from(items).map(i => {
                const val = i.getAttribute("value");
            
                switch (itemType) {
                    case "int":   return parseInt(val, 10);
                    case "float": return parseFloat(val);
                    case "bool":  return val === "true";
                    case "color": return val;
                    default:      return val;
                }
            });
        }

        if (type === "bool")  return value === "true";
        if (type === "int")   return parseInt(value, 10);
        if (type === "float") return parseFloat(value);
        if (type === "color") return value;
    
        return value;
    }
}