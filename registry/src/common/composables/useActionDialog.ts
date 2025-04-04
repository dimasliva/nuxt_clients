
import { type IActionDialogProps } from '~forms/types'
import ActionDialog from '~forms/ActionDialogs/ActionDialog.vue'


export async function useQU(message) {
    const props: IActionDialogProps = {
        title: "Подтверждение",
        message: message,
        icon: "mdi-map-marker-alert",
        iconColor: "warning",
        btns: { "y": "Да", "n": "Нет" },
        close: "0"
    };

    return await showModal(ActionDialog, props) == "y";
}



export async function useDelQU(message) {
    const props: IActionDialogProps = {
        title: "Подтверждение",
        message: message,
        icon: "mdi-map-marker-alert",
        iconColor: "warning",
        btns: { "y": "Удалить", "n": "Отмена" },
        close: "n"
    };
    return await showModal(ActionDialog, props) == "y";
}



export async function useCloseQU(message) {
    const props: IActionDialogProps = {
        title: "Подтверждение",
        message: message,
        icon: "mdi-map-marker-alert",
        iconColor: "warning",
        btns: { "y": "Закрыть", "n": "Отмена" },
        close: "n"
    };

    return await showModal(ActionDialog, props) == "y";
}
