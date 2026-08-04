
export class SceneSectionModel {
    constructor(data = {}) {
        this.id = data.id ?? 1;
        this.worldId = data.worldId ?? 1;
        this.name = data.name ?? "Scene1";
        this.fileName = data.fileName ?? `W${String(this.worldId)}S${this.id}.json`;
        this.columns = data.columns ?? 20;
        this.rows = data.rows ?? 15;
        this.order = data.order ?? 0;
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
        };
    }
}