
export class TilesetRenderer {
    constructor(canvas, tilesetData = null, tileSize = 32) {
        if (!canvas) {
            throw new Error("Canvas element is required for TilesetRenderer.");
        }

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.tileSize = tileSize;
        this.tilesetData = tilesetData;
        this.tilesetImage = null;

        // Selection / Brush state (UI Layer)
        this.selectedRect = {
            startX: 0,
            startY: 0,
            width: tileSize,
            height: tileSize
        };

        this.showGrid = true;
    }

    setTilesetData(tilesetData, imageElement) {
        this.tilesetData = tilesetData;
        this.tilesetImage = imageElement;

        if (this.tilesetImage && this.tilesetData) {
            this.resizeCanvas();
            this.render();
        }
    }

    setTileSize(tileSize) {
        this.tileSize = tileSize;
        this.resizeCanvas();
        this.render();
    }

    setSelectedRect(rect) {
        this.selectedRect = rect;
        this.render();
    }

    setShowGrid(showGrid) {
        this.showGrid = showGrid;
        this.render();
    }

    resizeCanvas() {
        if (!this.tilesetImage) return;

        // Set canvas size based on the loaded tileset image dimensions
        this.canvas.width = this.tilesetImage.width;
        this.canvas.height = this.tilesetImage.height;
    }

    render() {
        if (!this.ctx) return;

        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Layer 1: Render the Tileset image (Base Layer)
        this.renderTilesetLayer();

        // Layer 2: Render the Grid (Optional)
        if (this.showGrid) {
            this.renderGridLayer();
        }

        // Layer 3: Render the Selection / Brush Overlay (UI Layer)
        this.renderUISelectionLayer();
    }

    renderTilesetLayer() {
        if (!this.tilesetImage) return;

        this.ctx.drawImage(this.tilesetImage, 0, 0);
    }

    renderGridLayer() {
        if (!this.tilesetImage) return;

        const imgWidth = this.tilesetImage.width;
        const imgHeight = this.tilesetImage.height;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        for (let x = 0; x <= imgWidth; x += this.tileSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, imgHeight);
        }

        for (let y = 0; y <= imgHeight; y += this.tileSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(imgWidth, y);
        }

        this.ctx.stroke();
    }

    renderUISelectionLayer() {
        if (!this.selectedRect) return;

        const { x, y, width, height } = this.selectedRect;

        // Draw selection brush overlay border and semi-transparent fill
        this.ctx.fillStyle = 'rgba(0, 122, 204, 0.3)';
        this.ctx.fillRect(x, y, width, height);

        this.ctx.strokeStyle = '#007acc';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
    }

    handleInputClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Snap to grid based on tile size
        const tileX = Math.floor(mouseX / this.tileSize) * this.tileSize;
        const tileY = Math.floor(mouseY / this.tileSize) * this.tileSize;

        return {
            x: tileX,
            y: tileY,
            width: this.tileSize,
            height: this.tileSize
        };
    }
}