import React from 'react'
import { List } from 'semantic-ui-react'
import { SectionDetails } from '../../../utils/types'

interface SectionsListProps {
  sections: SectionDetails[]
}

const SectionsList: React.FC<SectionsListProps> = ({ sections }) => {
  return (
    <List divided relaxed="very">
      {Object.entries(sections).map(([sectionCode, { title }]) => (
        <List.Item key={`list-item-${sectionCode}`} icon="circle outline" header={title} />
      ))}
    </List>
  )
}

export default SectionsList
