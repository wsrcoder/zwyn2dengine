
// MapRenderer can be imported here later when needed

export class EditorController {
    constructor(projectController) {
        this.projectController = projectController;
        // ... estados de edição (brush, tool, etc)
    }

    // Exemplo de uso prático:
    getActiveMap() {
        // O EditorController delega a busca do mapa para o ProjectController
        return this.projectController.getCurrentMap();
    }
}