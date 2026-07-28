
// src/components/TopMenu.jsx
import React, { useState } from 'react';
import './TopMenu.css'; 

export default function TopMenu({projectController}) {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleMenu = (menuName) => {
        setActiveDropdown(activeDropdown === menuName ? null : menuName);
    };

    const handleSave = async (e) => {
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
                        <button onClick={() => { console.log('Abrir Projeto'); setActiveDropdown(null); }}>
                            Abrir Projeto...
                        </button>
                        <hr />
                        <button onClick={ handleSave }>
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