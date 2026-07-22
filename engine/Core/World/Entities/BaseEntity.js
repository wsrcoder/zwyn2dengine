
export default class BaseEntity {
    /**
     * @param {Object} config
     * @param {number} config.x - Posição X no mundo
     * @param {number} config.y - Posição Y no mundo
     * @param {number} config.width - Largura da entidade (para colisões/sorting)
     * @param {number} config.height - Altura da entidade (para colisões/sorting)
     * @param {Object} [config.sprite=null] - Instância da classe Sprite
     */
    constructor({ x, y, width, height, sprite = null }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        
        this.active = true; // Se falso, o jogo para de atualizar/renderizar a entidade
    }

    // Método que será chamado a cada frame de jogo (lógica, movimento, etc.)
    update(deltaTime) {
        if (!this.active) return;
        
        // No futuro, lógica de movimento, animação, IA vai aqui.
    }

    // Se no futuro você precisar de lógicas visuais (como piscar vermelho ao tomar dano)
    setSprite(sprite) {
        this.sprite = sprite;
    }
}