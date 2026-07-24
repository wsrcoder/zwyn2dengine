
// src/components/TopMenu.jsx
import React, { useState } from 'react';
import './topmenu.css'; 

export default function TopMenu() {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleMenu = (menuName) => {
        setActiveDropdown(activeDropdown === menuName ? null : menuName);
    };

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
                        <button onClick={() => { console.log('Salvar'); setActiveDropdown(null); }}>
                            Salvar
                        </button>
                    </div>
                )}
            </div>

            <div className="menu-item" onClick={() => toggleMenu('edit')}>
                <span>Editar</span>
                {activeDropdown === 'edit' && (
                    <div className="dropdown-content">
                        <button>Desfazer</button>
                        <button>Refazer</button>
                    </div>
                )}
            </div>

            <div className="menu-item" onClick={() => toggleMenu('view')}>
                <span>Visualizar</span>
                {activeDropdown === 'view' && (
                    <div className="dropdown-content">
                        <button>Alternar Grid</button>
                    </div>
                )}
            </div>
        </div>
    );
}