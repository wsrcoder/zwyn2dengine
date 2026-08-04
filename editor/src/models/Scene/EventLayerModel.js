
import {GameEventModel} from "./GameEventModel.js";

export class EventLayerModel {
    constructor(data = {}) {
        this.id = data.id ?? 0;
        this.name = data.name ?? "Event Layer 1";
        this.type = "event"; // ou LayerType.EVENT
        this.visible = data.visible ?? true;
        this.opacity = data.opacity ?? 1;
        
        // A lista de eventos posicionados nesta camada
        this.events = Array.isArray(data.events)
            ? data.events.map(eventData => new GameEventModel(eventData))
            : [];
        
        this.properties = data.properties ?? {};
    }

    addEvent(eventData) {
        const newEvent = new GameEventModel(eventData);
        this.events.push(newEvent);
        return newEvent;
    }

    removeEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            visible: this.visible,
            opacity: this.opacity,
            events: this.events.map(ev => ev.toJSON()),
            properties: JSON.parse(JSON.stringify(this.properties))
        };
    }
}