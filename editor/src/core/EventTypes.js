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

    //Navegação
    SCENE_CHANGED: 'sceneChanged',

    // Categoria: Cenas / Mapas
    SCENE_MODIFIED: 'sceneModified',

    // Categoria: Ferramentas e Tiles (Novo)
    TOOL_CHANGED: 'toolChanged',
    TILE_SELECTION_STARTED: 'tileSelection:started',
    TILE_SELECTION_CHANGED: 'tileSelection:changed',
    TILE_SELECTION_ENDED: 'tileSelection:ended',
});