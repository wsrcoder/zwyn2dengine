
export default class CharacterEditor {
    constructor(data) {
        this.data = data;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'character-editor-view';
        container.innerHTML = `
            <h2>CharacterEditor</h2>
            <p>Editando personagem...</p>
        `;
        return container;
    }

    onActivate() {
        // Hook executado quando a aba ganha o foco
    }

    destroy() {
        // Limpeza se necessário
    }
}