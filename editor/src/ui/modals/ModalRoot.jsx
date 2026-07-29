
// src/components/ModalRoot.jsx
import React, { useState, useEffect } from 'react';
import { ModalService } from './ModalService';
import CreateProjectModalContent from './CreateProjectModalContent'; // <--- O formulário customizado
import './Modal.css';

export default function ModalRoot() {
    const [state, setState] = useState({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        inputValue: '',
        onClose: () => {}
    });

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        ModalService.register((newState) => {
            setState(newState);
            if (newState.defaultValue !== undefined) {
                setInputValue(newState.defaultValue);
            }
        });
    }, []);

    if (!state.isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className={`modal-container ${state.type === 'create-project' ? 'modal-large' : ''}`}>
                <div className="modal-header">
                    <h3>{state.title}</h3>
                </div>
                
                <div className="modal-body">
                    {/* Se não for create-project, mostra a mensagem padrão */}
                    {state.type !== 'create-project' && <p>{state.message}</p>}
                    
                    {state.type === 'prompt' && (
                        <input 
                            type="text" 
                            className="modal-input"
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                    )}

                    {/* Aqui entra a nossa tela complexa de forma isolada e limpa! */}
                    {state.type === 'create-project' && (
                        <CreateProjectModalContent 
                            onComplete={(result) => state.onClose(result)} // <-- Envia o objeto para o onClose do service
                            onCancel={() => state.onClose({ success: false, data: null })}
                        />
                    )}
                </div>

                {/* O footer padrão só aparece para os tipos simples */}
                {state.type !== 'create-project' && (
                    <div className="modal-footer">
                        {state.type === 'confirm' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => state.onClose(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={() => state.onClose(true)}>Confirmar</button>
                            </>
                        )}

                        {state.type === 'alert' && (
                            <button className="btn btn-primary" onClick={() => state.onClose(true)}>OK</button>
                        )}

                        {state.type === 'prompt' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => state.onClose(null)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={() => state.onClose(inputValue)}>Salvar</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}