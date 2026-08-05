
// editor/src/state/EventBus.js

export class EventBus { //Mudar para EventHandler para evitar confusão com o EventBus do Node.js
    constructor() {
        this.listeners = {};
    }

    /**
     * Inscreve um callback para escutar um evento específico.
     * @param {string} event - Nome do evento (ex: 'projectLoaded', 'mapChanged')
     * @param {Function} callback - Função executada quando o evento for disparado
     * @returns {Function} Função de limpeza (unsubscribe) para usar no useEffect
     */
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Retorna a função de unsubscribe automática
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    /**
     * Dispara um evento, notificando todos os ouvintes inscritos.
     * @param {string} event - Nome do evento
     * @param {*} [data] - Dados opcionais a serem passados para os ouvintes. voce pode
     * passar apenas o identifcador do evento ou passar tambem os dados se houver necessidade
     */
    notify(event, data = null) {
        console.log(`[EventBus] Evento disparado: "${event}"`, data !== undefined ? data : '');
        
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Erro ao executar callback para o evento "${event}":`, error);
                }
            });
        }
    }
}

// Exporta uma instância única global (Singleton) para toda a aplicação usar a mesma central
export const EventHandler = new EventBus();