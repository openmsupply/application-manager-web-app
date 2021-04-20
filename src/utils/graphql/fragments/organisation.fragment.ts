import { gql } from '@apollo/client'

export default gql`
  fragment Organisation on Organisation {
    id
    name
    address
    registration
    logoUrl
  }
`
