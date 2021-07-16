const DEBOUNCE_TIMEOUT = 350 //milliseconds

import React, { useEffect, useState } from 'react'
import { Search, Label, Card, Icon } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import { useUserState } from '../../../contexts/UserState'
import strings from '../constants'
import evaluateExpression from '@openmsupply/expression-evaluator'
import useDebounce from './useDebounce'

interface DisplayFormat {
  title?: string
  subtitle?: string
  description?: string
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  currentResponse,
  // validationState,
  onSave,
  Markdown,
  applicationData,
  allResponses,
}) => {
  const {
    label,
    description,
    placeholder = strings.DEFAULT_PLACEHOLDER,
    source,
    icon = 'search',
    multiSelect = false,
    minCharacters = 1,
    displayFormat = {},
    resultFormat = displayFormat,
    textFormat,
  } = parameters

  const {
    userState: { currentUser },
  } = useUserState()

  const graphQLEndpoint = applicationData.config.serverGraphQL

  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [selection, setSelection] = useState<any[]>(currentResponse?.selection || [])
  const { isEditable } = element

  const [debounceOutput, setDebounceInput] = useDebounce<string>('', DEBOUNCE_TIMEOUT)

  useEffect(() => {
    onSave({
      text: textFormat
        ? getTextFormat(textFormat, selection)
        : selection.length > 0
        ? JSON.stringify(selection)
        : undefined,
      selection: selection,
    })
  }, [selection])

  useEffect(() => {
    if (!debounceOutput) return
    evaluateSearchQuery(debounceOutput)
  }, [debounceOutput])

  const evaluateSearchQuery = (text: string) => {
    const search = { text }
    evaluateExpression(source, {
      objects: { search, currentUser, applicationData, responses: allResponses },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    })
      .then((results: any) => {
        if (results == null) {
          setResults([])
        } else if (!Array.isArray(results)) setResults([results])
        else setResults(results)
        setDebounceInput('')
        setLoading(false)
      })
      .catch((err) => {
        console.error('Search error:', err.message)
        setDebounceInput('')
        setLoading(false)
      })
  }

  const handleChange = (e: any) => {
    const text = e.target.value
    setSearchText(text)
    if (text.length < minCharacters) return
    setDebounceInput(text)
    setLoading(true)
  }

  const handleSelect = (_: any, data: any) => {
    const selectedResult = results[data.result.index]
    if (!selectedResult) return // Don't select "Loading" item
    if (!multiSelect) setSelection([selectedResult])
    else setSelection([...selection, selectedResult])
    setSearchText('')
  }

  const deleteItem = async (index: number) => {
    setSelection(selection.filter((_, i) => i !== index))
  }

  const displayProps: DisplayProps = {
    selection,
    displayFormat,
    deleteItem: isEditable ? deleteItem : () => {},
    Markdown,
    isEditable,
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Search
        value={searchText}
        loading={loading}
        onSearchChange={handleChange}
        onResultSelect={handleSelect}
        minCharacters={minCharacters}
        placeholder={placeholder}
        results={
          loading ? [{ title: strings.MESSAGE_LOADING }] : createResultsArray(results, resultFormat)
        }
        disabled={!isEditable}
        input={{ icon: icon, iconPosition: 'left' }}
        noResultsMessage={strings.MESSAGE_NO_RESULTS}
      />
      <DisplaySelection {...displayProps} />
    </>
  )
}

const createResultsArray = (results: any[], resultsFormat: DisplayFormat) => {
  const { title, description } = resultsFormat
  return results.map((result: any, index: number) => {
    const titleString = title ? substituteValues(title, result) : getDefaultString(result)
    const descriptionString = description
      ? substituteValues(description, result)
      : getDefaultString(result, 'description')
    return {
      index,
      key: `result-${index}`,
      title: titleString,
      description: descriptionString,
    }
  })
}

type ResultsField = 'title' | 'description'
// If a displayFormat is not defined, results will be displayed some combination
// of the first two fields in the object
const getDefaultString = (result: any, fieldType: ResultsField = 'title') => {
  if (!(result instanceof Object)) return result
  const fields = Object.keys(result)
  switch (fields.length) {
    case 0:
      return fieldType === 'title' ? strings.MESSAGE_NO_RESULTS : ''
    case 1:
      return fieldType === 'title' ? fields[0] : result[fields[0]]
    default:
      return fieldType === 'title'
        ? `${fields[0]}: ${result[fields[0]]}`
        : `${fields[1]}: ${result[fields[1]]}`
  }
}

const getTextFormat = (textFormat: string, selection: any[]) => {
  const strings = selection.map((item) => substituteValues(textFormat, item))
  return strings.join(', ')
}

const substituteValues = (parameterisedString: string, object: { [key: string]: any }) => {
  // TO-DO: Get "nested" object prop (e.g. "user.name"), and display arrays nicely
  const getValueFromObject = (_: string, $: string, property: string) => object?.[property] || ''
  return parameterisedString.replace(/(\${)(.*?)(})/gm, getValueFromObject)
}
export interface DisplayProps {
  selection: any[]
  displayFormat: DisplayFormat
  Markdown: any
  deleteItem?: (index: number) => void
  isEditable?: boolean
}

export const DisplaySelection: React.FC<DisplayProps> = ({
  selection,
  displayFormat,
  deleteItem = () => {},
  Markdown,
  isEditable = true,
}) => {
  const { title, subtitle, description } = displayFormat
  const showFallbackString = !title && !subtitle && !description
  return (
    <>
      {selection.map((item, index) => (
        <Card key={`list-item-${index}`}>
          <Card.Content>
            {isEditable && (
              <Label floating onClick={() => deleteItem(index)}>
                <Icon name="delete" />
              </Label>
            )}
            {title && (
              <Card.Header>
                <Markdown text={substituteValues(title, item)} semanticComponent="noParagraph" />
              </Card.Header>
            )}
            {subtitle && (
              <Card.Meta>
                <Markdown text={substituteValues(subtitle, item)} semanticComponent="noParagraph" />
              </Card.Meta>
            )}
            <Card.Description>
              <Markdown
                text={
                  description
                    ? substituteValues(description, item)
                    : getFallbackString(item, showFallbackString)
                }
                semanticComponent="noParagraph"
              />
            </Card.Description>
          </Card.Content>
        </Card>
      ))}
    </>
  )
}

const getFallbackString = (item: any, showFallbackString: boolean) =>
  showFallbackString
    ? Object.keys(item).reduce((str, field) => str + `${field}: ${item[field]}  \n`, '')
    : ''

export default ApplicationView
