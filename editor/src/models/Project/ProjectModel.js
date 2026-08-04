import { WorldSectionModel } from "./WorldSectionModel.js";
import { SceneSectionModel } from "./SceneSectionModel.js";

export default class ProjectModel {
    constructor(data = {}) {
        this.metadata = {
            version: data.metadata?.version ?? "1.0.0",
            updatedAt: data.metadata?.updatedAt ?? new Date().toISOString()
        };
        
        this.settings = {
            projectName: data.settings?.projectName ?? "Default Project",
            grid: {
                default: {
                    columns: data.settings?.grid?.default?.columns ?? 20,
                    rows: data.settings?.grid?.default?.rows ?? 15
                }
            }
        };

        this.defaultWorldId = data.defaultWorldId ?? 1;
        this.defaultSceneId = data.defaultSceneId ?? 1;
        this.activeWorldId = data.activeWorldId ?? 1;
        this.activeSceneId = data.activeSceneId ?? 1;

        // Se nenhum mundo foi fornecido (projeto novo), cria o mundo e cena padrão
        if (!data.worlds || data.worlds.length === 0) {
            const defaultColumns = this.settings.grid.default.columns;
            const defaultRows = this.settings.grid.default.rows;

            const initialScene = new SceneSectionModel({
                id: 1,
                worldId: 1,
                name: "Scene1",
                fileName: "W1S1.json",
                columns: defaultColumns,
                rows: defaultRows
            });

            const initialWorld = new WorldSectionModel({
                id: 1,
                name: "Main World",
                order: 1,
                scenes: [initialScene]
            });

            this.worlds = [initialWorld];
        } else {
            this.worlds = data.worlds.map(worldData => new WorldSectionModel(worldData));
        }
    }

    getAllWorlds() {
        return this.worlds ?? [];
    }

    getWorldById(worldId) {
        if (!this.worlds) return null;
        return this.worlds.find(w => w.id === worldId) || null;
    }

    getAllScenes(worldId = null) {
        if (!this.worlds) return [];

        if (worldId !== null) {
            const world = this.getWorldById(worldId);
            return world ? (world.scenes ?? []) : [];
        }

        return this.worlds.flatMap(world => world.scenes ?? []);
    }

    getSceneById(worldId, sceneId) {
        const world = this.getWorldById(worldId);
        if (!world || !world.scenes) return null;
        
        const scene = world.scenes.find(s => s.id === sceneId);
        return scene ? { world, scene } : null;
    }

    addWorld(worldData) {
        const newWorld = new WorldSectionModel(worldData);
        this.worlds.push(newWorld);
        return newWorld;
    }

    addSceneToWorld(worldId, sceneData) {
        const world = this.getWorldById(worldId);
        if (!world) return null;

        const newScene = new SceneSectionModel(sceneData);
        world.scenes.push(newScene);
        return newScene;
    }

    toJSON() {
        return {
            metadata: {
                version: this.metadata.version,
                updatedAt: new Date().toISOString()
            },
            settings: this.settings,
            defaultWorldId: this.defaultWorldId,
            defaultSceneId: this.defaultSceneId,
            activeWorldId: this.activeWorldId,
            activeSceneId: this.activeSceneId,
            worlds: this.worlds.map(world => (world && typeof world.toJSON === 'function' ? world.toJSON() : world))
        };
    }
}