import { gql } from '@apollo/client'

export default gql`
  query getApplicationSerial($id: Int!) {
    application(id: $id) {
      serial
      name
      trigger
    }
  }
`
