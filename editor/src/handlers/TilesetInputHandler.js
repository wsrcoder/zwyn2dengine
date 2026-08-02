
import { TileUtils } from "../utils/TileUtils";

export default class TilesetInputHandler {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.tileWidth = options.tileWidth || 32;
        this.tileHeight = options.tileHeight || 32;
        this.onSelectionStart = options.onSelectionStart || (() => {});
        this.onSelectionChange = options.onSelectionChange || (() => {});
        this.onSelectionEnd = options.onSelectionEnd || (() => {});

        // Estado interno do mouse
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.currentHover = { x: 0, y: 0 };
        this.tilesetMatrix = options.tilesetMatrix || [];

        // Vincula os eventos
        this._bindEvents();
    }

    _bindEvents() {
        this.onMouseDown = (e) => {
            if (e.button !== 0) return; // Apenas botão esquerdo

            const coords = this._getCanvasMouseCoords(e);
            this.isDragging = true;
            this.dragStart = TileUtils.pixelToTileCoords(coords.x, coords.y, this.tileWidth, this.tileHeight);
            this.currentHover = { ...this.dragStart };

            // CORREÇÃO 1: Dispara a seleção imediata do clique inicial
            const initialData = this._triggerSelection();
            this.onSelectionStart(initialData);
        };

        this.onMouseMove = (e) => {
            if (!this.isDragging) return;

            const coords = this._getCanvasMouseCoords(e);
            const tileCoords = TileUtils.pixelToTileCoords(coords.x, coords.y, this.tileWidth, this.tileHeight);

            if (this.currentHover.x !== tileCoords.x || this.currentHover.y !== tileCoords.y) {
                this.currentHover = tileCoords;
                this._triggerSelection();
            }
        };

        this.onMouseUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            const finalData =this._triggerSelection();
            this.onSelectionEnd(finalData);
        };

        // Adiciona os listeners (mousemove na janela inteira garante fluidez nas bordas)
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    _triggerSelection() {
        const selectionData = TileUtils.calculateSelection(
            this.dragStart.x,
            this.dragStart.y,
            this.currentHover.x,
            this.currentHover.y,
            this.tilesetMatrix
        );
        this.onSelectionChange(selectionData);
    }

    _getCanvasMouseCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Mantém a proporção correta caso o CSS redimensione o canvas visualmente
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    destroy() {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }
}