<template>
    <WindowDialog :frameHeaderData="{ title: title + (props.readonly ? ' (только чтение)' : '') }" width="800"
        :onClose="() => close(true)" height="90dvh">

        <slot :fieldsOptions="fieldsOptions">

        </slot>


        <template v-slot:buttons="{ props }">
            <v-btn color="primary" variant="text" :disabled="fieldsOptions.changedCnt == 0 || fieldsOptions.errCnt > 0"
                @click="() => save()">
                Сохранить
            </v-btn>

            <v-btn color="primary" variant="text" :disabled="fieldsOptions.changedCnt == 0 || fieldsOptions.errCnt > 0"
                @click="() => saveAndClose()">
                Сохранить и закрыть
            </v-btn>

            <v-btn color="primary" variant="text" @click="() => close()">
                {{ t('close') }}
            </v-btn>
        </template>
    </WindowDialog>
</template>



<script setup lang="ts">

import * as vHelpers from '~~/libVis/Helpers';
import WindowDialog from "~/components/forms/WindowDialog.vue"


defineOptions({
    inheritAttrs: false,
    customOptions: {}
})


interface IProps {
    onClose?: (changed: boolean) => any;
    onSave: () => Promise<void>;
    title: string,
    icon?: string,
    readonly?: boolean
}
const props = defineProps<IProps>();

const fieldsOptions = reactive({
    errCnt: 0,
    changedCnt: 0,
    readonly: props.readonly ? true : false
})


const { t, locale } = useI18n();



const eventsHandler = (e: string, d: any) => {
    switch (e) {
        case "onKeydown": return true;
    }
};



const save = async () => {
    let res = false;
    await vHelpers.action(props.onSave).then(() => { res = true; fieldsOptions.changedCnt = 0; });
    return res;
}



const saveAndClose = async () => {
    if (await save())
        close();
}



const close = async (notCloseSelf = false) => {
    let res = null;

    if (fieldsOptions.changedCnt == 0 || await useCloseQU("Изменения не были сохранены. Закрыть?")) {
        if (props.onClose)
            res = props.onClose(fieldsOptions.changedCnt > 0);
        
        if (!notCloseSelf)
            closeDialog(res);
        return true;
    }
    return false;
}




defineExpose({ eventsHandler, fieldsOptions });


</script>