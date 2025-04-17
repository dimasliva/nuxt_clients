<template>
  <div
    class="d-flex justify-space-between flex-grow-0 ma-0 pt-3 px-4 bg-background w-100"
  >
    <!--Название страницы-->
    <p class="text-h6 text-secondary font-weight-bold mx-2">
      {{ currPage.title }}
    </p>
    <div>
      <v-btn v-if="currPin" variant="text" icon size="small" @click="onPinPage">
        <v-icon color="secondary">mdi-pin</v-icon>
        <v-tooltip activator="parent" location="top">{{$t('pin')}}</v-tooltip>
      </v-btn>
      <v-btn v-else variant="text" size="small" @click="unpinPage" icon>
        <v-icon color="secondary">mdi-pin-off</v-icon>
        <v-tooltip activator="parent" location="top">{{$t('unpin')}}</v-tooltip>
      </v-btn>
    </div>
    
    <v-spacer></v-spacer>
    <!--Пользовательские кнопки страницы-->
    <FeaturePageHeaderUiPageBtns />
    <!--Пользовательское меню страницы-->
    <!-- <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn v-if="currPageMenu?.icon" v-bind="props" variant="outlined" color="secondary" size="small" class="mx-4"
          :icon="currPageMenu?.icon" />
      </template>
      <v-list>
        <v-list-item v-for="child in currPageMenu?.childs" :key="child.id" :disabled="child.disabled"
          @click="child.action">
          <v-list-item-title>{{ child.title }}<v-icon end :icon="child.icon" size="x-small" /></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu> -->
  </div>
</template>

<script setup lang="ts">
import { usePageHeader } from "../../model/hooks/usePageHeader";

const { currPin, currPage, onPinPage, unpinPage } = usePageHeader();
</script>
