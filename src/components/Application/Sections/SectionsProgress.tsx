import React from 'react'
import { Button, Grid, Icon, List, Progress } from 'semantic-ui-react'
import {
  Progress as ProgressType,
  SectionAndPage,
  SectionsStructureNEW,
} from '../../../utils/types'
import strings from '../../../utils/constants'

interface SectionsProgressProps {
  canEdit: boolean
  changes?: { state: boolean; label: string }
  firstStrictInvalidPage: SectionAndPage | null
  sections: SectionsStructureNEW
  resumeApplication: (location: SectionAndPage) => void
}

interface SectionActionProps {
  sectionCode: string
  progress?: ProgressType
}

const SectionsProgress: React.FC<SectionsProgressProps> = ({
  canEdit,
  changes = { state: false, label: '' },
  firstStrictInvalidPage,
  sections,
  resumeApplication,
}) => {
  let isBeforeStrict = true

  const getIndicator = ({ completed, valid }: ProgressType) => {
    return completed ? (
      <Icon name={valid ? 'check circle' : 'exclamation circle'} color={valid ? 'green' : 'red'} />
    ) : (
      <Icon name="circle outline" />
    )
  }

  const SectionProgress: React.FC<ProgressType> = ({
    doneRequired,
    doneNonRequired,
    totalSum,
    valid,
  }) => {
    const totalDone = doneRequired + doneNonRequired
    return totalDone > 0 && totalSum > 0 ? (
      <Grid.Column style={{ width: 200, paddingRight: '5%' }} floated="right" width={4}>
        <Progress
          style={{ width: 200 }}
          percent={(100 * totalDone) / totalSum}
          size="tiny"
          success={valid}
          error={!valid}
        />
      </Grid.Column>
    ) : null
  }

  const SectionAction: React.FC<SectionActionProps> = ({ sectionCode, progress }) => {
    const isStrictSection = sectionCode === firstStrictInvalidPage?.sectionCode
    isBeforeStrict = isBeforeStrict ? firstStrictInvalidPage === null || !isStrictSection : false

    if (!canEdit) return null

    if (isStrictSection)
      return (
        <Button
          color="blue"
          content={strings.BUTTON_APPLICATION_RESUME}
          onClick={() =>
            resumeApplication({
              sectionCode,
              pageNumber: firstStrictInvalidPage?.pageNumber || 1,
            })
          }
        />
      )

    if (progress?.completed && isBeforeStrict)
      return (
        <Icon
          name="pencil square"
          color="blue"
          style={{ minWidth: 100 }}
          onClick={() => resumeApplication({ sectionCode, pageNumber: 1 })}
        />
      )

    if (changes.state)
      return (
        <Button
          color="blue"
          content={changes.label}
          onClick={() =>
            resumeApplication({
              sectionCode,
              pageNumber: firstStrictInvalidPage?.pageNumber || 1,
            })
          }
        />
      )

    return null
  }

  return (
    <List
      divided
      relaxed="very"
      items={Object.entries(sections).map(([sectionCode, { details, progress }]) => ({
        key: `list-item-${sectionCode}`,
        icon: progress ? getIndicator(progress) : null,
        header: (
          <Grid stackable style={{ minHeight: 50 }}>
            <Grid.Column style={{ minWidth: 100 }} floated="left" width={4}>
              <p>{details.title}</p>
            </Grid.Column>
            {canEdit && progress && <SectionProgress {...progress} />}
            <Grid.Column style={{ minWidth: 100, padding: 0 }} verticalAlign="middle" width={2}>
              <SectionAction {...{ sectionCode, progress }} />
            </Grid.Column>
          </Grid>
        ),
      }))}
    />
  )
}

export default SectionsProgress
