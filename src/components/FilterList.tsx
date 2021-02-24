import React from 'react'
import { Button, List } from 'semantic-ui-react'
import { useRouter } from '../utils/hooks/useRouter'

const FilterList: React.FC = () => {
  const { updateQuery } = useRouter()

  return (
    <List horizontal>
      <List.Item>
        <Button
          key={`app-list-button-draft-assessment`}
          content="Change query: Draft/Assessment"
          onClick={() => updateQuery({ status: 'draft', stage: 'assessment' })}
        />
      </List.Item>
      <List.Item>
        <Button
          key={`app-list-button-submitted-screening`}
          content="Change query: Submitted/Screening"
          onClick={() => updateQuery({ status: 'submitted', stage: 'screening' })}
        />
      </List.Item>
      <List.Item>
        <Button
          key={`app-list-button-reset`}
          content="Reset query"
          onClick={() => updateQuery({ status: '', stage: '' })}
        />
      </List.Item>
    </List>
  )
}

export default FilterList
