import { gql } from '@apollo/client'

export default gql`
  mutation restartApplication($serial: String!, $applicationPatch: ApplicationPatch!) {
    updateApplicationBySerial(input: { serial: $serial, patch: $applicationPatch }) {
      application {
        ...Application
        applicationResponses {
          nodes {
            ...applicationResponseFragment
          }
        }
      }
    }
  }
`
