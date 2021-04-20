import React from 'react'
import { Image } from 'semantic-ui-react'
import { SummaryViewProps } from '../../types'

const SummaryView: React.FC<SummaryViewProps> = ({ parameters }) => {
  const { url, size, alignment, altText } = parameters

  return (
    <Image
      src={url}
      size="small" // Always show small in Summary view
      // Have to do a bit of trickery in terms margin over-rides to get
      // right-alignment working
      centered={alignment === 'center' || alignment === 'right'}
      style={alignment === 'right' ? { marginRight: 'unset' } : {}}
      alt={altText}
      title={altText}
    />
  )
}

export default SummaryView
