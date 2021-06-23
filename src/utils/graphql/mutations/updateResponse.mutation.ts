import { gql } from '@apollo/client'

export default gql`
  mutation updateResponse($id: Int!, $value: JSON, $isValid: Boolean) {
    updateApplicationResponse(input: { id: $id, patch: { value: $value, isValid: $isValid } }) {
      applicationResponse {
        ...applicationResponseFragment
        templateElement {
          ...elementFragment
        }
      }
    }
  }
`
