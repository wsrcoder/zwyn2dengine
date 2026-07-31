
export const ProjectParams = Object.freeze({
    MAX_MAP_INTERVAL: 4, //Quantas casas o número pode ter
    TILE_SIZE: 32,
    MAP_ORIENTATION: "orthogonal",
    MAP_RENDER_ORDER: "right-down",

    // Diretórios principais
    DATA_DIR: 'Data',
    SCENES_DIR: 'Data/Scenes',
    WORLDS_DIR: 'Data/Worlds',
    ASSETS_DIR: 'Assets',
    TILESETS_DIR: 'Assets/Tilesets',
    SPRITES_DIR: 'Assets/Sprites',
    
    // Arquivos de configuração principais
    PROJECT_MANIFEST_FILE: 'project.json'
});

export const PROJECT_DEFAULTS = Object.freeze({
    DEFAULT_WORLD_NAME: 'Main World',
    DEFAULT_SCENE_NAME: 'Scene1',
    DEFAULT_COLUMNS: 20,
    DEFAULT_ROWS: 15,
    
    // Função helper para gerar o nome do arquivo de mapa padronizado
    getMapFileName(worldId, sceneId) {
        return `W${String(worldId)}S${sceneId}.json`;
    }
});