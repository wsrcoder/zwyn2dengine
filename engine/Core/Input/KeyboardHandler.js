
export default class KeyboardHandler {
    constructor() {
        this.keys = {};
        this.pressed = {};
        this.released = {};

        this.keyMap = {
            // Letras
            A: "KeyA", B: "KeyB", C: "KeyC", D: "KeyD", E: "KeyE", F: "KeyF", 
            G: "KeyG", H: "KeyH", I: "KeyI", J: "KeyJ", K: "KeyK", L: "KeyL", 
            M: "KeyM", N: "KeyN", O: "KeyO", P: "KeyP", Q: "KeyQ", R: "KeyR", 
            S: "KeyS", T: "KeyT", U: "KeyU", V: "KeyV", W: "KeyW", X: "KeyX", 
            Y: "KeyY", Z: "KeyZ",

            // Números e Direcionais
            NUM0: "Digit0", NUM1: "Digit1", NUM2: "Digit2", NUM3: "Digit3", 
            NUM4: "Digit4", NUM5: "Digit5", NUM6: "Digit6", NUM7: "Digit7", 
            NUM8: "Digit8", NUM9: "Digit9",
            UP: "ArrowUp", DOWN: "ArrowDown", LEFT: "ArrowLeft", RIGHT: "ArrowRight",

            // Controle e Modificadores
            SPACE: "Space", ENTER: "Enter", ESC: "Escape", TAB: "Tab", BACKSPACE: "Backspace",
            SHIFT: "ShiftLeft", SHIFT_LEFT: "ShiftLeft", SHIFT_RIGHT: "ShiftRight",
            CTRL: "ControlLeft", CTRL_LEFT: "ControlLeft", CTRL_RIGHT: "ControlRight",
            ALT: "AltLeft", ALT_LEFT: "AltLeft", ALT_RIGHT: "AltRight",

            // Funções
            F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", 
            F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12"
        };

        // Teclas que causam comportamentos indesejados no navegador (ex: scroll)
        this.preventExtensions = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"];

        this.onKeyDown = (event) => {
            const code = event.code;

            if (!this.keys[code]) {
                this.pressed[code] = true;
            }

            this.keys[code] = true;

            // Bloqueia o comportamento padrão APENAS para as teclas problemáticas de jogo
            if (this.preventExtensions.includes(code)) {
                event.preventDefault();
            }
        };

        this.onKeyUp = (event) => {
            const code = event.code;

            this.keys[code] = false;
            this.released[code] = true;

            if (this.preventExtensions.includes(code)) {
                event.preventDefault();
            }
        };

        // Previne o bug do botão travado ao perder o foco da janela
        this.onBlur = () => {
            this.clearState();
        };

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("blur", this.onBlur);
    }

    getCode(key) {
        return this.keyMap[key] ?? key;
    }

    /** Verifica se a tecla está sendo segurada */
    isDown(key) {
        const code = this.getCode(key);
        return this.keys[code] ?? false;
    }

    /** Verifica se a tecla foi apertada EXATAMENTE neste frame (gatilho) */
    wasPressed(key) {
        const code = this.getCode(key);
        return this.pressed[code] ?? false;
    }

    /** Verifica se a tecla foi solta EXATAMENTE neste frame */
    wasReleased(key) {
        const code = this.getCode(key);
        return this.released[code] ?? false;
    }

    /** Reseta os gatilhos de frame simples */
    update() {
        this.pressed = {};
        this.released = {};
    }

    /** Reseta o estado completo (útil ao mudar de tela ou perder foco) */
    clearState() {
        this.keys = {};
        this.pressed = {};
        this.released = {};
    }

    destroy() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.removeEventListener("blur", this.onBlur);
    }
}