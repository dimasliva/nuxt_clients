<template>
    <v-app-bar color="primary" density="compact" elevation="0" v-if="user">
        <v-app-bar-nav-icon @click="toggleSidebar"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-menu>
            <template v-slot:activator="{ props }">
                <p>{{ user.name }}</p> 
                <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-list-item-title>{{ getFIO(user) }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="toPage('/settings')">
                    <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small" /></v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="toPage('/signout')">
                    <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small" /></v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>
<script lang="ts" setup>
import { getFIO, toPage } from '~/src/shared/utils/useFunctions/userFunctions';
import { useNavbar } from '../model/hooks/useNavbar';

const {user, toggleSidebar} = useNavbar()
</script>