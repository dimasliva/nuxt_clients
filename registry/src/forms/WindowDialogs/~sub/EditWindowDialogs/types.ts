export interface IEditWindowDialogProps {
    onClose?: (changed: boolean) => any;
    onSave: () => Promise<void>;
    title: string,
    icon?: string,
    readonly?: boolean
}