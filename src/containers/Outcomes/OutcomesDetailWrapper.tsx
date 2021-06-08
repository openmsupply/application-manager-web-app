import React from 'react'

import { NoMatch } from '../../components'
import { useRouter } from '../../utils/hooks/useRouter'
import { OutcomeDisplaysStructure } from '../../utils/types'
import ApplicationLinks from './ApplicationLinks'
import OutcomeDetails from './OutcomesDetail'

const OutcomeDetailsWrapper: React.FC<{ displays: OutcomeDisplaysStructure }> = ({ displays }) => {
  const {
    query: { code, id: idAsString },
  } = useRouter()

  const {
    outcomeDisplays,
    detailDisplaysByCode,
    detailDisplayQueryByCode,
    applicationLinkQueryByCode,
  } = displays

  const detailDisplayColumns = detailDisplaysByCode[code]
  const detailQuery = detailDisplayQueryByCode[code]
  const applicationLinkQuery = applicationLinkQueryByCode[code]
  const outcomeDisplay = outcomeDisplays.find(({ code: codeToMatch }) => codeToMatch === code)
  const id = Number(idAsString)

  if (!detailDisplayColumns || !detailQuery || !outcomeDisplay || isNaN(id)) return <NoMatch />

  return (
    <div id="outcomes-display">
      <OutcomeDetails
        detailDisplayColumns={detailDisplayColumns}
        id={id}
        headerColumn={outcomeDisplay.detailColumnName}
        detailQuery={detailQuery}
      />
      <ApplicationLinks applicationLinkQuery={applicationLinkQuery} id={id} />
    </div>
  )
}

export default OutcomeDetailsWrapper
