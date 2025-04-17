<template>
    <template v-for="(buttons, index) in currPage.btns" :key="buttons.id" >
      <v-btn v-if="currPage.btns" :disabled="buttons.disabled" elevation="0" class="mx-2" rounded="xl"
        :id="buttons.id" :index="index" :icon="(buttons.title.length) ? false : buttons.icon"
        :prepend-icon="(buttons.title.length >= 1) ? buttons.icon : undefined" variant="text" :color="buttons.color"
        :background-color="buttons.bkgColor" :text="(buttons.title.length) ? buttons.title : undefined"
        :density="(buttons.title.length) ? `default` : `comfortable`" @click="buttons.action()" />
    </template>
</template>

<script setup lang="ts">


const {currPage} = usePageBtns()

</script>