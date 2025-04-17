<template>
    <v-row justify="start" class="ma-0 bg-tertiary" style="height: 40px !important;">
        <v-col v-for="(selection, i) in getPinnedPages" :key="selection.title" cols="auto" class="py-1 pe-0">
            <v-chip closable class="bg-secondary ma-0" @click="toPage(selection.link)"
                @click:close="() => unpinPageByIndex(i)">
                {{ selection.title }}
            </v-chip>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import { usePinnedPage } from '../model/hooks/usePinnedPage';

const { getPinnedPages, unpinPageByIndex } = usePinnedPage()
</script>