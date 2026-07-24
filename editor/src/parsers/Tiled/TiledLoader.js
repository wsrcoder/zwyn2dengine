
export class TiledLoader {
    /**
     * Carrega o JSON do mapa, resolve os arquivos .tsx externos e converte tudo para um JSON unificado.
     * @param {string} dirPath - Diretório onde o mapa está salvo
     * @param {string} fileName - Nome do arquivo JSON do mapa
     */
    static async loadTiledJsonMap(dirPath, fileName) {
        try {
            const fullFilePath = `${dirPath}/${fileName}`.replace(/\\/g, '/');
            
            // 1. Carrega o JSON principal do mapa
            const jsonResult = await window.electronAPI.loadTextFile(fullFilePath);
            
            if (!jsonResult.success) {
                throw new Error(jsonResult.error);
            }

            const rawMapData = JSON.parse(jsonResult.data);
            const baseDir = dirPath.replace(/\\/g, '/');


            // 2. Processa os tilesets de forma explícita
            const processedTilesets = [];

            if (rawMapData.tilesets && Array.isArray(rawMapData.tilesets)) {
                for (const tilesetRef of rawMapData.tilesets) {
                    
                    let finalTilesetData = {};

                    // Se for um tileset externo .tsx
                    if (tilesetRef.source && tilesetRef.source.endsWith('.tsx')) {
                        const fullTsxPath = `${baseDir}/${tilesetRef.source}`;
                        console.log(`Carregando e convertendo Tileset externo: ${fullTsxPath}`);
                        
                        const xmlResult = await window.electronAPI.loadTextFile(fullTsxPath);
                        

                        if (xmlResult.success) {
                            const tsxJson = this._parseTsxXmlToJson(xmlResult.data);
                            
                            
                            // Monta explicitamente o tileset vindo do XML + firstgid do mapa
                            finalTilesetData = {
                                firstgid: tilesetRef.firstgid,
                                source: tilesetRef.source, // Opcional: mantemos a referência original se quiser
                                name: tsxJson.name,
                                tilewidth: tsxJson.tilewidth,
                                tileheight: tsxJson.tileheight,
                                spacing: tsxJson.spacing,
                                margin: tsxJson.margin,
                                tilecount: tsxJson.tilecount,
                                columns: tsxJson.columns,
                                image: tsxJson.image,
                                imagewidth: tsxJson.imagewidth,
                                imageheight: tsxJson.imageheight,
                                tiles: tsxJson.tiles // Propriedades customizadas (isWater, isSolid, etc.)
                            };

                        } else {
                            console.error(`Erro ao carregar o tileset ${tilesetRef.source}:`, xmlResult.error);
                        }
                    } else {
                        // Caso seja um tileset embutido (embedded) nativo do JSON
                        finalTilesetData = {
                            firstgid: tilesetRef.firstgid,
                            name: tilesetRef.name || "embedded",
                            tilewidth: tilesetRef.tilewidth,
                            tileheight: tilesetRef.tileheight,
                            tilecount: tilesetRef.tilecount,
                            columns: tilesetRef.columns,
                            image: tilesetRef.image,
                            imagewidth: tilesetRef.imagewidth,
                            imageheight: tilesetRef.imageheight,
                            tiles: tilesetRef.tiles || {}
                        };
                    }

                    processedTilesets.push(finalTilesetData);
                }
            }

            // 3. Reconstrói o resultado final do mapa de forma 100% explícita
            const result = {
                width: rawMapData.width,
                height: rawMapData.height,
                tilewidth: rawMapData.tilewidth,
                tileheight: rawMapData.tileheight,
                infinite: rawMapData.infinite || false,
                orientation: rawMapData.orientation,
                renderorder: rawMapData.renderorder,
                tiledversion: rawMapData.tiledversion,
                type: rawMapData.type,
                version: rawMapData.version,
                layers: rawMapData.layers || [], // Camadas de mapa (tilelayers, objectgroups, etc.)
                tilesets: processedTilesets
            };

            console.log(result);
            return {sucess: true, data: result}; 

        } catch (error) {

            return {sucess: false, error: error.message};
        }
    }
    /**
     * Auxiliar privado para converter a string XML de um arquivo .tsx em um objeto JSON
     * @param {string} xmlString - O conteúdo cru do arquivo .tsx
     */
    static _parseTsxXmlToJson(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const tilesetNode = xmlDoc.querySelector("tileset");
        const imageNode = xmlDoc.querySelector("image");

        // 1. Extrai propriedades individuais dos tiles (ex: isWater, isSolid, isOccluder)
        const tilesData = {};
        const tileNodes = xmlDoc.querySelectorAll("tile");

        tileNodes.forEach(tileNode => {
            const tileId = parseInt(tileNode.getAttribute("id"), 10);
            const properties = {};

            const propertyNodes = tileNode.querySelectorAll("property");
            propertyNodes.forEach(propNode => {
                const name = propNode.getAttribute("name");
                const type = propNode.getAttribute("type");
                let value = propNode.getAttribute("value");

                // Converte os tipos corretamente para JavaScript
                if (type === "bool") {
                    value = value === "true";
                } else if (type === "int" || type === "float") {
                    value = Number(value);
                }

                properties[name] = value;
            });

            if (Object.keys(properties).length > 0) {
                tilesData[tileId] = { properties };
            }
        });

        // 2. Retorna o objeto JSON unificado do tileset
        return {
            name: tilesetNode ? tilesetNode.getAttribute("name") : "unknown",
            tilewidth: tilesetNode ? parseInt(tilesetNode.getAttribute("tilewidth"), 10) : 32,
            tileheight: tilesetNode ? parseInt(tilesetNode.getAttribute("tileheight"), 10) : 32,
            spacing: tilesetNode ? parseInt(tilesetNode.getAttribute("spacing") || "0", 10) : 0,
            margin: tilesetNode ? parseInt(tilesetNode.getAttribute("margin") || "0", 10) : 0,
            tilecount: tilesetNode ? parseInt(tilesetNode.getAttribute("tilecount"), 10) : 0,
            columns: tilesetNode ? parseInt(tilesetNode.getAttribute("columns"), 10) : 0,
            image: imageNode ? imageNode.getAttribute("source") : null,
            imagewidth: imageNode ? parseInt(imageNode.getAttribute("width"), 10) : 0,
            imageheight: imageNode ? parseInt(imageNode.getAttribute("height"), 10) : 0,
            tiles: tilesData // <-- Aqui entram todas as propriedades de colisão/água mapeadas por ID!
        };
    }
}