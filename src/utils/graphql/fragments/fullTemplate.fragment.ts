import { gql } from '@apollo/client'

export default gql`
  fragment FullTemplate on Template {
    ...Template
    nodeId
    configApplications: applications(filter: { isConfig: { equalTo: true } }) {
      nodes {
        serial
        id
      }
    }
    applications(filter: { isConfig: { equalTo: false } }) {
      totalCount
    }
    version
    versionTimestamp
    templateSections(orderBy: INDEX_ASC) {
      nodes {
        ...Section
        templateElementsBySectionId(orderBy: INDEX_ASC) {
          nodes {
            ...elementFragment
          }
        }
      }
    }
    templateStages {
      nodes {
        id
        number
        title
        description
      }
    }
  }
`
