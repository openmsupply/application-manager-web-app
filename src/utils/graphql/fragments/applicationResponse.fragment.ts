import { gql } from '@apollo/client'

export default gql`
  fragment applicationResponseFragment on ApplicationResponse {
    id
    isValid
    value
    templateElement {
      code
    }
    templateElementId
    timeUpdated
  }
`
