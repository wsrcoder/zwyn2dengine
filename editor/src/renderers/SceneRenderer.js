
export default class SceneRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        this.currentScene = null;
        this.tilesets = new Map(); // Mapa de tilesets carregados (id -> imagem/dados)

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    // O renderer agora aceita dados estruturados prontos para desenhar
    setScene(sceneModel) {
        this.currentScene = sceneModel;
        this.render();
    }

    setTilesets(tilesetsMap) {
        this.tilesets = tilesetsMap;
        this.render();
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

        // Limpa a tela
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Aqui entra apenas a lógica pura de desenho das camadas e tiles
        // Iterando pelas camadas da this.currentScene...
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}