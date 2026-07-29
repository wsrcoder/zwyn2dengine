
export class ProjectDataModel {
    constructor(data = {}) {
        const raw = data || {};

        // Meta informações do projeto
        this.meta = {
            version: raw.meta?.version || "1.0.0",
            updatedAt: raw.meta?.updatedAt || new Date().toISOString()
        };

        // Configurações globais
        this.settings = {
            projectName: raw.settings?.projectName || "Default Project",
            grid: {
                default: {
                    columns: raw.settings?.grid?.default.columns ?? 20,
                    rows: raw.settings?.grid?.default.rows ?? 15
                }
            }
        };

        // Lista de mapas associados ao projeto
        this.maps = Array.isArray(raw.maps) 
            ? raw.maps.map(mapItem => ({
                  id: mapItem.id ?? 1,
                  name: mapItem.name || "Map0001",
                  fileName: mapItem.fileName || "Map0001.json",
                  columns: mapItem.columns ?? this.settings.grid.default.columns,
                  rows: mapItem.rows ?? this.settings.grid.default.rows
              }))
            : [
                  {
                      id: 1,
                      name: "Map0001",
                      fileName: "Map0001.json",
                      columns: this.settings.grid.default.columns,
                      rows: this.settings.grid.default.rows
                  }
              ];
    }

    /**
     * Atualiza o carimbo de data/hora antes de exportar
     */
    touch() {
        this.meta.updatedAt = new Date().toISOString();
    }

    /**
     * Converte o modelo de volta para um objeto JSON puro pronto para salvamento
     */
    toJSON() {
        this.touch();
        return {
            meta: {
                version: this.meta.version,
                updatedAt: this.meta.updatedAt
            },
            settings: {
                projectName: this.settings.projectName,
                grid: {
                    default:{
                        columns: this.settings.grid.default.columns,
                        rows: this.settings.grid.default.rows 
                    } 
                }
            },
            maps: this.maps.map(mapItem => ({
                id: mapItem.id,
                name: mapItem.name,
                fileName: mapItem.fileName,
                columns: mapItem.columns,
                rows: mapItem.rows
            }))
        };
    }
}