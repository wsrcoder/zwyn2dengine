import React from 'react';
import SceneEditor from '../Workspace/View/Scene/SceneEditor';
import CharacterEditor from '../Workspace/View/Character/CharacterEditor';
import './WorkspaceEditor.css';

export default function WorkspaceEditor({ 
    tabs, 
    activeTabId, 
    onTabChange, 
    onCloseTab, 
    projectStore 
}) {
    // Mapeamento dos editores disponíveis
    const editorComponents = {
        scene: SceneEditor,
        character: CharacterEditor
    };

    // Busca a aba ativa atual para renderizar o componente correto
    const currentTab = tabs.find(tab => tab.id === activeTabId);
    const ActiveEditorComponent = currentTab ? editorComponents[currentTab.type] : null;

    return (
        <div className="workspace-editor-wrapper">
            {/* Barra de Abas Superior */}
            <div className="workspace-tabs-bar">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        className={`workspace-tab ${activeTabId === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-title">{tab.title}</span>
                        <button 
                            className="tab-close-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.id);
                            }}
                            title="Fechar aba"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* Área de Conteúdo Central */}
            <div className="workspace-content-area">
                {ActiveEditorComponent ? (
                    <ActiveEditorComponent data={currentTab.data} projectStore={projectStore} />
                ) : (
                    <div className="workspace-empty-state">
                        <p>Nenhum recurso aberto. Selecione um item no painel lateral para começar a editar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}