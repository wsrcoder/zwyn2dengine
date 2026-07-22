export default class GameTime {
    constructor() {
        this.lastTimestamp = null;
        this.delta = 0;        // Tempo real do frame em segundos
        this.elapsed = 0;      // Tempo modificado pelo timeScale (útil para física do jogo)
        this.totalTime = 0;    // Tempo total de jogo rodando
        this.frame = 0;
        this.fps = 0;

        // Controle e melhorias
        this.timeScale = 1.0;  // 1.0 = normal, 0.5 = câmera lenta, 0.0 = pausado
        this.maxDelta = 0.1;   // Trava o delta em no máximo 100ms para evitar bugs de colisão

        // Variáveis internas para o cálculo suave de FPS
        this._fpsTimer = 0;
        this._fpsCounter = 0;
    }

    update(timestamp) {
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp;
            return;
        }

        // 1. Calcula o delta time real em segundos
        let rawDelta = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // 2. Proteção contra o "salto no tempo" (evita que a física quebre ao minimizar a aba)
        if (rawDelta > this.maxDelta) {
            rawDelta = this.maxDelta;
        }

        this.delta = rawDelta;
        
        // 3. Aplica a escala de tempo (perfeito para pause ou câmera lenta)
        this.elapsed = this.delta * this.timeScale;

        // 4. Acumula o tempo total e contador de frames
        this.totalTime += this.elapsed;
        this.frame++;

        // 5. Cálculo suave de FPS (atualiza a cada 1 segundo real)
        this._fpsCounter++;
        this._fpsTimer += this.delta;

        if (this._fpsTimer >= 1.0) {
            this.fps = this._fpsCounter;
            this._fpsCounter = 0;
            this._fpsTimer -= 1.0;
        }
    }
}