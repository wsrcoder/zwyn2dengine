import { ProjectParams } from "../constants/ProjectParams";


export default class SceneRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        this.currentScene = null;
        this.currentTileset = null;
        this.loadedImage = null;

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        setTimeout(() => this.handleResize(), 0);
    }

    setScene(sceneModel) {
        this.currentScene = sceneModel;
        this.render();
    }

    async setTileset(tilesetData) {
        if (!tilesetData) return;

        this.currentTileset = tilesetData;
        const imagePath = `${ProjectParams.DIR.TILESETS}/${tilesetData.imageFile?.name}`;

        if (!imagePath) {
            this.loadedImage = null;
            this.render();
            return;
        }

        try {
            // Pede para o Electron carregar o binário em base64 com segurança
            const dataUrl = await window.electronAPI.loadBinaryFile(imagePath);

            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.loadedImage = img;
                    this.render();
                    resolve();
                };
                img.onerror = (err) => {
                    console.error("❌ [SceneRenderer] Erro ao instanciar imagem do tileset:", err);
                    this.loadedImage = null;
                    this.render();
                    reject(err);
                };
                img.src = dataUrl;
            });
        } catch (error) {
            console.error("❌ [SceneRenderer] Falha ao carregar binário do tileset via Electron:", error);
            this.loadedImage = null;
            this.render();
        }
    }

    handleResize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
            this.render();
        }
    }

    render() {
        if (!this.ctx || !this.currentScene) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const { tileLayers, tileWidth = 32, tileHeight = 32 } = this.currentScene;

        if (!tileLayers || !Array.isArray(tileLayers)) return;

        for (const layer of tileLayers) {
            if (!layer || !layer.visible || !layer.data) continue;

            const cols = layer.columns;
            const rows = layer.rows;
            const data = layer.data;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const index = y * cols + x;
                    const tileId = data[index];

                    if (!tileId || tileId === 0) continue;

                    const destX = x * tileWidth;
                    const destY = y * tileHeight;

                    if (this.currentTileset && this.loadedImage) {
                        const tsColumns = this.currentTileset.columns || Math.floor(this.loadedImage.width / tileWidth);
                        
                        const sourceX = (tileId % tsColumns) * tileWidth;
                        const sourceY = Math.floor(tileId / tsColumns) * tileHeight;

                        this.ctx.drawImage(
                            this.loadedImage,
                            sourceX, sourceY, tileWidth, tileHeight,
                            destX, destY, tileWidth, tileHeight
                        );
                    } else {
                        this.ctx.fillStyle = '#444';
                        this.ctx.fillRect(destX, destY, tileWidth, tileHeight);
                        this.ctx.strokeStyle = '#666';
                        this.ctx.strokeRect(destX, destY, tileWidth, tileHeight);
                    }
                }
            }
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}