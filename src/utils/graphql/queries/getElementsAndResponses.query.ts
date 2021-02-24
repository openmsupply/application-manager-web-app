import { gql } from '@apollo/client'

export default gql`
  query getElementsAndResponses($serial: String!) {
    applicationBySerial(serial: $serial) {
      ...Application
      applicationResponses {
        nodes {
          ...Response
          templateElement {
            code
          }
        }
      }
      template {
        ...Template
        templateSections {
          nodes {
            ...Section
            templateElementsBySectionId {
              nodes {
                ...Element
              }
            }
          }
        }
      }
    }
  }
`
// TODO: Remove after re-structure is finished
