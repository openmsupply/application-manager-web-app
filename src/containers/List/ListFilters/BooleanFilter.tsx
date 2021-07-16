import React from 'react'
import { Checkbox, Dropdown } from 'semantic-ui-react'
import { FilterContainer } from './common'
import { BooleanFilterProps } from './types'

const BooleanFilter: React.FC<BooleanFilterProps> = ({
  onRemove,
  title,
  activeOptions,
  booleanMapping,
  toggleFilter,
}) => {
  const option = activeOptions.length === 0 ? null : activeOptions[0].toLowerCase() === 'true'

  const renderOption = (value: boolean) => (
    <Dropdown.Item
      key={`${value}`}
      onClick={(e) => {
        toggleFilter(value)
      }}
    >
      <Checkbox radio label={booleanMapping[value ? 'true' : 'false']} checked={option === value} />
    </Dropdown.Item>
  )

  return (
    <FilterContainer selectedCount={activeOptions.length} title={title} onRemove={onRemove}>
      {renderOption(true)}
      {renderOption(false)}
    </FilterContainer>
  )
}

export default BooleanFilter
