<template>
      <v-dialog fullscreen :scrim="false" transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar color="primary">
            <v-btn icon @click="$emit('modal-off')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Профиль</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn variant="text" @click="$emit('modal-off')">
                {{ buttonName }}
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <template>
            <v-card v-for="el in dialogFormProps" class="w-50 ma-2 pa-2 bg-tertiary overflow-y-auto">
              <v-text-field v-for="(param, i) in el" v-model="el[i]" :value="param" clearable :is="param"></v-text-field>
            </v-card>
          </template>
          some text
        </v-card>
    </v-dialog>
</template>

<script setup>

const props = defineProps({
  dialogFormProps: Array
})

</script>