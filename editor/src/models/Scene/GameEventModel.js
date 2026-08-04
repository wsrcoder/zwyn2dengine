export class GameEventModel {
    constructor(data = {}) {
        this.id = data.id ?? 1;
        this.name = data.name ?? "EV001";
        this.x = data.x ?? 0; // Posição no grid (ou pixels)
        this.y = data.y ?? 0;
        this.visible = data.visible ?? true;
        this.pages = data.pages ?? []; // Páginas de condições e comandos do RPG Maker style
        this.properties = data.properties ?? {}; // Propriedades customizadas
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            visible: this.visible,
            pages: JSON.parse(JSON.stringify(this.pages)),
            properties: JSON.parse(JSON.stringify(this.properties))
        };
    }
}