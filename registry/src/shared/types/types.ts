export interface IConfirmModal {
    id: string;
    isOpen: boolean;
    value?: string;
}
export interface IConfirmMultipleModal {
    ids: string[];
    isOpen: boolean;
    value?: string;
}