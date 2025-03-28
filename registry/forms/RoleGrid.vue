<template>
    <v-card flat class="w-100 ma-0 pa-0" :loading="!upd">
        <v-card-actions v-if="!creatingRight">
            <v-card-title class="text-h6">Роль: {{ nameRole }}</v-card-title>
            <v-spacer></v-spacer>
            <v-btn variant="text" rounded="xl" size="small" v-if="readingRights && updRight && (nameRole != 'admin')"
                @click="editRights()" prepend-icon="mdi-pencil">Редактировать</v-btn>
            <v-btn variant="text" rounded="xl" size="small" v-if="!readingRights && !changes"
                @click="readingRights = true, changes = false" prepend-icon="mdi-eye">Просмотр</v-btn>
            <v-btn variant="text" rounded="xl" size="small" v-if="!readingRights && changes"
                @click="$emit('updated'), updateOrCreateRights()" prepend-icon="mdi-content-save">Сохранить</v-btn>
            <v-btn variant="text" rounded="xl" size="small" v-if="!readingRights && changes" @click="cancelChange()"
                prepend-icon="mdi-close">Отменить</v-btn>
        </v-card-actions>
        <v-card-text class="overflow-y-auto">
            <v-table density="comfortable" :height="readingRights ? '20vh' : '60vh'" fixed-header>
                <thead>
                    <tr>
                        <th>Права:</th>
                        <th class="text-center">
                            <v-icon>mdi-alpha-c</v-icon>
                            <v-tooltip activator="parent" location="top">Создание</v-tooltip>
                        </th>
                        <th class="text-center">
                            <v-icon>mdi-alpha-r</v-icon>
                            <v-tooltip activator="parent" location="top">Чтение</v-tooltip>
                        </th>
                        <th class="text-center">
                            <v-icon>mdi-alpha-u</v-icon>
                            <v-tooltip activator="parent" location="top">Обновление</v-tooltip>
                        </th>
                        <th class="text-center">
                            <v-icon>mdi-alpha-d</v-icon>
                            <v-tooltip activator="parent" location="top">Удаление</v-tooltip>
                        </th>
                        <th class="text-center">
                            <v-icon>mdi-alpha-s</v-icon>
                            <v-tooltip activator="parent" location="top">Специальное право</v-tooltip>
                        </th>
                        <th class="text-center">
                            <v-icon>mdi-checkbox-multiple-marked</v-icon>
                            <v-tooltip activator="parent" location="top">Все права роли</v-tooltip>
                        </th>
                    </tr>
                </thead>
                <tbody v-if="upd">
                    <template v-for="(value, key, index) in cruds" :key="key">
                        <tr v-if="value || !readingRights || creatingRight"
                            v-show="key.toString() !== 'dbGroupC' && key.toString() !== 'dbProductsCatalogC'">
                            <td>{{ $t(key.toString()) }}</td>
                            <td>
                                <v-checkbox class="d-flex justify-center" v-model="rights[index][key]"
                                    :disabled="readingRights && !creatingRight" value='c' density="compact" hide-details
                                    @vue:before-mount="value.includes('c') ? rights[index][key].push('c') : false"
                                    @click="changes = true"></v-checkbox>
                            </td>
                            <td>
                                <v-checkbox class="d-flex justify-center" v-model="rights[index][key]"
                                    :disabled="readingRights && !creatingRight" value='r' density="compact" hide-details
                                    @vue:before-mount="value.includes('r') ? rights[index][key].push('r') : false"
                                    @click="changes = true"></v-checkbox>
                            </td>
                            <td>
                                <v-checkbox class="d-flex justify-center" v-model="rights[index][key]"
                                    :disabled="readingRights && !creatingRight" value='u' density="compact" hide-details
                                    @vue:before-mount="value.includes('u') ? rights[index][key].push('u') : false"
                                    @click="changes = true"></v-checkbox>
                            </td>
                            <td>
                                <v-checkbox class="d-flex justify-center" v-model="rights[index][key]"
                                    :disabled="readingRights && !creatingRight" value='d' density="compact" hide-details
                                    @vue:before-mount="value.includes('d') ? rights[index][key].push('d') : false"
                                    @click="changes = true"></v-checkbox>
                            </td>
                            <td>
                                <v-checkbox class="d-flex justify-center" v-model="rights[index][key]"
                                    :disabled="readingRights && !creatingRight" value='s' density="compact" hide-details
                                    @vue:before-mount="value.includes('s') ? rights[index][key].push('s') : false"
                                    @click="changes = true"></v-checkbox>
                            </td>
                            <td>
                                <v-checkbox class="d-flex justify-center" color="primary" v-model="allRightsInRow"
                                    :disabled="readingRights && !creatingRight" :value="rights[index][key]"
                                    @vue:before-mount="rights[index][key].length == 5 ? allRightsInRow.push(rights[index][key]) : false"
                                    density="compact" hide-details @click="selectAllRow(rights, index, key)"></v-checkbox>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { RolesRecord } from '~~/lib/MoApi/Records/RolesRecord';

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
let upd = ref(true);
let changes = ref(false)
let readingRights = ref(true)
let props = defineProps({
    allRights: Object,
    userRights: String,
    roleName: String,
    rightsSet: Object,
    creatingRight: Boolean
})

let updRight = ref(props.userRights?.includes('u'))
let nameRole = ref(props.roleName)
let cruds = ref<any>(props.roleName == 'admin' ? { '#AllRecords': props.rightsSet!['#AllRecords'] } : props.rightsSet)
let rights = ref<any>([])
let allRightsInRow = ref<any>([])
let allRightsSelected = ref(true)
rights.value = Object.keys(cruds.value).map((key) => {
    return { [key]: [] }
})


let role = ref<any>({});
const objTransform = () => {
    rights.value.map((right) => {
        let str = '';
        for (let r in right) {
            str = right[r].join('');
            role.value[r] = str;
        }
    })
    if (JSON.stringify(role.value) === JSON.stringify(cruds.value)) {
        changes.value = false
    } else {
        changes.value = true
    }
}

const selectAllRow = async (r, i, k) => {
    changes.value = true
    if (r[i][k].length !== 5) {
        allRightsSelected.value = true
        r[i][k] = ['c', 'r', 'u', 'd', 's'];
    } else {
        allRightsSelected.value = false
        r[i][k] = [];
    }
}

const editRights = async () => {
    upd.value = false;
    let mergedObj = ref(props.allRights);

    for (const key in cruds.value) {
        if (cruds.value) {
            mergedObj.value![key] = cruds.value[key];
        }
    }

    readingRights.value = false;
    cruds.value = mergedObj.value
    rights.value = Object.keys(mergedObj.value!).map((key) => {
        return { [key]: [] }
    })
    await nextTick();
    upd.value = true;
}

const cancelChange = async () => {
    upd.value = false;
    rights.value = Object.keys(cruds.value).map((key) => {
        return { [key]: [] }
    })
    await nextTick();
    readingRights.value = true;
    upd.value = true;
    changes.value = false
}

const updateOrCreateRights = async () => {
    objTransform();
    if (role.value['#AllRecords'] == '') {
        delete role.value['#AllRecords']
    }
    upd.value = false;
    console.log(role.value)
    let roleRec = await recStore.getOrCreate(RolesRecord, '');
    roleRec.MData.roles.setRole(props.roleName!, role.value);
    await roleRec.save();
    cruds.value = role.value;
    rights.value = Object.keys(cruds.value).map((key) => {
        return { [key]: [] }
    })
    readingRights.value = true;
    upd.value = true;
}

defineExpose({ updateOrCreateRights })
</script>
<style scoped>
.v-expansion-panel-text__wrapper {
    padding: 0;
}
</style>