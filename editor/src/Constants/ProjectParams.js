
export const ProjectParams = Object.freeze({
    TILE_SIZE: 32,
    MAP_ORIENTATION: "orthogonal",
    MAP_RENDER_ORDER: "right-down",

    // Diretórios principais
    DIR:{
        DATA: 'Data',
        SCENES: 'Data/Scenes',
        WORLDS: 'Data/Worlds',
        ASSETS: 'Assets',
        TILESETS: 'Assets/Tilesets',
        SPRITES: 'Assets/Sprites',
    },
    
    
    // Arquivos de configuração principais
    PROJECT_MANIFEST_FILE: 'project.json'
});

export const PROJECT_DEFAULTS = Object.freeze({
    DEFAULT_WORLD_NAME: 'Main World',
    DEFAULT_SCENE_NAME: 'Scene',
    DEFAULT_COLUMNS: 20,
    DEFAULT_ROWS: 15,
    
    // Função helper para gerar o nome do arquivo de mapa padronizado
    getSceneFileName(worldId, sceneId) {
        return `W${String(worldId)}S${sceneId}.json`;
    }
});