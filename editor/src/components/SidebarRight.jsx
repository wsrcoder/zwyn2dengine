
import React from 'react';

export default function SidebarRight({ activeTab, setActiveTab, selectedTile }) {
  return (
    <div className="sidebar-right">
      <div className="tab-headers">
        <button 
          className={activeTab === 'tilesets' ? 'active' : ''} 
          onClick={() => setActiveTab('tilesets')}
        >
          Tilesets
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''} 
          onClick={() => setActiveTab('events')}
        >
          Editor de Eventos
        </button>
      </div>
    </div>
  );
}