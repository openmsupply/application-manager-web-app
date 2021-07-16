import { gql } from '@apollo/client'

export default gql`
  mutation updateResponse($id: Int!, $value: JSON, $isValid: Boolean, $stageNumber: Int) {
    updateApplicationResponse(
      input: { id: $id, patch: { value: $value, isValid: $isValid, stageNumber: $stageNumber } }
    ) {
      applicationResponse {
        ...applicationResponseFragment
        templateElement {
          ...elementFragment
        }
      }
    }
  }
`
