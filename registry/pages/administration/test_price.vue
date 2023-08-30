<template>
<v-card width="50%">
    <v-card-actions>
        <v-btn color="primary" @click="() => {}">печать</v-btn>
    </v-card-actions>
                <v-expansion-panels class="w-100">
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <v-row class="w-100">
                                <v-col cols="6" class="d-flex justify-start">
                                Первичный осмотр
                                </v-col>
                                <v-col cols="6" class="d-flex justify-end">
                                    1000р
                                </v-col>
                            </v-row>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            Длительность улсуги: 1 час
                        </v-expansion-panel-text>
                    </v-expansion-panel>
    </v-expansion-panels>
</v-card>
</template>