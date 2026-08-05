
import React, { createContext, useContext } from 'react';

// ============================================================================
// 1. IMPORTAÇÕES DAS SUAS CLASSES E FUNÇÕES
// (Atenção: ajuste os caminhos "../" conforme a organização das suas pastas!)
// ============================================================================
import { projectStore } from '../store/projectStore'; // Importe sua store real
import SceneController from '../controllers/SceneController'; // Importe seu controller
import { createSceneHandlers } from '../handlers/sceneHandlers'; // Sua factory function

// ============================================================================
// 2. INSTANCIAÇÃO (Feita apenas uma vez)
// ============================================================================
// Como o Controller precisa da store, e os Handlers precisam dos dois:
const sceneController = new SceneController(projectStore);
const sceneHandlers = createSceneHandlers(sceneController, projectStore);

// ============================================================================
// 3. CRIAÇÃO DO CONTEXTO
// ============================================================================
const EditorContext = createContext(null);

// ============================================================================
// 4. O PROVIDER (Componente que vai "abraçar" o App.jsx)
// ============================================================================
export function EditorProvider({ children }) {
    return (
        // Tudo que você colocar na propriedade "value" será distribuído 
        // magicamente para qualquer componente filho que pedir.
        <EditorContext.Provider value={{ 
            projectStore, 
            sceneController, 
            sceneHandlers 
        }}>
            {children}
        </EditorContext.Provider>
    );
}

// ============================================================================
// 5. O HOOK CUSTOMIZADO (Para usar nos botões e listas)
// ============================================================================
export function useEditor() {
    const context = useContext(EditorContext);
    
    // Pequena trava de segurança: avisa se você tentar usar o hook 
    // fora do EditorProvider
    if (!context) {
        throw new Error("useEditor deve ser usado dentro de um EditorProvider");
    }
    
    return context;
}