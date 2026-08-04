
// src/components/TopMenuContainer.jsx
import React, { useState, useEffect } from 'react';
import { EventHandler } from '../../core/EventBus';
import { EDITOR_EVENTS } from '../../core/EventTypes';
import FileMenu from './FileMenu';

export default function TopMenuContainer({ projectStore, handlers }) {
    const [hasProject, setHasProject] = useState(false);

    useEffect(() => {
        // Verifica o estado inicial ao montar
        if (projectStore && projectStore.getSession()) {
            const session = projectStore.getSession();
            setHasProject(!!session.project && !!session.rootPath);
        }

        // Inscreve nos eventos do EventBus
        const unsubLoaded = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, () => setHasProject(true));
        const unsubClosed = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_CLOSED, () => setHasProject(false));

        return () => {
            unsubLoaded();
            unsubClosed();
        };
    }, [projectStore]);

    return (
        <FileMenu 
            onNewProject={handlers.handleNewProject}
            onOpenProject={handlers.handleOpenProject}
            onSave={handlers.handleSaveProject}
            onSaveAs={handlers.handleSaveProjectAs}
            onCloseProject={handlers.handleCloseProject}
            onExit={handlers.handleExit}
            hasProject={hasProject}
        />
    );
}