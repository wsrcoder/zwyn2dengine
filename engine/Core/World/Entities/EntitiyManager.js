
export default class EntityManager {
    constructor() {
        this.list = []; // O array central que seu Pipeline vai acessar
    }

    // Adiciona uma entidade ao mapa
    add(entity) {
        this.list.push(entity);
    }

    // Remove uma entidade (muito útil para quando alguém morre ou sai do mapa)
    remove(entity) {
        this.list = this.list.filter(e => e !== entity);
    }

    // O coração do jogo: chama o update de todas as entidades
    update(deltaTime, mapReference, inputManager) {
        for (const entity of this.list) {
            if (entity.active) {
                entity.update(deltaTime, mapReference, inputManager);
            }
        }
    }

    // Getter para o Z-Sorting que o Pipeline vai usar
    // Já podemos deixar preparado para o Y-Sorting
    getSortedList() {
        return [...this.list].sort((a, b) => (a.y + a.height) - (b.y + b.height));
    }
}