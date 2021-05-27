import React, { RefObject, useRef } from 'react'

type ScrollableRef = RefObject<HTMLParagraphElement>
type AttachedScrollables = {
  [code: string]: RefObject<HTMLParagraphElement>
}
// hook can be used to attached scrollable elements and scroll to them
// two methos are expose:
type AddScrollable = (code: string, scrollableRef: ScrollableRef) => void
type ScrollTo = (code: string) => void
// use in combination with ScrollableAttachment (check ReviewPage for example)
// add scrollable
// <ScrollableAttachment code={'somecode'} addScrollable={addScrollable}/>
// scroll to scrollable
// scrollTo('somecode')
const useScrollableAttachments = () => {
  const attachedScrollabes: AttachedScrollables = {}

  const addScrollable: AddScrollable = (code, scrollableRef) =>
    (attachedScrollabes[code] = scrollableRef)

  const scrollTo: ScrollTo = (code) => {
    const scrollable = attachedScrollabes[code]
    if (scrollable) scrollable.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    addScrollable,
    scrollTo,
  }
}

const ScrollableAttachment: React.FC<{
  code: string
  addScrollabe: AddScrollable
}> = ({ code, addScrollabe }) => {
  const ref = useRef<HTMLParagraphElement>(null)
  addScrollabe(code, ref)

  return <p className="scrollable-attachment" ref={ref} />
}

export default useScrollableAttachments
export { ScrollableAttachment }
