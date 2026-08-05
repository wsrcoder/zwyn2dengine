
import {ProjectParams} from "../constants/ProjectParams";
import SceneModel from "../models/Scene/SceneModel";
import SceneState from "../core/SceneState";

import {LayerCategoryEnum} from "../constants/Enums.js";

/**
 * src/services/SceneService.js
 */
export default class SceneService {
    
    constructor() {

    }

    createScene(session, columns, rows) {
        try {
            const activeWorldId = session.navigation?.activeWorldId;
            if (activeWorldId === null || activeWorldId === undefined) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado para criar a cena.",
                    data: null
                };
            }
    
            // Busca o mundo ativo na árvore de dados do projeto
            const world = session.project.getWorldById(activeWorldId);
            if (!world) {
                return {
                    success: false,
                    message: `Mundo com ID ${activeWorldId} não foi encontrado no projeto.`,
                    data: null
                };
            }
    
            if (!world.scenes) {
                world.scenes = [];
            }
    
            // Calcula o ID com base nas cenas do mundo ativo
            const newId = world.scenes.length > 0 ? Math.max(...world.scenes.map(m => m.id)) + 1 : 1;
            const newName = `Scene${newId}`;
            const newFileName = `W${world.id}S${newId}.json`;
    
            const newSceneMeta = {
                id: newId,
                worldId: world.id,
                type: "scene",
                name: newName,
                fileName: newFileName,
                columns: columns,
                rows: rows
            };
    
            // Adiciona na lista de metadados de cenas do mundo
            world.scenes.push(newSceneMeta);
    
            const default_tileset = 'TTD1'; // Mantendo o mesmo padrão de tileset
            const defaultRawMap = {
                id: newId,
                worldId: world.id,
                name: newName,
                columns: columns,
                rows: rows,
                tile: { width: ProjectParams.TILE_SIZE, height: ProjectParams.TILE_SIZE },
                orientation: ProjectParams.MAP_ORIENTATION,
                renderorder: ProjectParams.MAP_RENDER_ORDER,
    
                tilesets: [
                    {
                        firstgid: 1,
                        name: default_tileset,
                        columns: 32,
                        rows: 32,
                        image: { fileName: default_tileset + ".png", width: 1024, height: 1024 },
                        tile: { width: ProjectParams.TILE_SIZE, height: ProjectParams.TILE_SIZE, count: (image.width / ProjectParams.TILE_SIZE * image.height / ProjectParams.TILE_SIZE) },
                        properties: {}
                    }
                ],
    
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                tileLayers: [{ id: 0, name: 'Tile Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                terrainLayers: [{ id: 0, name: 'Terrain Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                 eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
            };
    
            // Instancia o novo modelo
            const newSceneModel = new SceneModel(defaultRawMap);
    
            // Garante que o workingScenes existe na session
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }
    
            session.workingScenes.setScene(world.id, newId, {
                worldId: world.id, // Referência limpa de qual mundo essa cena pertence
                data: newSceneModel,
                fileName: newFileName,
                isModified: true,
                isDeleted: false
            });
    
            // Atualiza os ponteiros de navegação e flag de modificação
            session.navigation.activeSceneId = newId;
            session.isModified = true;
    
            console.log(`[worldService] Nova cena criada em cache: ${newName} no mundo ID ${activeWorldId}`);
                
            return {
                success: true,
                message: "Cena criada com sucesso no service.",
                data: newSceneModel
            };
    
        } catch (error) {
            console.error("[worldService] Erro ao criar nova cena:", error);
            return {
                success: false,
                message: `Erro interno no service ao criar cena: ${error.message}`,
                data: null
            };
        }
    }

    async updateScene(sceneModel, sceneData) {
        Object.assign(sceneModel, sceneData);
        return sceneModel;
    }

     /**
    * Marca uma cena como deletada apenas no cache da sessão.
    * A cena some da interface, mas seus dados e o ProjectModel 
    * permanecem intactos até que o projeto seja salvo de fato.
    */
    async deleteScene(session, sceneId) {
        try {
            const activeWorldId = session.navigation?.activeWorldId;
            if (activeWorldId === null || activeWorldId === undefined) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado para deletar a cena.",
                    data: null
                };
            }
    
            const world = session.project.getWorldById(activeWorldId);
            if (!world || !world.scenes) {
                return {
                    success: false,
                    message: "Mundo ativo não encontrado ou sem cenas.",
                    data: null
                };
            }
    
            // Verifica se a cena realmente existe no projeto
            const sceneExists = session.project.getSceneById(sceneId);
            if (!sceneExists) {
                return {
                    success: false,
                    message: `Scene ID ${sceneId} não encontrada no projeto.`,
                    data: null
                };
            }
    
            // Garante que o Map de workingScenes existe
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }
    
            // Marca como deletada APENAS no cache da sessão (mantém o ProjectModel intacto até o Save)
            let cachedScene = session.workingScenes.getScene(sceneId);
            if (cachedScene) {
                cachedScene.isDeleted = true;
                cachedScene.isModified = true;
            } else {
                // Se a cena não estava carregada no cache, injetamos ela lá só com a flag de deleção
                session.workingScenes.setScene(world.id, sceneId, {
                    worldId: world.id,
                    sceneId: sceneId,
                    fileName: sceneExists.fileName,
                    data: null,
                    isDeleted: true,
                    isModified: true,
                        
                });
            }
    
            // Se a cena deletada era a ativa, limpa a seleção da navegação
            if (session.navigation.activeSceneId === sceneId) {
                session.navigation.activeSceneId = null;
            }
    
            // Marca o projeto como modificado para acionar o botão de salvar
            session.isModified = true;
    
            console.log(`[worldService] Cena ID ${sceneId} marcada para exclusão no cache.`);
                
            return {
                success: true,
                message: "Cena marcada para exclusão com sucesso.",
                data: { sceneId }
            };
    
        } catch (error) {
            console.error("[worldService] Erro ao marcar cena para exclusão:", error);
            return {
                success: false,
                message: `Erro interno no service ao deletar cena: ${error.message}`,
                data: null
            };
        }
    }

    async addBackgroundLayer(sceneModel, layerData) {
        const index = sceneModel.backgroundLayers.length;
        const newLayer = sceneModel.createBackgroundLayer(layerData, LayerCategoryEnum.BACKGROUND, 'Background Layer', index);
        sceneModel.backgroundLayers.push(newLayer);
        return newLayer;
    }

    async addTileLayer(sceneModel, layerData) {
        const index = sceneModel.tileLayers.length;
        const newLayer = sceneModel.createTileLayer(layerData, LayerCategoryEnum.TILE, 'Map Layer', index);
        sceneModel.tileLayers.push(newLayer);
        return newLayer;
    }

    async addTerrainLayer(sceneModel, layerData) {
        const index = sceneModel.terrainLayers.length;
        const newLayer = sceneModel.createTerrainLayer(layerData, LayerCategoryEnum.TERRAIN, 'Terrain Layer', index);
        sceneModel.terrainLayers.push(newLayer);
        return newLayer;
    }

    async addEventLayer(sceneModel, layerData) {
        const index = sceneModel.eventLayers.length;
        const newLayer = sceneModel.createGameEventLayer(layerData, LayerCategoryEnum.EVENT, 'Event Layer', index);
        sceneModel.eventLayers.push(newLayer);
        return newLayer;
    }

    async toggleLayerVisibility(sceneModel, layerId) {
        // Busca a camada em todas as coleções da cena pelo id ou referência
        const allLayers = [
            ...sceneModel.backgroundLayers,
            ...sceneModel.tileLayers,
            ...sceneModel.terrainLayers,
            ...sceneModel.eventLayers
        ];
        
        const layer = allLayers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = layer.visible === false ? true : false;
            return layer;
        }
        return null;
    }
}