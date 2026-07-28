


let setModalStateGlobal = null;

export const ModalService = {
    // Registra o hook de estado do componente visual principal
    register(setStateFn) {
        setModalStateGlobal = setStateFn;
    },

    // Abre o modal e retorna uma Promise que aguarda a resposta do usuário
    show(options) {
        return new Promise((resolve) => {
            if (!setModalStateGlobal) {
                console.error("ModalRoot não foi inicializado na raiz do app.");
                resolve(false);
                return;
            }

            setModalStateGlobal({
                isOpen: true,
                type: options.type || 'alert', // 'alert', 'confirm', 'prompt', etc.
                title: options.title || 'Atenção',
                message: options.message || '',
                inputPlaceholder: options.inputPlaceholder || '',
                defaultValue: options.defaultValue || '',
                onClose: (result) => {
                    setModalStateGlobal(prev => ({ ...prev, isOpen: false }));
                    resolve(result);
                }
            });
        });
    }
};