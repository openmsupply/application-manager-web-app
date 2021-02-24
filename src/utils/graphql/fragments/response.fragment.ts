import { gql } from '@apollo/client'

export default gql`
  fragment Response on ApplicationResponse {
    id
    isValid
    value
    templateElement {
      code
    }
    templateElementId
    timeCreated
  }
`
