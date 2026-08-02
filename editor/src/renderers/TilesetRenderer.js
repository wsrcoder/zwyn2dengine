
export default class TilesetRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.image = null;
        this.tileWidth = 32;
        this.tileHeight = 32;
        this.isLoaded = false;
    }

    async loadTileset(imagePath, tileWidth = 32, tileHeight = 32) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.isLoaded = false;

        try {
            // Pede para o Electron ler o arquivo em segurança e retornar a string base64
            const dataUrl = await window.electronAPI.loadBinaryFile(imagePath);

            return new Promise((resolve, reject) => {
                this.image = new Image();
                this.image.onload = () => {
                    this.isLoaded = true;
                    this.resizeCanvas();
                    this.render();
                    resolve();
                };
                this.image.onerror = (err) => {
                    console.error("[TilesetRenderer] Erro ao instanciar imagem:", err);
                    reject(err);
                };
                this.image.src = dataUrl;
            });
        } catch (error) {
            console.error("[TilesetRenderer] Falha ao carregar binário do tileset:", error);
            throw error;
        }
    }

    resizeCanvas() {
        if (!this.canvas || !this.image) return;
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
    }

    render(selectionRect = null) {
        console.log("[TilesetRenderer] Render foi chamado! SelectionRect:", selectionRect);
        if (!this.ctx || !this.isLoaded || !this.image) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.image, 0, 0);
        this.drawGrid();

        // 3. Se houver um retângulo de seleção, desenha o overlay por cima!
        if (selectionRect) {
            this._drawSelectionOverlay(selectionRect);
        }
    }

    drawGrid() {
        if (!this.ctx) return;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;

        const cols = Math.floor(this.image.width / this.tileWidth);
        const rows = Math.floor(this.image.height / this.tileHeight);

        for (let c = 0; c <= cols; c++) {
            const x = c * this.tileWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.image.height);
            this.ctx.stroke();
        }

        for (let r = 0; r <= rows; r++) {
            const y = r * this.tileHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.image.width, y);
            this.ctx.stroke();
        }
    }

    _drawSelectionOverlay(rect) {
        // Se o rect tem endX/endY em vez de width/height, calculamos a largura e altura em tiles:
        const startX = rect.startX ?? rect.x ?? 0;
        const startY = rect.startY ?? rect.y ?? 0;
        const endX = rect.endX ?? startX;
        const endY = rect.endY ?? startY;

        // Garante que a seleção funciona mesmo se arrastada para trás/cima
        const minX = Math.min(startX, endX);
        const minY = Math.min(startY, endY);
        const maxX = Math.max(startX, endX);
        const maxY = Math.max(startY, endY);

        const pixelX = minX * this.tileWidth;
        const pixelY = minY * this.tileHeight;
        const pixelWidth = (maxX - minX + 1) * this.tileWidth;
        const pixelHeight = (maxY - minY + 1) * this.tileHeight;

        this.ctx.save();
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);
        
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        this.ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
        this.ctx.restore();
    }
}