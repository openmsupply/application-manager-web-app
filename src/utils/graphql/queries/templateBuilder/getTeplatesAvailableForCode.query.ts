import { gql } from '@apollo/client'

export default gql`
  query getTeplatesAvailableForCode($code: String!) {
    templates(filter: { status: { equalTo: AVAILABLE }, code: { equalTo: $code } }) {
      nodes {
        id
        code
        status
      }
    }
  }
`
