
export default class WaterWavesEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1.0;          // De 1.0 (nasceu) até 0.0 (sumiu)
        this.maxLife = 20;        // Duração total em frames (pode aumentar se quiser que dure mais)
        this.currentLife = this.maxLife;
        this.radiusX = 6;         // Raio horizontal inicial (formato de marola oval)
        this.radiusY = 3;         // Raio vertical inicial (achatado para parecer no chão)
    }

    update() {
        this.currentLife--;
        this.life = this.currentLife / this.maxLife;
        
        // A marola expande conforme some
        this.radiusX = 6 + (1 - this.life) * 10;
        this.radiusY = 3 + (1 - this.life) * 5;
    }

    isDead() {
        return this.currentLife <= 0;
    }
}