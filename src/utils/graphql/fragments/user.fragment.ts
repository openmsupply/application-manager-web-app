import { gql } from '@apollo/client'

export default gql`
  fragment User on User {
    id
    username
    firstName
    lastName
    email
    dateOfBirth
  }
`
