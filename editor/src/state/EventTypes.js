// editor/src/state/EventTypes.js

export const EDITOR_EVENTS = Object.freeze({
    // Categoria: Projeto
    PROJECT_LOADED: 'project:loaded',
    PROJECT_CLOSED: 'project:closed',
    PROJECT_SAVED: 'project:saved',      // <--- Novo evento adicionado
    PROJECT_MODIFIED: 'project:modified',

    // Categoria: Mundos
    WORLDS_LIST_UPDATED: 'worldsListUpdated',
    WORLD_CHANGED: 'worldChanged',

    // Categoria: Cenas / Mapas
    SCENE_CHANGED: 'sceneChanged',
    SCENE_MODIFIED: 'sceneModified',
});