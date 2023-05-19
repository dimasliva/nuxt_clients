<template>
  <v-card  class="mx-auto" max-width="344">
    <v-btn icon variant="text" @click="closeDialog()">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card-item>
      <div class="mb-3">
        <div class="text-h6">
          Подтвердите свое дейсвие
        </div>
        <div class="text-caption">Вы дейсвительно хотите удалить сотрудника?</div>
      </div>
    </v-card-item>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="outlined" rounded="xl" @click="confAct(props.empl)">
        Удалить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const confAct = async (empl) => {
  console.log(empl)
  if(empl.length){
    await empl.forEach(el => {props.action(el.id)});
    closeDialog();
  } else {
    await props.action(empl.id);
    closeDialog();
  }
}
const props = defineProps({
  empl: Object,
  action: Function
})

</script>