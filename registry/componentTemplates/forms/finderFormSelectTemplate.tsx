
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { FinderFormMultipleTemplate, type IFinderFormMultipleProps } from "./finderFormMultipleTemplate";
import * as Utils from '~~/lib/Utils';



export interface IFinderFormSelectProps extends IFinderFormMultipleProps {
    selectedOptionsValues?: any[];
}

let t: any;


export abstract class FinderFormSelectTemplate extends FinderFormMultipleTemplate {

    sections = ref([] as { id: string, title: string }[])
    selectedSections = ref<any>([])



    async setup(props: IFinderFormSelectProps, ctx?) {
        await super.setup(props, ctx);
        if (props.selectedOptionsValues) {
            this.sections.value = props.selectedOptionsValues;
        }
    }



    async getValueList() {
        return await this.props.finderDataProvider.getList(this.searchingText.value, this.selectedSections.value);
    }



    /**Поле для выбора из списка*/
    getSelectPanel(){
        const isAllSelected = () => {
            return this.selectedSections.value.length === this.sections.value.length 
        }
        const toggle = () =>  {
            if (isAllSelected()) {
              this.selectedSections.value = []
            } else {
              this.selectedSections.value = this.sections.value.map((section) => section.id)
            }
        }

        return <v-select chips closable-chips multiple label="Искать в:" items={this.sections.value} v-model={this.selectedSections.value}
         item-title="title" item-value="id" variant="underlined">
              {{ 
                "prepend-item": () => 
                <>
                    <v-list-item title="Все" onClick={toggle}>
                        {{ prepend: () => 
                        <v-checkbox-btn modelValue={isAllSelected()}></v-checkbox-btn>
                        }}
                    </v-list-item>
                    <v-divider></v-divider>
                </>
            }} 

         </v-select>
    }



    render() {
        return (createElement, context) =>
            <WindowDialog diC={this.props.diC} frameHeaderData={{ title: this.props.title }} width="700" height="85dvh" onOk={() => this.onOk()}>
                {this.getMainSearchField()}

                <v-row style="height: auto">
                    {
                        this.getSelectPanel()
                    }
                </v-row>

                <v-row style="height:40%;" class="overflow-y-auto" >
                    {
                        this.loading.value ?
                            <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                            :
                            this.valueList.value == null ?
                                this.getMostFreqChoose(95)
                                :
                                (this.valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
                    }
                </v-row>

                <v-row style="height:27%;" >
                    {
                        this.getChoosePanel()
                    }
                </v-row>
            </WindowDialog>
    }
}