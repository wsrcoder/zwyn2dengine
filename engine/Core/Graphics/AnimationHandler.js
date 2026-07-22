export default class AnimationHandler {
    constructor(config) {
        this.frameWidth = config.frameWidth;
        this.frameHeight = config.frameHeight;
        this.frameInterval = config.frameInterval || 100;
        
        this.animations = config.animations || {};
        this.currentAnimName = null;
        this.currentFrames = [];
        this.currentIndex = 0; // Índice dentro do array da animação atual
        this.elapsedTime = 0;
        this.isPlaying = true;
    }

    play(name) {
        // Usa a mesma propriedade em toda a verificação
        if (this.currentAnimName === name) return;

        if (this.animations[name]) {
            this.currentAnimName = name;
            this.currentFrames = this.animations[name];
            this.currentIndex = 0;
            this.elapsedTime = 0;
        }
    }

    update(dt) {

        if (!this.isPlaying || !this.currentFrames.length) return;

        this.elapsedTime += dt;
        
        if (this.elapsedTime >= this.frameInterval) {
            this.currentIndex = (this.currentIndex + 1) % this.currentFrames.length;
            this.elapsedTime = 0; // Mude de "-= this.frameInterval" para "= 0"
        }

    }

    getSpriteSourceCoordinates(columns) {
        if (!this.currentFrames.length) return { x: 0, y: 0, w: this.frameWidth, h: this.frameHeight };

        // Pega o ID real do frame (ex: o frame ID 5)
        const frameId = this.currentFrames[this.currentIndex];

        // Descobre a coordenada X e Y na imagem com base nas colunas totais da spritesheet
        const x = (frameId % columns) * this.frameWidth;
        const y = Math.floor(frameId / columns) * this.frameHeight;

        return { x, y, w: this.frameWidth, h: this.frameHeight };
    }

    stopAtFirst(name) {
        if (this.animations[name]) {
            this.currentAnimName = name;
            this.currentFrames = this.animations[name];
            this.currentIndex = 0; // Pega o primeiro frame
            this.elapsedTime = 0;
            this.isPlaying = false; // Trava a animação para não atualizar o loop!
        }
    }
}