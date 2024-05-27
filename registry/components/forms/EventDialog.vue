<template>
<v-card width="auto">
    <v-card-title class="px-2 bg-primary">
     <v-row class="pa-4">
       <div class="text-h5 ma-2">{{ props.creation? 'Новая запись на ' + props.event.start!.toLocaleDateString() : 'Запись на '+(props.event.start!.toLocaleDateString() +" в " + props.event.start!.toLocaleTimeString())}}</div>
       <v-spacer></v-spacer>
       <v-icon class="mt-2" @click="closeDialog">mdi-close</v-icon>
     </v-row>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row class="pa-2">
            <v-col cols="12" sm="6">
                <v-select v-model="employee" density="compact" label="Сотрудник" @update:model-value="changedEvent.employee = employee" :items="props.employees"
                  item-value="id" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
                <v-combobox v-model="client" density="compact" :disabled="clientCreationPop" label="Клиент" @update:model-value="checkedClient(client)" :items="clientArr" 
                clearable variant="underlined"></v-combobox>
                <span id="menu-activator"></span>
                <v-menu v-model="clientCreationPop" activator="#menu-activator" :close-on-content-click="false" location="bottom">
                    <v-card min-width="300" class="pa-4">
                        <v-text-field v-model="clientSurname"  v-maska:[fioOptions] variant="underlined" density="compact" label="Фамилия" @input="clientSurname = translit(clientSurname).charAt(0).toUpperCase() + translit(clientSurname).slice(1).toLowerCase()"></v-text-field>
                        <v-text-field v-model="clientName"  v-maska:[fioOptions] variant="underlined" density="compact" label="Имя" @input="clientName = translit(clientName).charAt(0).toUpperCase() + translit(clientName).slice(1).toLowerCase()"></v-text-field>
                        <v-text-field v-model="clientPatronymic"  v-maska:[fioOptions] variant="underlined" density="compact" label="Отчество" @input="clientPatronymic = translit(clientPatronymic).charAt(0).toUpperCase() + translit(clientPatronymic).slice(1).toLowerCase()"></v-text-field>
                        <v-text-field v-model="clientPhone" placeholder="+7(999) 999-99-99" v-maska:[phoneOptions] variant="underlined" density="compact" label="Телефон"></v-text-field>
                        <v-text-field v-model="clientBirthDate" variant="underlined" density="compact" label="Дата рождения"></v-text-field>
                        <v-btn variant="text" class="mt-2" @click="createNewClient()">Сохранить</v-btn>
                        <v-btn variant="text" class="mt-2" @click="clientCreationPopClose()">Отменить</v-btn>
                    </v-card>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
                <v-select v-model="speciality" density="compact" label="Специалист" :items="props.employees" item-title="specialist"  item-value="specialist"
                 variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
                <v-select v-model="service" density="compact" label="Услуга" :items="['Первичный прием', 'Вторичный прием']" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="start" density="compact" label="Начало" :items="availableTimeSlots" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="end" density="compact" label="Конец" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="quant" density="compact" label="Продолжительность" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="status" density="compact" label="Статус" @update:model-value="changedEvent.class = changeStatus(status)"
                 variant="underlined" :items="props.status" item-title="title" item-value="icon"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="place" density="compact" label="Кабинет" variant="underlined"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field v-model="clientPhone" placeholder="+7(999) 999-99-99" v-maska:[phoneOptions] density="compact" label="Телефон клиента" variant="underlined"></v-text-field>
            </v-col>
            <v-expansion-panels variant="accordion" >
                <v-expansion-panel :elevation="0" >
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col cols="12" sm="4">
                                <v-text-field density="compact" label="Эл. почта клиента" variant="underlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <v-text-field density="compact" label="Адрес" variant="underlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <v-text-field density="compact" label="СНИЛС" variant="underlined"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                    <v-expansion-panel-title>
                        <v-row><v-col class="d-flex justify-end">Больше информации о клиенте</v-col></v-row>
                    </v-expansion-panel-title>
                </v-expansion-panel>
            </v-expansion-panels>
            </v-row>
        </v-container>
    </v-card-text>
    <v-card-actions>
        <v-btn class="ma-1" variant="text" @click="cancelAndClose()">{{ props.creation? 'Отменить' : 'Удалить'}}</v-btn>
        <v-btn class="ma-1" variant="text" @click="saveChanges()">Сохранить</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="!props.creation" class="ma-1" variant="text" @click="currStatus()">Копировать</v-btn>
        <v-btn class="ma-1" variant="text">Создать расписание</v-btn>
        <!-- <v-btn v-if="props.creation" class="ma-1" variant="text" @click="openGroupDiag()">Групповое занятие</v-btn> -->
    </v-card-actions>
</v-card>
</template>

<script setup lang="ts">
// import GroupEventDialog from '~~/components/forms/GroupEventDialog.vue'


const emplChoice = (split, founding) => {
  for(let i=0; i<props.employees.length; i++){
    if(props.employees[i].id == split){
      return props.employees[i][founding]
    }
  }
}

const currStatus = () => {
    let classes = props.event.class.split(' ');
    return classes[3]
}

// Статусы добавляются посредством добавления классов: цвета и иконки, цвет идет на [1] позиции, а иконка на [3], в будущем с API или вручную можно реализовать смену цвета
const changeStatus = (status) => {
   let classes = props.event.class.split(' ');
   classes[3] = status;
   return classes.join(" ");
}

// const openGroupDiag = () => {
//     closeDialog;
//     openDialog(GroupEventDialog, {})
// }

const checkedClient = (check) => {
    if(check == addClient){
        clientCreationPop.value = true
    } else {
        // Функция запроса данных выбранного клиента с API
    }
}
// Отмена создания нового клиента
const clientCreationPopClose = () => {
    clientCreationPop.value = false;
    client.value='';
    clientSurname.value='';
    clientName.value='';
    clientPatronymic.value='';
    clientPhone.value='';
    clientBirthDate.value='';
}

// Создание нового клиента
const createNewClient = () => {
    client.value = clientSurname.value + " " + clientName.value + " " + clientPatronymic.value;
    changedEvent.value.title = client.value;
    // Запрос на API создание нового клиента
    clientCreationPop.value = false;
}

const findEmployeeById = (id: string) => {
    return props.employees.find(employee => employee.id === id);
}

interface Props {
    event: any,
    employees: any,
    status: any,
    creation: boolean,
    delFunc: Function,
    mainAction: Function
}

 const props = defineProps<Props> ()
 let availableTimeSlots = ref<any>([])
 let clientName = ref()
 let clientSurname = ref()
 let clientPatronymic = ref()
 let clientPhone = ref()
 let clientEmail = ref()
 let clientBirthDate = ref()
 let clientCreationPop = ref(false)
 let addClient = 'Добавить клиента'
 let clientArr = ref([addClient])
 let client = ref(props.event.title? props.event.title : '')
 let service = ref(props.event.content)
 let employee = ref(findEmployeeById(props.event.split))
 let speciality = ref(emplChoice(props.event.split, 'specialist'))
 let place = ref()
 let status = ref(currStatus())//Статус приходит с API, по названию статуса проходимся по массиву с иконками и берем иконку соответсвующую названию, добавляем иконку в класс события
 let evTitle= ref(props.event.title)
 let start = ref(props.event.start!.formatTime())
 let end = ref(props.event.end!.formatTime())
 let quant = ref(props.event.duration? props.event.duration : props.event.endTimeMinutes - props.event.startTimeMinutes)
 console.log(start.value)


let changedEvent = ref({
    title: client.value,
    employee: employee.value,
    speciality: speciality.value,
    class: props.event.class,
 })

const cancelAndClose = () => {
    props.delFunc();
    closeDialog('');
}

const saveChanges = () => {
    props.mainAction(changedEvent.value);
    closeDialog('');
}



let translit = (word) => {
   const converter = {
     'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
     'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
     'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
     'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
     'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц', ';': 'ж',
     "'": 'э', ',': 'б', "x": "ч", 'q': 'й', '.': 'ю'
   };
 
   for (const [key, value] of Object.entries(converter)) {
     word = word.replaceAll(key, value);
   }
 
   return word;
}

const phoneOptions = {
  mask: "+7(###) ###-##-##"
}

const fioOptions = {
  mask: "Aa",
  tokens: {
    A:{pattern: /[A-я;,.']/},
    a:{pattern: /[a-я;,.']/, multiple: true}
  }
}
</script>