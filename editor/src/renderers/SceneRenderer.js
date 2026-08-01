
// editor/src/renderers/SceneRenderer.js

export default class SceneRenderer {
    constructor(canvasElement, projectStore) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.projectStore = projectStore;
        
        this.isAnimating = false;
        
        // Vincula o contexto para garantir o escopo correto no resize
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        this.init();
    }

    init() {
        this.handleResize();
        this.render();
        // Inicializações adicionais ( listeners de mouse para zoom/pan, etc. )
    }

    updateStore(newStore){
        this.projectStore = newStore;
        this.render();
    }

    handleResize() {
        if (!this.canvas) return;
        // Faz o canvas preencher dinamicamente o tamanho do container pai
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
            this.render();
        }
    }

    render() {
        if (!this.ctx) return;

        // Limpa a tela
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const workingScenes = this.projectStore?.session?.workingScenes;

        // 1. Blindagem: Se não existir nada, encerra com segurança
        if (!workingScenes) return;

        // 2. Converte para array caso seja um Objeto/Dicionário (ex: { id1: scene1, id2: scene2 })
        const scenesArray = Array.isArray(workingScenes) 
            ? workingScenes 
            : Object.values(workingScenes);

        // 3. Itera com segurança total
        for (const scene of scenesArray) {
            console.log("Renderizando cena:", scene);
            // Lógica de desenho aqui...
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        // Para loops de animação ou limpa eventos se necessário
    }
}