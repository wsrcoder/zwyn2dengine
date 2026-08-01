import React from 'react';
import './SceneEditor.css';

export default function SceneEditor({ data }) {
    return (
        <div className="scene-editor-container">
            <h2>SceneEditor</h2>
            <p>Editando cena ID: {data?.sceneId || 'N/A'}</p>
            {/* Aqui entra a lógica de edição de layers, canvas, etc. */}
        </div>
    );
}