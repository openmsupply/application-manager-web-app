import { gql } from '@apollo/client'

export default gql`
  query getAllAssociatedResponses($responseId: Int!) {
    applicationResponse(id: $responseId) {
      id
      templateElement {
        applicationResponses {
          nodes {
            value
            timeUpdated
            reviewResponses {
              nodes {
                comment
                timeUpdated
                review {
                  reviewer {
                    firstName
                    lastName
                  }
                }
                decision
              }
            }
          }
        }
      }
    }
  }
`
