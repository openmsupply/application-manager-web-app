import React from 'react'
import { NoMatch } from '../../components'
import { useRouter } from '../../utils/hooks/useRouter'
import { OutcomeDisplaysStructure } from '../../utils/types'
import OutcomeTable from './OutcomesTable'

const OutcomeTableWrapper: React.FC<{ displays: OutcomeDisplaysStructure }> = ({ displays }) => {
  const {
    query: { code },
  } = useRouter()

  const { tableDisplaysByCode, tableDisplayQueryByCode, outcomeDisplays } = displays

  const tableDisplayColumns = tableDisplaysByCode[code]
  const tableQuery = tableDisplayQueryByCode[code]
  const outcomeDisplay = outcomeDisplays.find(({ code: codeToMatch }) => codeToMatch === code)

  if (!tableDisplayColumns || !tableQuery || !outcomeDisplay) return <NoMatch />

  return (
    <OutcomeTable
      outcomeDisplay={outcomeDisplay}
      tableDisplayColumns={tableDisplayColumns}
      tableQuery={tableQuery}
      outcomeCode={code}
    />
  )
}

export default OutcomeTableWrapper
