export interface IConfirmModalProps {
    message?: string | null; // Сообщение диалога или null
    title?: string | null; // Заголовок диалога или null
    width?: number;
    color?: string;
    noconfirm?: boolean;
    loading?: boolean;

  }