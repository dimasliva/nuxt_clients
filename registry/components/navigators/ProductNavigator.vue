
<template>
    <Navigator :onNavigate="(level: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: TNavRow | null) =>
        onNavigate(level, nextlevel, currPath, row)" />;
</template>



<script setup lang="ts">
import type { PageMemoryCacheStore } from "~/lib/Cache/PageMemoryCacheStore";
import type { INavColumn, INavPathItem, TNavRow, INavigatorContent, INavigatorProps, IСoncreteNavigatorProps } from "./NavigatorTypes"
import Navigator from "~/components/navigators/Navigator.vue";


const props = defineProps<IСoncreteNavigatorProps>();

const diC= props.diC || useContainer();

const pageCacheStore=diC.get<PageMemoryCacheStore>("PageCacheStore");



const onNavigate = async (level: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: TNavRow | null) => {

}


</script>