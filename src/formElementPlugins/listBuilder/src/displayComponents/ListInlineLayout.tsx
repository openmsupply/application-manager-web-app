import React, { useEffect, useState } from 'react'
import { Button, Icon, Accordion } from 'semantic-ui-react'
import { ApplicationDetails, User } from '../../../../utils/types'
import { ListLayoutProps } from '../types'
import ApplicationViewWrapper from '../../../ApplicationViewWrapper'
import SummaryViewWrapper from '../../../SummaryViewWrapper'
import { buildElements, substituteValues } from '../helpers'
import '../styles.css'

const ListInlineLayout: React.FC<ListLayoutProps> = ({
  listItems,
  displayFormat,
  fieldTitles = [],
  codes = [],
  Markdown,
  editItem = () => {},
  deleteItem = () => {},
  isEditable = true,
  inputFields,
  responses,
  currentUser,
  applicationData,
  currentResponseElementsState,
  innerElementUpdate,
}) => {
  // Inner component -- one for each Item in list
  const ItemAccordion: React.FC<any> = ({ item, header, index }) => {
    console.log('Item key', index)
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(false)
    const [currentItemElementsState, setItemResponseElementsState] = useState<any>()
    useEffect(() => {
      buildElements(
        inputFields,
        responses,
        item,
        currentUser as User,
        applicationData as ApplicationDetails
      ).then((elements) => setItemResponseElementsState(elements))
    }, [])
    if (!currentItemElementsState) return null
    return (
      <Accordion
        styled
        className="accordion-container"
        style={{ maxWidth: open ? 'none' : '100%' }}
      >
        <Accordion.Title active={open} onClick={() => setOpen(!open)}>
          <Icon name="dropdown" />
          <Markdown text={substituteValues(header, item)} semanticComponent="noParagraph" />
        </Accordion.Title>
        <Accordion.Content active={open}>
          {codes.map((code, cellIndex) =>
            edit ? (
              <ApplicationViewWrapper
                key={`item_${cellIndex}`}
                element={currentItemElementsState[code]}
                isStrictPage={false}
                currentResponse={item[code].value}
                allResponses={responses}
                onSaveUpdateMethod={innerElementUpdate(currentItemElementsState[code].code)}
                applicationData={applicationData as ApplicationDetails}
              />
            ) : (
              <SummaryViewWrapper
                key={`item_${cellIndex}`}
                element={currentItemElementsState[code]}
                response={item[code].value}
                allResponses={responses}
              />
            )
          )}
          {edit ? (
            <Button primary content={'UPDATE'} onClick={() => setEdit(false)} />
          ) : (
            <Button primary content={'EDIT'} onClick={() => setEdit(true)} />
          )}
          <Button secondary content={'DELETE'} onClick={() => deleteItem(index)} />
        </Accordion.Content>
      </Accordion>
    )
  }

  return (
    <>
      {listItems.map((item, index) => (
        <ItemAccordion item={item} header={displayFormat.title} key={index} index={index} />
      ))}
    </>
  )
}

export default ListInlineLayout
