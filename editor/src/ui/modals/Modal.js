import { ModalService } from './ModalService';

export const Modal = {
    alert(title, message) {
        return ModalService.show({ type: 'alert', title, message });
    },

    confirm(title, message) {
        return ModalService.show({ type: 'confirm', title, message });
    },

    prompt(title, message, placeholder = '', defaultValue = '') {
        return ModalService.show({ type: 'prompt', title, message, inputPlaceholder: placeholder, defaultValue });
    }
};