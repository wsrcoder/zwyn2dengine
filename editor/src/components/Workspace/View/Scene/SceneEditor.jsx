import { useEffect, useRef } from 'react';
import SceneRenderer from '../../../../renderers/SceneRenderer';
import { EventHandler } from '../../../../state/EventBus';
import { EDITOR_EVENTS } from '../../../../state/EventTypes';

export default function SceneEditor({ projectStore }) {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    // 1. Inicializa o SceneRenderer quando o componente é montado
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new SceneRenderer(canvasRef.current);
        }

        // Função helper para buscar a cena ativa na store e mandar para o renderer
        const updateSceneToRender = () => {
            if (!projectStore || !rendererRef.current) return;

            const session = projectStore.getSession();
            
            const activeWorldId = session.navigation.activeWorldId;
            const activeSceneId = session.navigation.activeSceneId;

            const currentSceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
            const currentScene = currentSceneData ? currentSceneData.data : null;

            if (currentScene) {
                rendererRef.current.setScene(currentScene);
            }
        };

        // Carrega a cena inicial
        updateSceneToRender();

        // 2. Escuta eventos globais para re-renderizar quando a cena mudar
        const unsubscribeModified = EventHandler.subscribe(EDITOR_EVENTS.SCENE_MODIFIED, () => {
            updateSceneToRender();
        });

        const unsubscribeSwitched = EventHandler.subscribe(EDITOR_EVENTS.ACTIVE_SCENE_CHANGED, () => {
            updateSceneToRender();
        });

        return () => {
            unsubscribeModified();
            unsubscribeSwitched();
            if (rendererRef.current) {
                rendererRef.current.destroy();
            }
        };
    }, [projectStore]);

    return (
        <div className="scene-editor-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas 
                ref={canvasRef} 
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair'  }} />
        </div>
    );
}