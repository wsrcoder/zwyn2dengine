
import React, { useState } from 'react';

export default function CreateProjectModalContent({ onComplete, onCancel }) {
    const [projectName, setProjectName] = useState('MeuProjeto');
    const [parentPath, setParentPath] = useState('');

    const handleBrowse = async () => {
        const selected = await window.electronAPI.openDirectory();
        if (selected) {
            setParentPath(selected);
        }
    };

    const handleCreate = () => {
        if (!projectName.trim() || !parentPath) return;
        // Passa o objeto completo para o onClose (que vai virar o modalResult)
        onComplete({
            success: true,
            data: {
                projectName: projectName.trim(),
                parentPath: parentPath
            }
        });
    };

    // Quando o usuário clica em "Cancelar":
    const handleCancel = () => {
        onComplete({
            success: false,
            data: null
        });
    };

    return (
        <div className="create-project-form">
            <div className="form-group">
                <label>Nome do Projeto</label>
                <input 
                    type="text" 
                    className="modal-input"
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Localização (Pasta Pai)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        className="modal-input"
                        value={parentPath} 
                        readOnly 
                        placeholder="Selecione a pasta..."
                    />
                    <button className="btn btn-secondary" onClick={handleBrowse}>Procurar...</button>
                </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px', padding: 0, border: 'none' }}>
                <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                <button 
                    className="btn btn-primary" 
                    onClick={handleCreate}
                    disabled={!projectName.trim() || !parentPath}
                >
                    Criar Projeto
                </button>
            </div>
        </div>
    );
}