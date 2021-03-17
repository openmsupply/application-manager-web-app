import React, { useState } from 'react'
import { Message, Segment, Header, Checkbox } from 'semantic-ui-react'
import { Loading } from '../../components'
import { useUserState } from '../../contexts/UserState'
import strings from '../../utils/constants'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { AssignmentDetailsNEW, FullStructure } from '../../utils/types'
import ReviewSectionRow from './ReviewSectionRow'

interface ReviewHomeProps {
  assignments: AssignmentDetailsNEW[]
  structure: FullStructure
}

const ReviewHome: React.FC<ReviewHomeProps> = ({ assignments, structure }) => {
  const { error, fullStructure: fullApplicationStructure } = useGetFullApplicationStructure({
    structure,
    firstRunValidation: false,
    shouldCalculateProgress: false,
  })
  const {
    userState: { currentUser },
  } = useUserState()
  // default should really be false, but for testing this is much quicker
  const [viewAllAssignments, setViewAllAssignment] = useState<boolean>(false)

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!fullApplicationStructure) return <Loading />

  return (
    <>
      <Segment>
        <Checkbox
          toggle
          label="Show All"
          checked={viewAllAssignments}
          onChange={() => setViewAllAssignment(!viewAllAssignments)}
        />
      </Segment>
      {Object.values(fullApplicationStructure.sections).map(({ details: { id, title } }) => (
        <Segment key={id}>
          <Header>{title}</Header>
          {assignments
            .filter(
              (assignment) => viewAllAssignments || assignment.reviewer.id === currentUser?.userId
            )
            .map((assignment) => (
              <ReviewSectionRow
                {...{
                  key: assignment.id,
                  sectionId: id,
                  assignment,
                  fullApplicationStructure,
                }}
              />
            ))}
        </Segment>
      ))}
    </>
  )
}

export default ReviewHome
