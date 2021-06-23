import { gql } from '@apollo/client'

export default gql`
  query getHistoryForApplicant($serial: String!, $questionCode: String!, $templateCode: String!) {
    # TODO - Send correct version for template instead of hardcoded: templateVersion: 1
    templateElementByTemplateCodeAndCodeAndTemplateVersion(
      code: $questionCode
      templateCode: $templateCode
      templateVersion: 1
    ) {
      ...elementFragment
      reviewResponses(filter: { isVisibleToApplicant: { equalTo: true } }) {
        nodes {
          ...reviewResponseFragment
        }
      }
      applicationResponses(filter: { application: { serial: { equalTo: $serial } } }) {
        nodes {
          ...applicationResponseFragment
          application {
            ...Application
            user {
              ...User
            }
          }
        }
      }
    }
  }
`
