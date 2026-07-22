

export default class GameScreen{

    constructor(canvas, options = {}){
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        if (!this.context){
            throw new Error("GameScreen: Não foi possivel obter o contexto 2D do Canvas");

        }

        //Aqui no futuro vamos injetar ou gerencia a camera
        //this.camera = new Camera()
        this.camera = null


        //Configuração de redimensionamento automatico
        this.autoResize = options.autoResize ?? false;

        // Guardamos a referência da função vinculada ao 'this' para podermos removê-la depois se necessário
        this._resizeHandler = this._handleWindowResize.bind(this);

        if (this.autoResize) {
            this.enableAutoResize();
        }

        // Armazena o tamanho lógico original (caso queira trabalhar com resolução fixa)
        this.baseWidth = this.canvas.width;
        this.baseHeight = this.canvas.height;
    }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    draw(sprite, x, y){

    }

    draw(renderQueue) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const cmd of renderQueue) {
            if (cmd.type === 'TILE') {
                this.context.globalAlpha = cmd.opacity;
                this.context.drawImage(
                    cmd.image, 
                    cmd.srcX, cmd.srcY, cmd.srcW, cmd.srcH, 
                    cmd.destX, cmd.destY, cmd.destW, cmd.destH
                );
            }
            else if (cmd.type === 'SPRITE') {
                const sprite = cmd.sprite;
                if (sprite && sprite.image && sprite.visible) {
                    this.context.drawImage(
                    sprite.image,
                    sprite.srcX, sprite.srcY, sprite.width, sprite.height, // Pedaço recortado da spritesheet
                    cmd.destX, cmd.destY, sprite.width, sprite.height // Posição na tela ajustada pela câmera
                
                    );
                }   
            }else if (cmd.type === 'ELLIPSE'){

                console.log("splash")

                this.context.save();
                this.context.fillStyle = cmd.color;
                this.context.beginPath();
                // Desenha a elipse usando os raios horizontal e vertical
                this.context.ellipse(
                    cmd.x, cmd.y,          // Posição X e Y do centro
                    cmd.radiusX, cmd.radiusY, // Raio X e Raio Y
                    0,                      // Rotação (0 = normal)
                    0, Math.PI * 2          // Ângulo inicial e final (círculo/elipse completa)
                );
                this.context.fill();
                this.context.restore();
            }else if (cmd.type === 'RECT') {
                this.context.fillStyle = cmd.color;
                this.context.fillRect(cmd.x, cmd.y, cmd.width, cmd.height);
            }
        }
        this.context.globalAlpha = 1.0;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Dica de ouro: desativar o anti-aliasing se você for usar Pixel Art!
        // Como o contexto reseta ao mudar o tamanho do canvas, reconfiguramos aqui:
        // this.context.imageSmoothingEnabled = false;
    }

    /**
     * Ativa o monitoramento do tamanho da janela do navegador
     */
    enableAutoResize() {
        this.autoResize = true;
        window.addEventListener("resize", this._resizeHandler);
        // Já roda uma vez no início para ajustar o tamanho imediatamente
        this._handleWindowResize();
    }

    /**
     * Desativa o monitoramento do tamanho da janela
     */
    disableAutoResize() {
        this.autoResize = false;
        window.removeEventListener("resize", this._resizeHandler);
    }

    /**
     * Tratador interno do evento de redimensionamento
     */
    _handleWindowResize() {
        if (!this.autoResize) return;
        this.resize(window.innerWidth, window.innerHeight);
    }

    /**
     * Alterna o modo de tela cheia (Fullscreen) usando a API do navegador.
     * Nota: Este método precisa ser disparado por um evento de input do usuário (click, keydown).
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.canvas.requestFullscreen()
                .catch(err => {
                    console.error(`Erro ao tentar ativar Fullscreen: ${err.message}`);
                });
        } else {
            document.exitFullscreen();
        }
    }
}