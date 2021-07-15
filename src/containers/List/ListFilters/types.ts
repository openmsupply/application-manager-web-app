import { ReactNode } from 'react'
import { SemanticICONS } from 'semantic-ui-react'
import { BooleanFilterMapping, FilterTypes, GetFilterListQuery } from '../../../utils/types'

export type GetActiveOptions = () => string[]
export type SetActiveOption = (option: string) => void
export type SetInactiveOption = (option: string) => void

export type GetMethodsForOptionFilter = (filterName: string) => {
  getActiveOptions: GetActiveOptions
  setActiveOption: SetActiveOption
  setInactiveOption: SetInactiveOption
}

export type FiltersCommon = {
  title?: string
  onRemove: () => void
}

export type OptionsFiltersCommon = {
  getActiveOptions: GetActiveOptions
  setActiveOption: SetActiveOption
  setInactiveOption: SetInactiveOption
}

export type EnumFilterProps = FiltersCommon & OptionsFiltersCommon & { enumList: string[] }

export type SearchableListFilterProps = FiltersCommon &
  OptionsFiltersCommon & {
    getFilterListQuery: GetFilterListQuery
    filterListParameters: any
  }

export type StaticListFilterProps = SearchableListFilterProps

export type FilterOptionsProps = {
  setActiveOption: SetActiveOption
  setInactiveOption: SetInactiveOption
  activeOptions: string[]
  optionList: string[]
}

export type FilterContainerProps = FiltersCommon & {
  selectedCount?: number
  replacementTrigger?: ReactNode
}

export type FilterIconMapping = Partial<{ [key in FilterTypes]: SemanticICONS }>

export type BooleanFilterProps = FiltersCommon & {
  activeOptions: string[]
  booleanMapping: BooleanFilterMapping
  toggleFilter: (value: boolean) => void
}
