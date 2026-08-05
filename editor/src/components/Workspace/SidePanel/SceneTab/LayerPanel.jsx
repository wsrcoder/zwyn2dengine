
import React, { useState } from 'react';
import TileLayerList from './LayerList/TileLayerList.jsx';
import './LayerPanel.css';

// Importação futura dos componentes específicos de cada aba
// import TileLayerList from './layers/TileLayerList';
// import BackgroundLayerList from './layers/BackgroundLayerList';
// import TerrainLayerList from './layers/TerrainLayerList';
// import EventLayerList from './layers/EventLayerList';

export default function LayerPanel({ activeScene, projectStore }) {
    // Estado para controlar a aba ativa ('background' | 'tile' | 'terrain' | 'event')
    const [activeTab, setActiveTab] = useState('tile');
    
    // Estado opcional para controlar qual camada está selecionada na cena atual
    const [activeLayerIndex, setActiveLayerIndex] = useState(0);

    // Renderiza o conteúdo correspondente à aba ativa
    const renderActiveTabContent = () => {
        if (!activeScene) {
            return (
                <div className="section-content-layers">
                    <span className="empty-text">Nenhuma cena ativa</span>
                </div>
            );
        }

        switch (activeTab) {
            case 'background':
                // return <BackgroundLayerList activeScene={activeScene} projectStore={projectStore} />;
                return <PlaceholderTabContent type="Background" />;
            case 'tile':
                // return <TileLayerList activeScene={activeScene} projectStore={projectStore} />;
                return (
                    <TileLayerList 
                        activeScene={activeScene} 
                        projectStore={projectStore} 
                        activeLayerIndex={activeLayerIndex}
                        onLayerSelect={(index) => setActiveLayerIndex(index)}
                    />
                );
            case 'terrain':
                // return <TerrainLayerList activeScene={activeScene} projectStore={projectStore} />;
                return <PlaceholderTabContent type="Terrain" />;
            case 'event':
                // return <EventLayerList activeScene={activeScene} projectStore={projectStore} />;
                return <PlaceholderTabContent type="Event" />;
            default:
                return null;
        }
    };

    return (
        <div className="sidebar-section layer-panel">
            {/* 1. Abas Superiores */}
            <div className="layer-tabs-header">
                <button 
                    className={`layer-tab-btn ${activeTab === 'background' ? 'active' : ''}`}
                    onClick={() => setActiveTab('background')}
                >
                    Background
                </button>
                <button 
                    className={`layer-tab-btn ${activeTab === 'tile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tile')}
                >
                    Tile
                </button>
                <button 
                    className={`layer-tab-btn ${activeTab === 'terrain' ? 'active' : ''}`}
                    onClick={() => setActiveTab('terrain')}
                >
                    Terrain
                </button>
                <button 
                    className={`layer-tab-btn ${activeTab === 'event' ? 'active' : ''}`}
                    onClick={() => setActiveTab('event')}
                >
                    Event
                </button>
            </div>

            {/* 2. Cabeçalho da Seção Ativa (Sem o botão genérico "Novo") */}
            <div className="section-header">
                <span> {activeTab.toUpperCase()} {activeScene ? `(${activeScene.name})` : ''}</span>
            </div>

            {/* 3. Conteúdo Dinâmico da Aba Ativa */}
            {renderActiveTabContent()}
        </div>
    );
}

// Componente temporário para ilustrar onde cada aba exibirá sua lista customizada com seus próprios botões
function PlaceholderTabContent({ type }) {
    return (
        <div className="section-content-layers">
            <span className="empty-text">Gerenciamento de {type}s em breve...</span>
        </div>
    );
}