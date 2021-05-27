import { gql } from '@apollo/client'

export default gql`
  fragment Stage on ApplicationStageStatusLatest {
    stage
    stageId
    stageColour
    status
    stageNumber
    statusHistoryTimeCreated
  }
`
