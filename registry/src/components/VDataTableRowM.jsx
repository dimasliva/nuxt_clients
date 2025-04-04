//выдрано c https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/labs/VDataTable/VDataTableRow.tsx убраны типы т.к. толку от них никакого, а в tsx появляются
//ошибки onClick

// Components
import { VBtn } from 'vuetify/components/VBtn'
import { VCheckboxBtn } from 'vuetify/components/VCheckbox'

// Composables
import { useExpanded} from 'vuetify/lib/labs/VDataTable/composables/expand.mjs'
import { useHeaders } from 'vuetify/lib/labs/VDataTable/composables/headers.mjs'
import { useSelection } from 'vuetify/lib/labs/VDataTable/composables/select.mjs'
import { VDataTableColumn } from 'vuetify/lib/labs/VDataTable/VDataTableColumn.mjs'

// Utilities
import { withModifiers } from 'vue'
import { defineComponent, getPropertyFromItem, propsFactory, useRender } from 'vuetify/lib/util/index.mjs'



export const makeVDataTableRowProps = propsFactory({
  index: Number,
  item: Object ,
  onClick: Function
}, 'VDataTableRow')

export const VDataTableRowM = defineComponent({
  name: 'VDataTableRowM',

  props: makeVDataTableRowProps(),

  setup (props, { slots }) {

    const { isSelected, toggleSelect } = useSelection()
    const { isExpanded, toggleExpand } = useExpanded()
    const { columns } = useHeaders()

    useRender(() => (
      <tr
        class={[
          'v-data-table__tr',
          {
            'v-data-table__tr--clickable': !!props.onClick,
          },
        ]}
        onClick={ props.onClick }
      >
        { props.item && columns.value.map((column, i) => (
          <VDataTableColumn
            align={ column.align }
            fixed={ column.fixed }
            fixedOffset={ column.fixedOffset }
            lastFixed={ column.lastFixed }
            noPadding={ column.key === 'data-table-select' || column.key === 'data-table-expand' }
            width={ column.width }
          >
            {{
              default: () => {
                const item = props.item
                const slotName = `item.${column.key}`
                const slotProps = {
                  index: props.index,
                  item: props.item,
                  columns: columns.value,
                  isSelected,
                  toggleSelect,
                  isExpanded,
                  toggleExpand,
                }

                if (slots[slotName]) return slots[slotName](slotProps)

                if (column.key === 'data-table-select') {
                  return slots['item.data-table-select']?.(slotProps) ?? (
                    <VCheckboxBtn
                      disabled={ !item.selectable }
                      modelValue={ isSelected([item]) }
                      onClick={( withModifiers(() => toggleSelect(item), ['stop'])) }
                    />
                  )
                }

                if (column.key === 'data-table-expand') {
                  return slots['item.data-table-expand']?.(slotProps) ?? (
                    <VBtn
                      icon={ isExpanded(item) ? '$collapse' : '$expand' }
                      size="small"
                      variant="text"
                      onClick={ withModifiers(() => toggleExpand(item), ['stop']) }
                    />
                  )
                }

                return getPropertyFromItem(item.columns, column.key)
              },
            }}
          </VDataTableColumn>
        ))}
      </tr>
    ))
  },
})


export default VDataTableRowM;