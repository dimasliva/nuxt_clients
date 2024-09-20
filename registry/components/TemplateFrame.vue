<template>
    <v-card>
        <v-card-title class="mx-2">
            <v-row class="pt-4 pb-4 align-center">
                <v-spacer></v-spacer>
                <!--Пользовательские кнопки окна-->
                <template v-for="(buttons, index) in frameHeaderData.mainBtnBar" :key="buttons.id">
                    <v-btn :disabled="buttons.disabled" elevation="0" class="mx-2" rounded="xl" :id="buttons.id"
                        :index="index" :icon="(buttons.title.length) ? false : buttons.icon"
                        :prepend-icon="(buttons.title.length >= 1) ? buttons.icon : undefined" variant="text"
                        :color="buttons.color" :background-color="buttons.bkgColor"
                        :text="(buttons.title.length) ? buttons.title : undefined"
                        :density="(buttons.title.length) ? `default` : `comfortable`" @click="() => buttons.action()" />
                </template>
                <!--Пользовательское меню окна-->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn v-if="frameHeaderData.mainMenu" v-bind="props" variant="outlined" color="secondary"
                            size="small" class="mx-4" :icon="frameHeaderData.mainMenu.icon" />
                    </template>
                    <v-list>
                        <v-list-item v-for="child in frameHeaderData.mainMenu?.childs" :key="child.id"
                            :disabled="child.disabled" @click="() => child.action()">
                            <v-list-item-title>{{ child.title }}<v-icon end :icon="child.icon"
                                    size="x-small" /></v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-row>
        </v-card-title>

        <v-card-text class="overflow-y-auto pb-0">
            <TemplateRenderer :templateInstance="templateInstance"  />
        </v-card-text>
    </v-card>
</template>




<script lang="ts">
import type { SetupContext } from 'vue';
import { StandartComponentEvents, type IRenderedTemplateComponent, type IRenderedTemplateComponentProps } from '~/componentTemplates/componentTemplates';
import TemplateRenderer from '~/components/TemplateRenderer.vue'


interface IProps {
    templateInstance: IRenderedTemplateComponent,
    props?: IRenderedTemplateComponentProps
}



export default {
    emits: StandartComponentEvents,

    props: {
        templateInstance: {
            type: Object as PropType<IRenderedTemplateComponent>,
            required: true
        }
    },


    async setup(props: IProps, ctx: SetupContext) {
        return {
            frameHeaderData: props.templateInstance.getFrameHeaderData?.() || { title: "" }
        }
    }
}


</script>