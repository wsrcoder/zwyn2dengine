
export class ImageUtils {
    /**
     * Importa uma imagem para uma pasta específica do projeto atual.
     * @param {string} sourcePath - Caminho original da imagem no computador do usuário.
     * @param {string} projectRootPath - Caminho raiz do projeto ativo.
     * @param {string} subFolder - Subpasta de destino (ex: 'Data/Tilesets', 'Data/Characters').
     * @param {string} fileName - Nome final que o arquivo terá (ex: 'CountryHouse001.png').
     */
    static async copyImageTo(sourcePath, projectRootPath, subFolder, fileName) {
        const normalizedRoot = projectRootPath.replace(/\\/g, '/').replace(/\/+$/, '');
        const destinationPath = `${normalizedRoot}/${subFolder}/${fileName}`;

        console.log(`[ImageUtils] Importando imagem de "${sourcePath}" para "${destinationPath}"...`);

        const result = await window.electronAPI.copyFile(sourcePath, destinationPath);
        
        if (!result.success) {
            throw new Error(`Falha ao importar imagem: ${result.error}`);
        }

        return destinationPath;
    }

    /**
     * Valida se o arquivo selecionado é uma imagem suportada.
     */
    static isValidImageFile(fileExtension) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
        return validExtensions.includes(fileExtension.toLowerCase());
    }
}