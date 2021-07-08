import React from 'react'
import {
  pureArray,
  renderArrayControl,
  renderDynamicParameters,
  renderSingleChild,
} from './guiCommon'
import { addToArray, removeFromArray, setInArray } from './helpers'
import { renderEvaluationElement } from './renderEvaluation'

import { getTypedEvaluation } from './typeHelpers'
import { GuisType } from './types'

export const guis: GuisType = [
  {
    selector: 'string',
    default: getTypedEvaluation('defult string'),
    match: (typedEvaluation) => typedEvaluation.type === 'string',
    render: (evaluation, setEvaluation, ComponentLibrary) => (
      <ComponentLibrary.TextInput
        key="stringType"
        text={evaluation.asString}
        setText={(text) => setEvaluation(getTypedEvaluation(text))}
      />
    ),
  },

  {
    selector: 'number',
    default: getTypedEvaluation(1),
    match: (typedEvaluation) => typedEvaluation.type === 'number',
    render: (evaluation, setEvaluation, ComponentLibrary) => (
      <ComponentLibrary.NumberInput
        key="numberType"
        number={evaluation.asNumber}
        setNumber={(number) => setEvaluation(getTypedEvaluation(number))}
      />
    ),
  },

  {
    selector: 'boolean',
    default: getTypedEvaluation(true),
    match: (typedEvaluation) => typedEvaluation.type === 'boolean',
    render: (evaluation, setEvaluation, ComponentLibrary) => (
      <ComponentLibrary.Checkbox
        key="checkBoxType"
        checked={evaluation.asBoolean}
        setChecked={(checked) => setEvaluation(getTypedEvaluation(checked))}
      />
    ),
  },
  {
    selector: 'null',
    default: getTypedEvaluation(null),
    match: (typedEvaluation) => typedEvaluation.type === 'null',
    render: () => null,
  },
  {
    selector: 'array',
    default: getTypedEvaluation(['array element']),
    match: (typedEvaluation) => typedEvaluation.type === 'array',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => {
      return renderArrayControl({
        title: 'Elements',
        key: 'arrayControll',
        evaluation,
        offset: 0,
        setEvaluation,
        newValue: getTypedEvaluation(['array element']),
        ComponentLibrary,
        evaluatorParameters,
      })
    },
  },
  {
    selector: 'object',
    default: getTypedEvaluation({ key: 'value' }),
    match: (typedEvaluation) => typedEvaluation.type === 'object',
    render: (evaluation, setEvaluation, ComponentLibrary) => (
      <ComponentLibrary.ObjectInput
        key="objectInput"
        object={evaluation.asObject}
        setObject={(object) => setEvaluation(getTypedEvaluation(object))}
      />
    ),
  },

  pureArray({
    newValue: getTypedEvaluation(false),
    selector: 'and',
    operator: 'AND',
  }),
  pureArray({
    newValue: getTypedEvaluation(false),
    selector: 'or',
    operator: 'OR',
  }),
  pureArray({
    newValue: getTypedEvaluation('concat string'),
    selector: 'concatenate',
    operator: 'CONCAT',
  }),
  pureArray({
    newValue: getTypedEvaluation({ value: false }),
    selector: 'addition',
    operator: '+',
  }),
  {
    selector: 'REGEX',
    default: getTypedEvaluation({
      operator: 'REGEX',
      children: ['02312312', '^[0-9]+$'],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'REGEX',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <React.Fragment key="regexCompare">
        <ComponentLibrary.Label key="value" title="String to match: " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}

        <ComponentLibrary.Label key="value" title="Regex: " />
        {renderSingleChild(evaluation, 1, setEvaluation, ComponentLibrary, evaluatorParameters)}
      </React.Fragment>
    ),
  },
  {
    selector: 'equality',
    default: getTypedEvaluation({
      operator: '=',
      children: ['compare me', 'to me'],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === '=',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <React.Fragment key="equalityCompare">
        <ComponentLibrary.Label key="value" title="Compare this Value: " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}

        {renderArrayControl({
          title: 'To these Values',
          key: 'compareTothsesValues',
          evaluation,
          offset: 1,
          setEvaluation,
          newValue: getTypedEvaluation('to me'),
          ComponentLibrary,
          evaluatorParameters,
        })}
      </React.Fragment>
    ),
  },
  {
    selector: 'inequality',
    default: getTypedEvaluation({
      operator: '!=',
      children: ['compare me', 'to me'],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === '!=',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <>
        <ComponentLibrary.Label key="compare" title="Compare this Value: " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}
        <ComponentLibrary.Label key="compareTo" title="To these Values: " />
        {renderSingleChild(evaluation, 2, setEvaluation, ComponentLibrary, evaluatorParameters)}
      </>
    ),
  },
  {
    selector: 'if a then b or c',
    default: getTypedEvaluation({
      operator: '?',
      children: [true, 'if true', 'if false'],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === '?',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <>
        <ComponentLibrary.Label key="ifCondition" title="If condition: " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}
        <ComponentLibrary.Label key="valueTrue" title="Value if true: " />
        {renderSingleChild(evaluation, 1, setEvaluation, ComponentLibrary, evaluatorParameters)}
        <ComponentLibrary.Label key="valueFalse" title="Value if false: " />
        {renderSingleChild(evaluation, 2, setEvaluation, ComponentLibrary, evaluatorParameters)}
      </>
    ),
  },
  {
    selector: 'string substitution',
    default: getTypedEvaluation({
      operator: 'stringSubstitution',
      children: ['%1 %2 %1', 'first', 'second'],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'stringSubstitution',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <React.Fragment key="stringSubstitutionComponent">
        <ComponentLibrary.Label key="stringLiteral" title="String literal: " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}

        {renderArrayControl({
          title: 'Substitution values',
          evaluation,
          key: 'substituteWith',
          offset: 1,
          setEvaluation,
          newValue: getTypedEvaluation({ value: 'substitution' }),
          ComponentLibrary,
          evaluatorParameters,
        })}
      </React.Fragment>
    ),
  },
  {
    selector: 'root object properies',
    default: getTypedEvaluation({
      operator: 'objectProperties',
      children: ['firstName', null],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'objectProperties',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => (
      <React.Fragment key="objectProperties">
        <ComponentLibrary.Label key="objectPath" title="Object path (i.e. thisResponse.text): " />
        {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}
        <ComponentLibrary.Label
          key="fallback"
          title="Fallback (in case object path is not found): "
        />
        {renderSingleChild(evaluation, 1, setEvaluation, ComponentLibrary, evaluatorParameters)}
      </React.Fragment>
    ),
  },
  // {
  //   selector: 'root object',
  //   default: getTypedEvaluation({ operator: 'rootObject', children: [] }),
  //   match: (typedEvaluation) =>
  //     typedEvaluation.asOperator.operator === 'rootObject',
  //   render: () => null,
  // },
  // {
  //   selector: 'generic object properties',
  //   default: getTypedEvaluation({
  //     operator: 'genericObjectProperties',
  //     children: [{ property: 'value' }, 'property', null],
  //   }),
  //   match: (typedEvaluation) =>
  //     typedEvaluation.asOperator.operator === 'genericObjectProperties',
  //   render: (evaluation, setEvaluation, ComponentLibrary) => (
  //     <>
  //       <ComponentLibrary.Label key='object' title='Object ' />
  //       {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary)}
  //       <ComponentLibrary.Label
  //         key='objectPath'
  //         title='Object path (i.e. thisResponse.text): '
  //       />
  //       {renderSingleChild(evaluation, 1, setEvaluation, ComponentLibrary)}
  //       <ComponentLibrary.Label
  //         key='fallback'
  //         title='Fallback (in case object path is not found): '
  //       />
  //       {renderSingleChild(evaluation, 2, setEvaluation, ComponentLibrary)}
  //     </>
  //   ),
  // },
  {
    selector: 'api call',
    default: getTypedEvaluation({
      operator: 'API',
      children: [
        'http://localhost:8080/check-unique',
        ['type', 'value'],
        'username',
        'andrei',
        'unique',
      ],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'API',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => {
      const parametersOffset = 1
      const children = evaluation.asOperator.children
      const parametersLength = children[parametersOffset].asArray.length

      const lastChildIndex = children.length - 1

      const isExtractionPropertySpecified =
        parametersLength + parametersOffset + 1 < children.length

      return (
        <React.Fragment key="apiComponent">
          <ComponentLibrary.Label key="title" title="URL:" />
          {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}
          {renderDynamicParameters({
            header: 'Query Parameters',
            parametersOffset,
            parameterValueHeader: 'Parameter Value:',
            parameterNameHeader: 'Parameter Name:',
            defaultParameterName: getTypedEvaluation('parameterName'),
            defaultParameterValue: getTypedEvaluation('parameterValue'),
            setEvaluation,
            evaluation,
            ComponentLibrary,
            evaluatorParameters,
          })}

          <ComponentLibrary.FlexRow key="extractionBoolean">
            <ComponentLibrary.Checkbox
              checked={isExtractionPropertySpecified}
              setChecked={(value) => {
                if (!value && isExtractionPropertySpecified)
                  setEvaluation(removeFromArray(evaluation, lastChildIndex))
                if (value && !isExtractionPropertySpecified)
                  setEvaluation(addToArray(evaluation, getTypedEvaluation('unique')))
              }}
            />
            {isExtractionPropertySpecified && (
              <ComponentLibrary.FlexColumn key="extractionKey">
                <ComponentLibrary.Label title={'Property to Extract:'} />
                {renderSingleChild(
                  evaluation,
                  lastChildIndex,
                  setEvaluation,
                  ComponentLibrary,
                  evaluatorParameters
                )}
              </ComponentLibrary.FlexColumn>
            )}
          </ComponentLibrary.FlexRow>
        </React.Fragment>
      )
    },
  },
  {
    selector: 'graphQL call',
    default: getTypedEvaluation({
      operator: 'graphQL',
      children: [
        `query App($appId:Int!) {
          application(id: $appId) {
           name
          }
        }`,
        'http://localhost:5000/graphql',
        ['appId'],
        1,
        'application.name',
      ],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'graphQL',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => {
      const parametersOffset = 2
      const children = evaluation.asOperator.children
      const parametersLength = children[parametersOffset].asArray.length

      const lastChildIndex = children.length - 1

      const isExtractionPropertySpecified =
        parametersLength + parametersOffset + 1 < children.length

      return (
        <React.Fragment key="graphQLComponent">
          <ComponentLibrary.Label key="graphQL" title="graphQL query:" />
          {renderSingleChild(evaluation, 0, setEvaluation, ComponentLibrary, evaluatorParameters)}
          <ComponentLibrary.Label key="url" title="URL:" />
          {renderSingleChild(evaluation, 1, setEvaluation, ComponentLibrary, evaluatorParameters)}
          {renderDynamicParameters({
            header: 'Query Parameters',
            parametersOffset,
            parameterValueHeader: 'Parameter Value:',
            parameterNameHeader: 'Parameter Name:',
            defaultParameterName: getTypedEvaluation('parameterName'),
            defaultParameterValue: getTypedEvaluation('parameterValue'),
            setEvaluation,
            evaluation,
            ComponentLibrary,
            evaluatorParameters,
          })}

          <ComponentLibrary.FlexRow key="extractionBoolean">
            <ComponentLibrary.Checkbox
              title="Property to Extract"
              checked={isExtractionPropertySpecified}
              setChecked={(value) => {
                if (!value && isExtractionPropertySpecified)
                  setEvaluation(removeFromArray(evaluation, lastChildIndex))
                if (value && !isExtractionPropertySpecified)
                  setEvaluation(addToArray(evaluation, getTypedEvaluation('unique')))
              }}
            />
            {isExtractionPropertySpecified && (
              <ComponentLibrary.FlexColumn key="extractionKey">
                {renderSingleChild(
                  evaluation,
                  lastChildIndex,
                  setEvaluation,
                  ComponentLibrary,
                  evaluatorParameters
                )}
              </ComponentLibrary.FlexColumn>
            )}
          </ComponentLibrary.FlexRow>
        </React.Fragment>
      )
    },
  },
  {
    selector: 'build object',
    default: getTypedEvaluation({
      operator: 'buildObject',
      properties: [{ key: 'keyToBuild', value: 'valueToBuild' }],
    }),
    match: (typedEvaluation) => typedEvaluation.asOperator.operator === 'buildObject',
    render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) => {
      const propertiesToBuild = evaluation.asBuildObjectOperator.properties
      const newProperty = {
        key: getTypedEvaluation('keyToBuild'),
        value: getTypedEvaluation('valueToBuild'),
      }

      return (
        <React.Fragment key="buildObject">
          <ComponentLibrary.FlexRow>
            <ComponentLibrary.Add
              title="Properties"
              onClick={() => {
                propertiesToBuild.push(newProperty)
                setEvaluation(evaluation)
              }}
            />
          </ComponentLibrary.FlexRow>
          <ComponentLibrary.FlexColumn>
            {propertiesToBuild.map(({ key, value }, index) => (
              <ComponentLibrary.OperatorContainer key={index}>
                <ComponentLibrary.FlexRow>
                  <ComponentLibrary.Remove
                    key="removeButton"
                    onClick={() => {
                      propertiesToBuild.splice(index, 1)
                      setEvaluation(evaluation)
                    }}
                  />

                  <ComponentLibrary.FlexColumn>
                    <ComponentLibrary.Label key="keyTitle" title="Key:" />
                    {renderEvaluationElement(
                      key,
                      (newKey) => {
                        propertiesToBuild[index].key = newKey
                        setEvaluation(evaluation)
                      },

                      ComponentLibrary,
                      evaluatorParameters
                    )}
                    <ComponentLibrary.Label key="valueTitle" title="Value:" />
                    {renderEvaluationElement(
                      value,
                      (newValue) => {
                        propertiesToBuild[index].value = newValue
                        setEvaluation(evaluation)
                      },
                      ComponentLibrary,
                      evaluatorParameters
                    )}
                  </ComponentLibrary.FlexColumn>
                </ComponentLibrary.FlexRow>
              </ComponentLibrary.OperatorContainer>
            ))}
          </ComponentLibrary.FlexColumn>
        </React.Fragment>
      )
    },
  },
]
