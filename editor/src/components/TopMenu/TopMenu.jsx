
// src/components/TopMenu.jsx
import React from 'react';
import './TopMenu.css';

export default function TopMenu({ 
    onNewProject, 
    onOpenProject, 
    onSaveAs, 
    onCloseProject, 
    onExit 
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

                        <button className="top-menu-item" onClick={onSaveAs}>
                            Salvar Como...
                        </button>

                        <div className="top-menu-separator" />

                        <button className="top-menu-item" onClick={onCloseProject}>
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