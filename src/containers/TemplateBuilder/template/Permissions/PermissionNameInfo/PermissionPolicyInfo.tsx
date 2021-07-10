import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import { Accordion, Icon } from 'semantic-ui-react'
import { PermissionPolicy, PostgresRowLevel } from '../../../../../utils/generated/graphql'
import TextIO from '../../../shared/TextIO'

type PermissionPolicyProps = {
  rowLevelPolicies: PostgresRowLevel[]
  permissionPolicy: PermissionPolicy
}

const PermissionPolicyInfo: React.FC<PermissionPolicyProps> = ({
  rowLevelPolicies,
  permissionPolicy,
}) => {
  const [isOpenRules, setIsOpenRules] = useState(false)
  const [isOpenRowLevel, setIsOpenRowLevel] = useState(false)

  return (
    <div className="config-container-alternate">
      <div className="flex-row-start-start">
        <TextIO title="Policy" text={`${permissionPolicy?.name} - ${permissionPolicy?.type} `} />
        <div className="long">
          <TextIO
            isTextArea={true}
            title="Description"
            text={permissionPolicy?.description || ''}
          />
        </div>
      </div>
      <Accordion className="config-container">
        <Accordion.Title className="flex-row-center-center">
          Policy Rules
          <Icon
            size="large"
            name={isOpenRules ? 'angle up' : 'angle down'}
            onClick={() => setIsOpenRules(!isOpenRules)}
          />
        </Accordion.Title>
        <Accordion.Content active={isOpenRules}>
          <RowLevelPolicyInfo rules={permissionPolicy?.rules || {}} />
        </Accordion.Content>
      </Accordion>

      <Accordion className="config-container">
        <Accordion.Title className="flex-row-center-center">
          Row Level Policies
          <Icon
            size="large"
            name={isOpenRowLevel ? 'angle up' : 'angle down'}
            onClick={() => setIsOpenRowLevel(!isOpenRowLevel)}
          />
        </Accordion.Title>
        <Accordion.Content active={isOpenRowLevel}>
          {rowLevelPolicies.length === 0 && (
            <div>
              No row level policies found, did you run row level update when policy was created ?
            </div>
          )}

          {rowLevelPolicies.map((row, index) => (
            <div key={index} className="config-container-alternate">
              <div className="flex-row-start-center">
                <TextIO title="Type" text={row?.cmd || ''} />
                <TextIO title="Table name" text={row?.tablename || ''} />
                <TextIO title="Policy name" text={row?.tablename || ''} />
              </div>
              {row?.qual && <TextIO title="USING" text={row.qual} isTextArea={true} />}
              {row?.withCheck && (
                <TextIO title="WITH CHECK" text={row.withCheck} isTextArea={true} />
              )}
            </div>
          ))}
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

type PolicyRulesProps = {
  rules: {
    [tableName: string]: object
  }
}

const RowLevelPolicyInfo: React.FC<PolicyRulesProps> = ({ rules }) => (
  <div className="flex-column-start-start">
    {Object.entries(rules).map(([tableName, rules]) => (
      <div key={tableName} className="config-container-alternate">
        <TextIO title="Table name" text={tableName} />
        <div className="spacer-10" />
        <ReactJson src={rules || {}} collapsed={2} />
      </div>
    ))}
  </div>
)

export default PermissionPolicyInfo
