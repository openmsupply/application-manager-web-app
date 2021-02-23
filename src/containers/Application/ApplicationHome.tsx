import React from 'react'
import { FullStructure } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'

interface ApplicationProps {
  structure: FullStructure
}

const ApplicationHome: React.FC<ApplicationProps> = ({ structure }) => {
  const { error, isLoading, fullStructure, responsesByCode } = useGetFullApplicationStructure({
    structure,
  })

  console.log('isLoading', isLoading)
  console.log('FULL STRUCTURE', fullStructure)
  console.log('responsesByCode', responsesByCode)
  console.log('isLoading', isLoading)

  return <p>START PAGE</p>
}

export default ApplicationHome
