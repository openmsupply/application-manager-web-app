import { gql } from '@apollo/client'

export default gql`
  query getApplicationStatus($serial: String!) {
    applicationStageStatusAlls(
      condition: { serial: $serial, stageIsCurrent: true, statusIsCurrent: true }
    ) {
      nodes {
        stage
        stageId
        status
        statusHistoryTimeCreated
      }
    }
  }
`
// TODO: Remove after re-structure is finished
