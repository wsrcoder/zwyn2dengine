export class JsonUtils {
    /**
     * Transforma um objeto em JSON identado, mas compacta arrays específicos em uma única linha.
     * @param {Object} obj - O objeto a ser serializado.
     * @param {Array<string>|string} [arrayKeys=["data"]] - Chave ou lista de chaves cujos arrays devem ficar em uma linha.
     * @returns {string} - A string JSON formatada.
     */
    static stringifyWithCompactArrays(obj, arrayKeys = ["data"]) {
        // 1. Gera o JSON normal identado
        let jsonString = JSON.stringify(obj, null, 2);

        // Garante que arrayKeys seja sempre um array iterável
        const keysArray = Array.isArray(arrayKeys) ? arrayKeys : [arrayKeys];

        // 2. Passa por cada chave que queremos compactar
        for (const key of keysArray) {
            const regex = new RegExp(`"${key}":\\s*\\[([\\s\\S]*?)\\]`, 'g');
            
            jsonString = jsonString.replace(regex, (match, arrayContent) => {
                const compact = arrayContent.replace(/\s+/g, '');
                const formatted = compact.replace(/,/g, ', ');
                return `"${key}": [${formatted}]`;
            });
        }

        return jsonString;
    }
}