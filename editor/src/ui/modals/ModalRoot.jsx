import React, { useState, useEffect } from 'react';
import { ModalService } from './ModalService';
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

    useEffect(() => {
        ModalService.register((newState) => {
            setState(newState);
            if (newState.defaultValue !== undefined) {
                setInputValue(newState.defaultValue);
            }
        });
    }, []);

    const [inputValue, setInputValue] = useState('');

    if (!state.isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{state.title}</h3>
                </div>
                
                <div className="modal-body">
                    <p>{state.message}</p>
                    
                    {state.type === 'prompt' && (
                        <input 
                            type="text" 
                            className="modal-input"
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                    )}
                </div>

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
            </div>
        </div>
    );
}