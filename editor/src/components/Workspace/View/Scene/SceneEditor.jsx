import { useEffect, useRef } from 'react';
import SceneRenderer from '../../../../renderers/SceneRenderer';

export default function SceneEditor({ projectStore }) {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Instancia o renderizador assim que o canvas monta na tela
            rendererRef.current = new SceneRenderer(canvasRef.current, projectStore);
        }

        return () => {
            // Limpa recursos quando o editor fecha/desmonta
            if (rendererRef.current) {
                rendererRef.current.destroy();
                rendererRef.current = null;
            }
        };
    }, []);


    const scenes = projectStore?.session?.workingScenes;

    // 2. Sincroniza os dados quando a store mudar, SEM recriar o renderer
    useEffect(() => {
        if (rendererRef.current && scenes) {
            rendererRef.current.render();
        }
    }, [scenes]);

    return (
        <div className="scene-editor-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas 
                ref={canvasRef} 
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair'  }} />
        </div>
    );
}