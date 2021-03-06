import { gql } from '@apollo/client'

export default gql`
  mutation createApplication(
    $name: String!
    $serial: String!
    $templateId: Int!
    $userId: Int
    $orgId: Int
    $sessionId: String!
    $outcome: ApplicationOutcome = PENDING
    $trigger: Trigger = ON_APPLICATION_CREATE
    $sections: [ApplicationSectionApplicationIdFkeyApplicationSectionCreateInput!]
    $responses: [ApplicationResponseApplicationIdFkeyApplicationResponseCreateInput!]
  ) {
    createApplication(
      input: {
        application: {
          name: $name
          serial: $serial
          templateId: $templateId
          userId: $userId
          orgId: $orgId
          sessionId: $sessionId
          isActive: true
          outcome: $outcome
          trigger: $trigger
          applicationSectionsUsingId: { create: $sections }
          applicationResponsesUsingId: { create: $responses }
        }
      }
    ) {
      application {
        userId
        orgId
        ...Application
        template {
          ...Template
          templateSections {
            nodes {
              ...Section
            }
          }
        }
      }
    }
  }
`
