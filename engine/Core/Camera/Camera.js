export default class Camera {
    constructor({ worldWidth, worldHeight, viewportWidth, viewportHeight }) {
        this.x = 0;
        this.y = 0;

        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        this.target = null;
        this.zoom = 1;
        
        // Velocidade da câmera: 1 significa instantâneo, valores menores (ex: 0.1) tornam o movimento suave
        this.lerpSpeed = 0.1; 
    }

    /**
     * Retorna a largura e altura reais da janela considerando o zoom aplicado
     */
    get zoomedWidth() { return this.viewportWidth / this.zoom; }
    get zoomedHeight() { return this.viewportHeight / this.zoom; }

    clamp() {
        // Ajusta os limites máximos baseado no tamanho real enxergado pelo zoom
        const maxX = this.worldWidth - this.zoomedWidth;
        const maxY = this.worldHeight - this.zoomedHeight;

        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    }

    getVisibleTileBounds(tileWidth, tileHeight) {
        // Margem de segurança (padding) de 1 bloco para evitar "pop-in" nas bordas da tela
        const padding = 1;

        const startX = Math.floor(this.x / tileWidth) - padding;
        const startY = Math.floor(this.y / tileHeight) - padding;

        // Usa zoomedWidth/Height para calcular o fim com precisão mesmo se houver zoom
        const endX = Math.ceil((this.x + this.zoomedWidth) / tileWidth) + padding;
        const endY = Math.ceil((this.y + this.zoomedHeight) / tileHeight) + padding;

        // Garante que o índice dos blocos nunca seja menor que 0 ou maior que o tamanho real do mundo
        return {
            startX: Math.max(0, startX),
            startY: Math.max(0, startY),
            endX: Math.min(Math.ceil(this.worldWidth / tileWidth), endX),
            endY: Math.min(Math.ceil(this.worldHeight / tileHeight), endY)
        };
    }

    follow(target) {
        this.target = target;
    }

    update(deltaTime) {
        if (!this.target) return;

        // Descobre onde o centro do alvo está (considera largura/altura se existirem, senão usa 0)
        const targetWidth = this.target.width || 0;
        const targetHeight = this.target.height || 0;
        
        const targetCenterX = this.target.x + (targetWidth / 2);
        const targetCenterY = this.target.y + (targetHeight / 2);

        // Posição ideal que a câmera DEVERIA estar para centralizar o alvo
        const desiredX = targetCenterX - this.zoomedWidth / 2;
        const desiredY = targetCenterY - this.zoomedHeight / 2;

        // EFEITO LERP: Move a câmera apenas uma fração da distância a cada frame (Suavização)
        // Se preferir a câmera dura clássica, basta fazer: this.x = desiredX;
        this.x += (desiredX - this.x) * this.lerpSpeed;
        this.y += (desiredY - this.y) * this.lerpSpeed;

        this.clamp();
    }
}