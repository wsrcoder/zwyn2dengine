

export class SceneDTO {
    constructor(rawJsonData = {}) {
        this.id = rawJsonData.id;
        this.worldId = rawJsonData.worldId;
        this.type = rawJsonData.type || 'scene'; // Default type is 'scene'
        this.name = rawJsonData.name;
        this.columns = rawJsonData.columns;
        this.rows = rawJsonData.rows;
        this.tile = {
            width: rawJsonData.tile?.width || 32,
            height: rawJsonData.tile?.height || 32
        };

        this.orientation = rawJsonData.orientation || 'orthogonal';
        this.renderOrder = rawJsonData.renderorder || 'right-down';

        // Mantém as listas brutas em formato de dados (JSON)
        this.tilesets = rawJsonData.tilesets || [];
        
        this.backgrounds = rawJsonData.backgrounds || rawJsonData.backgroundLayers || [];
        this.tileLayers = rawJsonData.tileLayers || rawJsonData.tileLayers || [];
        this.events = rawJsonData.events || rawJsonData.eventLayers || [];
        this.UI = rawJsonData.UI || rawJsonData.UILayer || [];

        this.properties = rawJsonData.properties || {};
    }
}