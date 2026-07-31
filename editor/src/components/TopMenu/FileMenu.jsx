// src/components/FileMenu.jsx
import React from 'react';
import './FileMenu.css'; // Mantém o CSS original

export default function FileMenu({ 
    onNewProject, 
    onOpenProject, 
    onSave,
    onSaveAs, 
    onCloseProject, 
    onExit,
    hasProject = false 
}) {
    return (
        <header className="top-menu-container">
            <nav className="top-menu-nav">
                <div className="top-menu-dropdown">
                    <button className="top-menu-trigger">Arquivo</button>
                    
                    <div className="top-menu-dropdown-content">
                        <button className="top-menu-item" onClick={onNewProject}>
                            Novo Projeto
                        </button>

                        <button className="top-menu-item" onClick={onOpenProject}>
                            Abrir Projeto
                        </button>

                        <div className="top-menu-separator" />

                        <button className="top-menu-item" onClick={onSave} disabled={!hasProject}>
                            Salvar
                        </button>
                        <button className="top-menu-item" onClick={onSaveAs} disabled={!hasProject}>
                            Salvar Como...
                        </button>

                        <div className="top-menu-separator" />

                        <button className="top-menu-item" onClick={onCloseProject} disabled={!hasProject}>
                            Fechar Projeto
                        </button>

                        <button className="top-menu-item top-menu-item-danger" onClick={onExit}>
                            Fechar
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}