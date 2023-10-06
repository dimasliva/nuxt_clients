<template>
    <v-card width="800" style="height: 90dvh;">
        <v-card-title class="mx-2">
            <v-row class="pt-4">
                <div class="text-h5 ma-2">{{ title+(props.readonly? ' (только чтение)':'') }}</div>

                <v-spacer></v-spacer>
                <v-icon @click="close()">mdi-close</v-icon>
            </v-row>
        </v-card-title>

        <v-card-text class="overflow-y-auto">
            <slot :fieldsOptions="fieldsOptions">

            </slot>
        </v-card-text>


        <v-card-actions class="mr-4 mb-1">
            <v-spacer></v-spacer>

            <v-btn color="primary" variant="text" :disabled="fieldsOptions.changedCnt == 0 || fieldsOptions.errCnt > 0"
                @click="() => save()">
                Сохранить
            </v-btn>

            <v-btn color="primary" variant="text" :disabled="fieldsOptions.changedCnt == 0 || fieldsOptions.errCnt > 0"
                @click="() => saveAndClose()">
                Сохранить и закрыть
            </v-btn>

            <v-btn color="primary" variant="text" @click="() => close()">
                {{ $t('close') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>



<script setup lang="ts">

import * as vHelpers from '~~/libVis/Helpers';


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



const close = async () => {
    let res = null;

    if (fieldsOptions.changedCnt == 0 || await useCloseQU("Изменения не были сохранены. Закрыть?")) {

        if (props.onClose)
            res = props.onClose(fieldsOptions.changedCnt > 0);
        closeDialog(res);
    }
}




defineExpose({ eventsHandler, fieldsOptions });


</script>