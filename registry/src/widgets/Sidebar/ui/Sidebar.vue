<template>
    <v-navigation-drawer @mouseenter="onNavigationEnter" @mouseleave="onNavigationLeave" v-model="drawer"
        :rail="isSidebarVisible" permanent class="bg-tertiary" floating :width="drawerWidth">
        <v-list v-model:opened="opened" open-strategy="single" :selected="selected" select-strategy="independent">
            <v-list-item prepend-icon="mdi-magnify" :active="false" value="search" @click="onSearchClick">
                <v-text-field ref="pInput" label="Поиск..." v-model="input" single-line :focused="false" clearable
                    hide-details density="compact" @click:clear="clearSearchInput">
                    <v-tooltip v-if="isSidebarVisible" activator="parent" location="right">Поиск</v-tooltip>
                </v-text-field>
            </v-list-item>
            <!--Левое меню-->
            <template v-for="item in filteredItems">
                <v-list-group v-if="item.childs && item.childs.length > 0"
                    :value="item.title"
                    >
                    <template v-slot:activator="{ props }">
                        <v-list-item @click="closeSidebar" :active="false" v-bind="props" :prepend-icon="item.icon"
                            :title="item.title">
                            <v-tooltip v-if="isSidebarVisible" activator="parent" location="right">
                                {{ item.title }}
                            </v-tooltip>
                        </v-list-item>
                    </template>
                    <v-list-item 
                        v-for="el in item.childs" 
                        :key="el.title" 
                        @click="openPage(el.getPagePath())"
                       >
                        <v-icon :icon="el.icon" size="x-small" start color="secondary"></v-icon>
                        <v-list-item-title class="text-body-2 d-inline">
                            {{ el.title }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list-group>
                <v-list-item v-else :prepend-icon="item.icon" :title="item.title" :value="item.title" :active="false"
                    @click="openPage(item.getPagePath())">
                    <v-tooltip v-if="isSidebarVisible" activator="parent" location="right">{{ item.title }}</v-tooltip>
                </v-list-item>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useSidebar } from '../model/hooks/useSidebar';

const {
    drawer,
    isSidebarVisible,
    drawerWidth,
    opened,
    selected,
    input,
    pInput,
    filteredItems,
    openPage,
    closeSidebar,
    clearSearchInput,
    onNavigationLeave,
    onNavigationEnter,
    getFilteredChapters,
    onSearchClick
} = useSidebar()

onMounted(() => {
    getFilteredChapters()
})
</script>