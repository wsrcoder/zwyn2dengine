
// src/components/TopMenu.jsx
import React, { useState } from 'react';
import './TopMenu.css'; 

export default function TopMenu({projectController}) {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleMenu = (menuName) => {
        setActiveDropdown(activeDropdown === menuName ? null : menuName);
    };

    const handleOpenProject = async (e) => {
        e.stopPropagation(); 
        setActiveDropdown(null);

        try {
            const selectedPath = await window.electronAPI.openDirectory(); 
            console.log("selected path: " + selectedPath);
            if (selectedPath && projectController) {
                console.log("[TopMenu] Pasta selecionada:", selectedPath);
                const success = await projectController.openProject(selectedPath);
            
                if (success) {
                    console.log("[TopMenu] Projeto aberto com sucesso! Forçando atualização da UI.");
                    // Se você tiver uma função de callback passada via props para atualizar o App, chame aqui.
                    // Ex: onProjectLoaded && onProjectLoaded();
                }
            }
        } catch (error) {
            console.error("[TopMenu] Erro ao abrir projeto:", error);
        }
    }

    const handleSaveProject = async (e) => {
        e.stopPropagation(); //evita conflitos de fechamento de menu
        setActiveDropdown(null);

        if(!projectController){
            console.warn("[TopMenu] projectController não disponivel.");
            return;
        }

        try{
            console.log("[TopMenu] Acionando salvamento do projeto...");
            await projectController.saveProject();
            console.log("[TopMenu] Projeto salvo com sucesso.")
        }catch(error){
            console.error("[TopMenu] Erro ao salvar o projeto", error);
        }
    }

    return (
        <div className="top-menu">
            <div className="menu-item" onClick={() => toggleMenu('file')}>
                <span>Arquivo</span>
                {activeDropdown === 'file' && (
                    <div className="dropdown-content">
                        <button onClick={() => { console.log('Novo Projeto'); setActiveDropdown(null); }}>
                            Novo Projeto...
                        </button>
                        <button onClick={ handleOpenProject }>
                            Abrir Projeto...
                        </button>
                        <hr />
                        <button onClick={ handleSaveProject }>
                            Salvar
                        </button>
                    </div>
                )}
            </div>

            <div className="menu-item" onClick={() => toggleMenu('edit')}>
                <span>Editar</span>
                {activeDropdown === 'edit' && (
                    <div className="dropdown-content">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>Desfazer</button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>Refazer</button>
                    </div>
                )}
            </div>

            <div className="menu-item" onClick={() => toggleMenu('view')}>
                <span>Visualizar</span>
                {activeDropdown === 'view' && (
                    <div className="dropdown-content">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>Alternar Grid</button>
                    </div>
                )}
            </div>
        </div>
    );
}