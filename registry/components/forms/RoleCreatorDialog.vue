<template>
    <v-card width="700">
        <v-card-title class="ma-4">
            <v-row>
                <div class="text-h5 ma-2">Создание роли</div>
                <v-spacer></v-spacer>
                <v-icon @click="closeDialog(console.log())">mdi-close</v-icon>
            </v-row>
        </v-card-title>
        <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-text-field v-model="rolename" name="name" label="Название роли" clearable variant="underlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-select v-model="inherit" density="compact" label="Создать на основе:" item-title="role" :items="parentRole" variant="underlined" @update:model-value="selectParent()"></v-select>
                </v-col>
                <v-expand-transition>
                    <v-col v-if="inherit&&upd" cols="12" sm="12">
                        <FormsRoleGrid :role-name="rolename" :rights-set="roleRights" :creating-right="true" ref="roleCreation"></FormsRoleGrid>
                    </v-col>
                </v-expand-transition>    
            </v-row>
            <v-overlay v-model="confirm" contained class="align-center justify-center">
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
            <v-btn :disabled="!inherit||!rolename" color="primary" variant="text" @click="confirm = true">Создать</v-btn>
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
    onCloseFunc: Function
})
let confirm = ref(false)
let upd = ref(true);
let newRole = 'Новая роль'
let parentRole = ref([newRole, ...props.roleNames!])
let inherit = ref()
let rolename = ref('')
let emptyRights = ref(
    {'dbRoles' : '','dbCompany' : '', 'dbEmployee' : '','dbClient' : '','#CompanyAdmin' : '','dbEmployeeContacts' : '', "dbFilelink": ''}, 
)
let roleRights = ref()
let roleCreation = ref<any>();


const selectParent = async() => {
    upd.value = false;
    if(inherit.value === newRole){
        roleRights.value = emptyRights.value;
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