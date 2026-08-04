
export default class IdUtils {
    /**
     * Retorna o próximo ID numérico sequencial com base em uma lista de itens existentes.
     * Resolve o problema de exclusões pegando o maior ID e somando 1.
     * 
     * @param {Array} items - Lista de objetos que possuem a propriedade .id
     * @returns {number} O próximo ID disponível (mínimo 1)
     */
    static getNextIntId(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return 1;
        }
        
        // Pega todos os IDs existentes, garante que são números válidos
        const ids = items.map(item => Number(item.id)).filter(id => !isNaN(id));
        
        if (ids.length === 0) {
            return 1;
        }

        const maxId = Math.max(...ids);
        return maxId + 1;
    }
}