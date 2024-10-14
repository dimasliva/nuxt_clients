
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { FinderFormMultipleTemplate, type IFinderFormMultipleProps } from "./finderFormMultipleTemplate";
import * as Utils from '~~/lib/Utils';



export interface IFinderFormSelectProps extends IFinderFormMultipleProps {
    selectedOptionsValues?: any[];
}

let t: any;


export  class FinderFormSelectTemplate extends FinderFormMultipleTemplate {

    sections = ref([] as { id: string, title: string }[])
    selectedSections = ref<any>([])



    override async setup(props: IFinderFormSelectProps, ctx?) {
        await super.setup(props, ctx);
        if (props.selectedOptionsValues) {
            this.sections.value = props.selectedOptionsValues;
        }
    }



    override async getValueList() {
        return await this._props.finderDataProvider.getList(this._searchingText.value, this.selectedSections.value);
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

        return <v-select hide-details deta chips closable-chips multiple label="Искать в:" items={this.sections.value} v-model={this.selectedSections.value}
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



    override render() {
        return (createElement, context) =>
            <WindowDialog diC={this._diC} frameHeaderData={{ title: this._props.title }} width="70%" height="100%" onOk={() => this.onOk()}>
            
            <div class="d-flex flex-column h-100">

                <v-row class="flex-0-1" no-gutters>
                    {
                        this.getSelectPanel()
                    }
                </v-row>

             
                {this.getMainSearchField()}
              

                <v-row  class="overflow-y-auto flex-0-1" style="height:60%" >
                    {
                        this._loading.value ?
                            <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                            :
                            this._valueList.value == null ?
                                this.getMostFreqChoose(95)
                                :
                                (this._valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
                    }
                </v-row>

                <v-row class="flex-1-1"  no-gutters style="height:1%">
                    {
                        this.getChoosePanel()
                    }
                </v-row>
                </div>
                
            </WindowDialog>
    }
}