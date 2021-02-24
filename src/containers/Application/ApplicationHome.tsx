import React from 'react'
import { FullStructure } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'

interface ApplicationProps {
  structure: FullStructure
}

const ApplicationHome: React.FC<ApplicationProps> = ({ structure }) => {
  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
  })

  console.log('FULL STRUCTURE', fullStructure)
  console.log('responsesByCode', fullStructure?.responsesByCode)
  console.log('isLoading', !fullStructure)

  return <p>START PAGE</p>
}

export default ApplicationHome
