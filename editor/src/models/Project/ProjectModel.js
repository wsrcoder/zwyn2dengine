class SceneSectionModel {
  constructor(data = {}) {
    this.id = data.id ?? 1;
    this.worldId = data.worldId ?? 1;
    this.name = data.name ?? "Scene1";
    this.fileName = data.fileName ?? `W${String(this.worldId)}S${this.id}.json`;
    this.columns = data.columns ?? 20;
    this.rows = data.rows ?? 15;
    this.order = data.order ?? 0;
    this.metadata = {
      properties: data.metadata?.properties ?? {}
    };
  }

  toJSON() {
    return {
      id: this.id,
      worldId: this.worldId,
      name: this.name,
      fileName: this.fileName,
      columns: this.columns,
      rows: this.rows,
      order: this.order,
      metadata: this.metadata
    };
  }
}

class WorldSectionModel {
  constructor(data = {}) {
    this.id = data.id ?? 1;
    this.name = data.name ?? `World${this.id}`;
    this.order = data.order ?? 0;
    this.metadata = {
      description: data.metadata?.description ?? "",
      properties: data.metadata?.properties ?? {}
    };
    this.scenes = (data.scenes ?? []).map(sceneData => new SceneSectionModel(sceneData));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
      metadata: this.metadata,
      // 🛡️ Garante que só chama .toJSON se o item for uma instância válida, senão retorna o item bruto
      scenes: this.scenes.map(scene => (scene && typeof scene.toJSON === 'function' ? scene.toJSON() : scene))
    };
  }
}

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

    // Se nenhum mundo foi fornecido (projeto novo), criamos o mundo e a cena padrão automaticamente!
    if (!data.worlds || data.worlds.length === 0) {
      const defaultColumns = this.settings.grid.default.columns;
      const defaultRows = this.settings.grid.default.rows;

      const initialScene = new SceneSectionModel({
        id: 1,
        worldId: 1,
        name: "Scene1",
        fileName: "W1S1.json", // Ou use ProjectParams se preferir
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

  // Métodos auxiliares úteis para adicionar mundos/cenas dinamicamente no futuro
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
      // 🛡️ Proteção idêntica para a lista de mundos
      worlds: this.worlds.map(world => (world && typeof world.toJSON === 'function' ? world.toJSON() : world))
    };
  }
}