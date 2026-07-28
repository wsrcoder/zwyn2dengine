
import { LayerType } from "../constants/LayerType";
import { LayerBucketMap } from "../constants/LayerBucketMap";

export class UIController {
    constructor() {
        // Referências principais
        this.projectController = null;
        this.mapRenderer = null;
        
        // Estado ativo da edição
        this.selectedTool = 'pencil'; // 'pencil', 'eraser', 'bucket', 'select'
        this.selectedTile = { x: 0, y: 0, id: 0 }; // Tile selecionado na paleta de tilesets
        
        // Camada ativa onde as ações de pintura serão aplicadas
        this.activeLayer = {
            category: 'mapLayers', // 'backgroundLayers', 'mapLayers', 'eventLayers', 'UILayer'
            index: 0
        };

        // Sistema simples de Pub/Sub para o React escutar mudanças
        this.listeners = {};
    }

    /**
     * Vincula o ProjectController para ter acesso aos dados globais e ao mapa atual
     */
    setProjectController(projectController) {
        this.projectController = projectController;
    }

    /**
     * Vincula o MapRenderer para que o controller possa forçar atualizações visuais na Viewport
     */
    setMapRenderer(renderer) {
        this.mapRenderer = renderer;
    }

    /**
     * Retorna o mapa ativo no momento através do ProjectController
     */
    getCurrentMap() {
        if (!this.projectController) return null;
        
        const session = this.projectController.session;
        if (!session || !session.map || !session.map.currentId) return null;
        
        const cacheEntry = session.map.cache.get(session.map.currentId);

        console.log("[EditorController: cacheEntry:]");
        console.log(cacheEntry);
        return cacheEntry ? cacheEntry.model : null;
    }

    /**
     * Define a ferramenta ativa (lápis, borracha, balde, etc.)
     */
    setSelectedTool(toolName) {
        this.selectedTool = toolName;
        console.log(`[EditorController] Ferramenta alterada para: ${toolName}`);
        this.notifyListeners('toolChanged', this.selectedTool);
    }

    /**
     * Define o tile selecionado na paleta de tilesets
     */
    setSelectedTile(tileData) {
        this.selectedTile = tileData;
        console.log(`[EditorController] Tile selecionado na paleta:`, tileData);
        this.notifyListeners('tileChanged', this.selectedTile);
    }

    /**
     * Altera a camada ativa onde o usuário vai desenhar/interagir
     */
    setActiveLayer(bucketOrType, index) {
        let category = bucketOrType;

        // Se o argumento passado foi um LayerType (ex: 'tile', 'background'), 
        // converte para o nome do bucket correspondente usando o LayerBucketMap
        if (Object.values(LayerType).includes(bucketOrType)) {
            category = LayerBucketMap[bucketOrType];
        }

        // BLOQUEIO DE SEGURANÇADA: A camada de UI é exclusiva do sistema e intocável pelo usuário
        if (category === LayerBucketMap[LayerType.UI] || category === 'UILayer') {
            console.warn("[EditorController] A camada de UI é reservada do sistema e não pode ser selecionada.");
            return;
        }

        const map = this.getCurrentMap();
        if (!map || !map[category] || !map[category][index]) {
            console.error(`[EditorController] Camada inválida ou não encontrada em ${category}[${index}]`);
            return;
        }

        // Salva a referência exata
        this.activeLayer = { category, index };
        this.currentActiveLayer = map[category][index];

        console.log(`[EditorController] Camada ativa alterada para: ${category}[${index}] (${this.currentActiveLayer.name})`);
    
        // Atualiza também no renderizador se ele existir
        if (this.mapRenderer) {
            this.mapRenderer.updateMapData(null, this.activeLayer);
        }

        this.notifyListeners('layerChanged', this.activeLayer);
    }

    /**
     * Executa a ação de pintura de tile nas coordenadas (x, y) do mapa
     */
    paintTile(x, y) {
        const map = this.getCurrentMap();
        if (!map) {
            console.warn("[EditorController] Nenhum mapa carregado para pintar.");
            return;
        }

        const { category, index } = this.activeLayer;
        const layersList = map[category];

        if (!layersList || !layersList[index]) {
            console.error(`[EditorController] Camada ativa inválida: ${category}[${index}]`);
            return;
        }

        const targetLayer = layersList[index];
        
        // Calcula o índice unidimensional baseado nas colunas do mapa
        const tileIndex = y * map.columns + x;
        
        if (tileIndex >= 0 && tileIndex < targetLayer.data.length) {
            // Se for borracha, define como 0 (vazio). Senão, usa o ID do tile selecionado.
            const newTileValue = this.selectedTool === 'eraser' ? 0 : (this.selectedTile.id || 0);
            
            // Só altera e marca como modificado se o valor for diferente
            if (targetLayer.data[tileIndex] !== newTileValue) {
                targetLayer.data[tileIndex] = newTileValue;
                
                if (this.projectController) {
                    this.projectController.isModified = true;
                }
                
                console.log(`[EditorController] Pintado (${x}, ${y}) na camada ${targetLayer.name} com ID ${newTileValue}`);

                // Atualiza o renderizador e redesenha a tela instantaneamente
                if (this.mapRenderer) {
                    this.mapRenderer.updateMapData(map);
                    this.mapRenderer.render();
                }

                this.notifyListeners('mapUpdated', map);
            }
        }
    }

    // --- Sistema de Observadores (Listeners) para reatividade com o React ---
    
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Retorna função de desinscrição para usar no useEffect cleanup
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    notifyListeners(event, data) {
        console.log(`[UIController] Evento disparado: "${event}", com dados:`, data);
        if (this.listeners[event]) {
            console.log(`[UIController] Encontrados ${this.listeners[event].length} ouvintes para o evento ${event}.`);
            this.listeners[event].forEach(callback => callback(data));
        } else {
            console.warn(`[UIController] Nenhum ouvinte registrado para o evento: "${event}"`);
        }
    }
}