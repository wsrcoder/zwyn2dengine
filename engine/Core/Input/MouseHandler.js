export default class MouseHandler {
    constructor(canvas) {
        this.canvas = canvas;

        this.buttons = {};
        this.pressed = {};
        this.released = {};

        this.position = { x: 0, y: 0 };
        this.wheelDelta = 0; // Armazena a rolagem do frame atual

        this.buttonMap = {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2
        };

        this.onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();

            // Resolve o bug de escala caso o tamanho do CSS seja diferente da resolução interna
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;

            // Dica de ouro: Reajusta a posição com base na proporção real da imagem
            this.position.x = rawX * (this.canvas.width / rect.width);
            this.position.y = rawY * (this.canvas.height / rect.height);
        };

        this.onMouseDown = (e) => {
            const button = e.button;
            if (!this.buttons[button]) {
                this.pressed[button] = true;
            }
            this.buttons[button] = true;
        };

        this.onMouseUp = (e) => {
            const button = e.button;
            this.buttons[button] = false;
            this.released[button] = true;
        };

        this.onWheel = (e) => {
            // Guarda a direção do scroll (-1 para cima, 1 para baixo)
            this.wheelDelta = Math.sign(e.deltaY);
            e.preventDefault(); // Evita que a página dê scroll real
        };

        this.onContextMenu = (e) => {
            // Mata o menu de contexto do navegador ao clicar com o botão direito
            e.preventDefault();
        };

        // Eventos atrelados ao Canvas
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("wheel", this.onWheel, { passive: false });
        canvas.addEventListener("contextmenu", this.onContextMenu);
    }

    getButton(button) {
        return this.buttonMap[button] ?? button;
    }

    /** Verifica se o botão está continuamente segurado */
    isDown(button) {
        const id = this.getButton(button);
        return this.buttons[id] ?? false;
    }

    /** Gatilho para o clique exato do frame */
    wasPressed(button) {
        const id = this.getButton(button);
        return this.pressed[id] ?? false;
    }

    /** Gatilho para o momento em que solta o botão */
    wasReleased(button) {
        const id = this.getButton(button);
        return this.released[id] ?? false;
    }

    /** Retorna a direção da rodinha (-1 subindo, 1 descendo, 0 parado) */
    getScroll() {
        return this.wheelDelta;
    }

    update() {
        this.pressed = {};
        this.released = {};
        this.wheelDelta = 0; // Limpa o scroll no final de cada frame
    }

    destroy() {
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("wheel", this.onWheel);
        this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    }
}