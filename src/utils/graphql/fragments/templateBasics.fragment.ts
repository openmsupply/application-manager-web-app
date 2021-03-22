import { gql } from '@apollo/client'

export default gql`
  fragment TemplateBasics on Template {
    code
    id
    name
    startMessage
  }
`
