import { useQuery } from '@apollo/client'
import React from 'react'
import { Link } from 'react-router-dom'
import { Message, Header } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { OutcomeCountQuery, OutcomeDisplaysStructure } from '../../utils/types'

const OutcomeList: React.FC<{ displays: OutcomeDisplaysStructure }> = ({ displays }) => {
  const { outcomeDisplays, outcomeCountQueryByCode } = displays

  return (
    <div id="outcomes-display">
      <Header as="h4">Outcomes</Header>
      <div className="outcomes-container">
        {outcomeDisplays.map(({ code, title }) => {
          const outcomeCountQuery = outcomeCountQueryByCode[code]
          if (!outcomeCountQuery) return null

          return <Outcome code={code} title={title} outcomeCountQuery={outcomeCountQuery} />
        })}
      </div>
    </div>
  )
}

const Outcome: React.FC<{ code: string; title: string; outcomeCountQuery: OutcomeCountQuery }> = ({
  code,
  title,
  outcomeCountQuery,
}) => {
  const { data, error } = useQuery(outcomeCountQuery.query, { fetchPolicy: 'network-only' })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error.message]} />
  if (!data) return null

  const count = outcomeCountQuery.getCount(data)

  // Outcomes would be available for all users, but only visible if user can see records in the table
  if (count === 0) return null

  return (
    <Link className="clickable" to={`/outcomes/${code}`}>
      <div className="outcome">
        <Header
          as="h3"
          className="clickable"
          onClick={() => {
            console.log('yow')
          }}
        >
          {`${title} (${count})`}
        </Header>
      </div>
    </Link>
  )
}

export default OutcomeList
