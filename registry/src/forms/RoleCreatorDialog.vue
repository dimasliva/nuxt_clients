<template>
    <v-card width="700">
        <v-card-title class="ma-4">
            <v-row>
                <div class="text-h5 ma-2">Создание роли</div>
                <v-spacer></v-spacer>
                <v-icon @click="closeDialog(console.log())">mdi-close</v-icon>
            </v-row>
        </v-card-title>
        <v-card-text class="py-0">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="rolename" name="name" label="Название роли" clearable variant="underlined"
                            density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-select v-model="inherit" density="compact" label="Создать на основе:" item-title="role"
                            :items="parentRole" variant="underlined" @update:model-value="selectParent()"></v-select>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-text class="h-75 overflow-y-auto py-0">
            <v-container>
                <v-expand-transition>
                    <div class="h-50 ">
                        <FormsRoleGrid v-if="inherit && upd" :role-name="rolename" :rights-set="roleRights"
                            :all-rights="roleRights" :creating-right="true" ref="roleCreation">
                        </FormsRoleGrid>
                    </div>
                </v-expand-transition>
                <v-overlay v-model="confirm" class="align-center justify-center h-100">
                    <v-card>
                        <v-card-title primary-title>
                            Подтверждение
                        </v-card-title>
                        <v-card-text>
                            Вы точно хоитите создать данную роль?
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="primary" @click="createNewRole()">Сохранить</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="confirm = false">Отмена</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-overlay>
            </v-container>
        </v-card-text>
        <v-card-actions class="mr-4 mb-1">
            <v-spacer></v-spacer>
            <v-btn :disabled="!inherit || !rolename" color="primary" variant="text" @click="confirm = true">Создать</v-btn>
            <v-btn color="primary" variant="text" @click="closeDialog(console.log())">
                {{ $t('close') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

const props = defineProps({
    roleNames: Array,
    rightsSet: Array,
    allRightsSet: Object,
    onCloseFunc: Function
})
let confirm = ref(false)
let upd = ref(true);
let newRole = 'Новая роль'
let parentRole = ref<any>([newRole, ...props.roleNames!])
let inherit = ref()
let rolename = ref('')
let emptyRights = ref(props.allRightsSet)
let roleRights = ref()
let roleCreation = ref<any>();
let admRoleInd = parentRole.value.indexOf('admin');
parentRole.value.splice(admRoleInd, 1);



const selectParent = async () => {
    upd.value = false;
    if (inherit.value === newRole) {
        roleRights.value = emptyRights.value;
        for (let right in roleRights.value) {
            roleRights.value[right] = ''
        }
    } else {
        let ind = props.roleNames?.indexOf(inherit.value);
        roleRights.value = props.rightsSet![ind!];
    }
    await nextTick();
    upd.value = true;
}

const createNewRole = () => {
    roleCreation.value.updateOrCreateRights();
    confirm.value = false;
    if (props.onCloseFunc) {
        closeDialog(props.onCloseFunc());
    }
}

</script>