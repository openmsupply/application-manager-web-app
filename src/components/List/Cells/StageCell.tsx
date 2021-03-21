import React from 'react'
import { withRouter } from 'react-router'
import { Label } from 'semantic-ui-react'
import { CellProps } from '../../../utils/types'

const StageCell: React.FC<CellProps> = ({ application }) => {
  console.log(application)
  return (
    <Label
      style={
        application.stage === 'Assessment'
          ? {
              color: 'white',
              background: 'rgb(86, 180, 219)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.81px',
            }
          : {
              color: 'white',
              background: 'rgb(225, 126, 72)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.81px',
            }
      }
    >
      {application.stage}
    </Label>
  )
}

export default StageCell
