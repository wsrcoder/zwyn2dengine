import BaseActor from "./BaseActor.js";
import Sprite from "../../Graphics/Sprite.js";
import DefaultAnimationConfig from "../../Data/Animations/default_anim.json" with { type: "json" };

export default class Player extends BaseActor {
    constructor({ x, y, width = 32, height = 32, baseSpeed = 4 }) {
        // 1. Carrega a imagem do player
        const playerImage = new Image();
        playerImage.src = "./Assets/Entities/Player/player.png";

        // 2. Cria a instância da classe Sprite
        const playerSprite = new Sprite({
            image: playerImage,
            width: width,
            height: height
        });

        // 3. Repassa a sprite e as configs para o BaseActor / BaseEntity
        super({ 
            x, 
            y, 
            width, 
            height, 
            sprite: playerSprite, 
            spriteConfig: DefaultAnimationConfig, 
            baseSpeed 
        });
        
        // Define a animação inicial padrão
        if (this.animationHandler) {
            this.animationHandler.play("idle_down");
        }
    }

    // Função auxiliar para trocar ou atualizar a sprite do player dinamicamente
    setPlayerSprite(newSprite) {
        // O método setSprite já existe na BaseEntity, mas podemos especializá-lo aqui se precisar de lógica extra
        this.setSprite(newSprite);
    }

    handleInput(inputManager) {
        this.dx = 0;
        this.dy = 0;

        if (inputManager.keyboard.isDown('ArrowLeft') || inputManager.keyboard.isDown('KeyA')) this.dx = -1;
        if (inputManager.keyboard.isDown('ArrowRight') || inputManager.keyboard.isDown('KeyD')) this.dx = 1;
        if (inputManager.keyboard.isDown('ArrowUp') || inputManager.keyboard.isDown('KeyW')) this.dy = -1;
        if (inputManager.keyboard.isDown('ArrowDown') || inputManager.keyboard.isDown('KeyS')) this.dy = 1;
    }

    update(deltaTime, mapReference, inputManager) {
        // Se o inputManager veio no terceiro argumento, usamos ele. 
        // Caso contrário, tentamos pegar do parâmetro ou de onde estiver disponível.
        if (inputManager) {
            this.handleInput(inputManager);
        }

        // Restante da lógica de animação e movimento...
       if (this.animationHandler) {
            if (this.dx < 0) {
                this.facing = "left";
                this.animationHandler.isPlaying = true;
                this.animationHandler.play("walk_left");
            } else if (this.dx > 0) {
                this.facing = "right";
                this.animationHandler.isPlaying = true;
                this.animationHandler.play("walk_right");
            } else if (this.dy < 0) {
                this.facing = "up";
                this.animationHandler.isPlaying = true;
                this.animationHandler.play("walk_up");
            } else if (this.dy > 0) {
                this.facing = "down";
                this.animationHandler.isPlaying = true;
                this.animationHandler.play("walk_down");
            } else {
                // Quando ele para, pegamos a animação da última direção e travamos no primeiro frame
                const idleDir = this.facing || "down";
                this.animationHandler.stopAtFirst(`walk_${idleDir}`);
            }
        }

        super.update(deltaTime, mapReference);

        if (this.dx === 0 && this.dy === 0) return;

        const currentSpeed = this.speed; 

        let nextX = this.x + (this.dx * currentSpeed);
        if (!mapReference) {
            this.x = nextX;
        } else {
            const colideX = mapReference.isSolidAt(nextX, this.y) || 
                            mapReference.isSolidAt(nextX + this.width, this.y) ||
                            mapReference.isSolidAt(nextX, this.y + this.height - 1) || 
                            mapReference.isSolidAt(nextX + this.width, this.y + this.height - 1);
            if (!colideX) this.x = nextX;
        }

        let nextY = this.y + (this.dy * currentSpeed);
        if (!mapReference) {
            this.y = nextY;
        } else {
            const colideY = mapReference.isSolidAt(this.x, nextY) || 
                            mapReference.isSolidAt(this.x + this.width, nextY) ||
                            mapReference.isSolidAt(this.x, nextY + this.height - 1) || 
                            mapReference.isSolidAt(this.x + this.width, nextY + this.height - 1);
            if (!colideY) this.y = nextY;
        }
    }
}