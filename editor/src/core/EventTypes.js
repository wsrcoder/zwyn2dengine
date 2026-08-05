
export const EDITOR_EVENTS = Object.freeze({
    // Categoria: Projeto
    PROJECT_LOADED: 'project:loaded',
    PROJECT_CLOSED: 'project:closed',
    PROJECT_SAVED: 'project:saved',
    PROJECT_MODIFIED: 'project:modified',

    // Categoria: Mundos
    WORLDS_LIST_UPDATED: 'worldsListUpdated',
    WORLD_CHANGED: 'worldChanged',

    // Navegação
    SCENE_CHANGED: 'sceneChanged',

    // Categoria: Cenas / Mapas e Camadas (Expandido)
    SCENE_CREATED: 'scene:created',
    SCENE_DELETED: 'scene:deleted',
    SCENE_MODIFIED: 'sceneModified',
    
    // <--- Novos eventos recomendados para Camadas
    LAYER_CREATED: 'layer:created',
    LAYER_UPDATED: 'layer:updated',
    LAYER_DELETED: 'layer:deleted',
    LAYER_VISIBILITY_TOGGLED: 'layer:visibilityToggled',

    // Categoria: Ferramentas e Tiles
    TOOL_CHANGED: 'toolChanged',
    TILE_SELECTION_STARTED: 'tileSelection:started',
    TILE_SELECTION_CHANGED: 'tileSelection:changed',
    TILE_SELECTION_ENDED: 'tileSelection:ended',
});