
import { TileToolType } from '../constants/ToolType'; // Ajuste o caminho se necessário

export default class SceneInputHandler {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.tileSize = options.tileSize || 32;
        
        // Callbacks ou referências injetadas para interagir com o mundo/store
        this.onPaint = options.onPaint || (() => {});
        this.getToolState = options.getToolState || (() => null);
        this.getActiveLayer = options.getActiveLayer || (() => null);

        this.isDrawing = false;

        // Vincula os métodos para poder remover os listeners depois
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onContextMenu = (e) => e.preventDefault(); // Evita menu de contexto no canvas

        this._initListeners();
    }

    _initListeners() {
        this.canvas.addEventListener('pointerdown', this._onMouseDown);
        this.canvas.addEventListener('pointermove', this._onMouseMove);
        window.addEventListener('pointerup', this._onMouseUp); // Window para capturar solto fora do canvas
        this.canvas.addEventListener('contextmenu', this._onContextMenu);
    }

    _getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        // Posição do mouse relativa ao canvas em pixels
        const pixelX = event.clientX - rect.left;
        const pixelY = event.clientY - rect.top;

        // Converte pixels para coordenadas de grid (tileX, tileY)
        const tileX = Math.floor(pixelX / this.tileSize);
        const tileY = Math.floor(pixelY / this.tileSize);

        return { tileX, tileY };
    }

    _onMouseDown(event) {
        // Apenas botão esquerdo do mouse
        if (event.button !== 0) return;

        this.isDrawing = true;
        this._processInteraction(event);
    }

    _onMouseMove(event) {
        if (!this.isDrawing) return;
        this._processInteraction(event);
    }

    _onMouseUp() {
        this.isDrawing = false;
    }

    _processInteraction(event) {
        const { tileX, tileY } = this._getCanvasCoordinates(event);
        const layer = this.getActiveLayer();

        if (!layer) return;

        // Valida se está dentro dos limites do mapa
        if (tileX < 0 || tileX >= layer.columns || tileY < 0 || tileY >= layer.rows) {
            return;
        }

        const toolState = this.getToolState();
        if (!toolState) return;

        const activeTool = toolState.getActiveTool();

        // Delega a ação com base na ferramenta ativa
        if (activeTool === TileToolType.BRUSH) {
            const selection = toolState.getTileSelection(); // Pega a matriz de tiles selecionada no painel
            if (selection && selection.tiles && selection.tiles.length > 0) {
                this.onPaint(tileX, tileY, selection);
            }
        } else if (activeTool === TileToolType.ERASER) {
            // Borracha define o tile como 0 ou null (vazio)
            const emptySelection = {
                width: 1,
                height: 1,
                tiles: [0]
            };
            this.onPaint(tileX, tileY, emptySelection);
        }
        // Futuramente podemos adicionar o BUCKET aqui também
    }

    destroy() {
        if (!this.canvas) return;
        this.canvas.removeEventListener('pointerdown', this._onMouseDown);
        this.canvas.removeEventListener('pointermove', this._onMouseMove);
        window.removeEventListener('pointerup', this._onMouseUp);
        this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    }
}