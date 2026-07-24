
import React from 'react';
import './SidebarRight.css';


export default function SidebarRight({ activeTab, setActiveTab, selectedTile}){

  return(
    <div className="sidebar-right">
      <div className="tab-headers">
        <button 
          className={activeTab === 'tilesets' ? 'active': ''}
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

      {/** dinamic content area */}
      <div className='tab-content'>
        {activeTab === 'tilesets' && (
          <div className="tileset-tab-panel">
            {/** here will fit we container with 2 layers */}
            <p>Tileset Panel</p>
          </div>
        )}
        {activeTab === 'events' && (
          <div className="events-tab-panel">
            <p>Event Tab Panel</p>
          </div>
        )}
      </div>
    </div>
  );
}