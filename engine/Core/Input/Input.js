
import KeyboardHandler from "./KeyboardHandler.js";
import MouseHandler from "./MouseHandler.js";

export default class Input {

    constructor(canvas) {

        this.canvas = canvas;

        this.keyboard = new KeyboardHandler();
        this.mouse = new MouseHandler(canvas);

    }

    update() {

        this.keyboard.update();
        this.mouse.update();

    }

    destroy() {

        this.keyboard.destroy();
        this.mouse.destroy();

    }

}