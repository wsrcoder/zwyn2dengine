import { SceneSectionModel } from "./SceneSectionModel.js";

export class WorldSectionModel {
    constructor(data = {}) {
        this.id = data.id ?? 1;
        this.name = data.name ?? `World${this.id}`;
        this.order = data.order ?? 0;
        this.scenes = (data.scenes ?? []).map(sceneData => new SceneSectionModel(sceneData));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            order: this.order,
            scenes: this.scenes.map(scene => (scene && typeof scene.toJSON === 'function' ? scene.toJSON() : scene))
        };
    }
}