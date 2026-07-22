
export default class FileLoader {
    /**
     * Carrega um arquivo JSON de forma assíncrona a partir de um caminho (URL)
     * @param {string} url - O caminho para o arquivo (ex: 'assets/maps/fase1.json')
     * @returns {Promise<Object>} O objeto JSON pronto para ser usado
     */
    static async loadJSON(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Não foi possível carregar o arquivo: ${url} (Status: ${response.status})`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Zwyn Engine [FileLoader Error]:", error);
            throw error;
        }
    }

    /**
 * Carrega um arquivo XML de forma assíncrona a partir de um caminho (URL)
 * @param {string} url - O caminho para o arquivo .tsx/.xml
 * @returns {Promise<Document>} O documento XML pronto para ser navegado via seletores DOM
 */
    static async loadXML(url) {
        try {
            const response = await fetch(url);
        
            if (!response.ok) {
                throw new Error(`Não foi possível carregar o arquivo XML: ${url} (Status: ${response.status})`);
            }
        
            const text = await response.text();
            const parser = new DOMParser();
        
            // Converte o texto bruto em um documento XML estruturado
            const xmlDoc = parser.parseFromString(text, "application/xml");
        
            // Verifica se o navegador encontrou algum erro de sintaxe no XML
            const parserError = xmlDoc.querySelector("parsererror");
            if (parserError) {
                throw new Error(`Erro de sintaxe no XML de ${url}: ${parserError.textContent}`);
            }
        
            return xmlDoc;
        } catch (error) {
            console.error("Zwyn Engine [FileLoader XML Error]:", error);
            throw error;
        }
    }


    /**
 * Carrega uma imagem de forma assíncrona e retorna o elemento de imagem pronto para uso.
 * @param {string} url - O caminho para a imagem do Tileset (.png)
 * @returns {Promise<HTMLImageElement>} A imagem carregada na memória do navegador.
 */
    static loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            // Quando o navegador terminar de baixar e processar os pixels da imagem
            image.onload = () => {
                resolve(image);
            };

            // Se o caminho estiver errado ou a imagem estiver corrompida
            image.onerror = () => {
                reject(new Error(`Zwyn Engine: Falha ao carregar a imagem no caminho: ${url}`));
            };

            // Dispara o início do download da imagem pelo navegador
            image.src = url;
        });
    }
    
}