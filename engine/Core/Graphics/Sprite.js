
export default class Sprite {
    /**
     * @param {Object} config
     * @param {HTMLImageElement} config.image - A fonte da imagem
     * @param {number} [config.width] - Opcional, caso não queira usar o width da imagem
     * @param {number} [config.height] - Opcional, caso não queira usar o height da imagem
     * @param {number} [config.srcX=0] - Coordenada X dentro da spritesheet
     * @param {number} [config.srcY=0] - Coordenada Y dentro da spritesheet
     */
    constructor({ image, width, height, srcX = 0, srcY = 0 }) {
        this.image = image;
        this.width = width || image.width;
        this.height = height || image.height;
        this.srcX = srcX;
        this.srcY = srcY;
        this.visible = true;
    }

    // Métodos de controle de estado mantidos, pois são úteis para as Entidades
    show() { this.visible = true; }
    hide() { this.visible = false; }

    // Métodos de alteração mantidos
    setImage(image) { this.image = image; }
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    destroy() {
        this.image = null;
        this.width = 0;
        this.height = 0;
        this.visible = false;
    }
}