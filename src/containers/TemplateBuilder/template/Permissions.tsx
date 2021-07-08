// import React, { useEffect, useState } from 'react'
// import ReactJson from 'react-json-view'
// import {
//   Accordion,
//   Button,
//   Checkbox,
//   Dropdown,
//   Header,
//   Icon,
//   Label,
//   Modal,
//   Popup,
// } from 'semantic-ui-react'
// import { Loading } from '../../../components'
// import { Stage } from '../../../components/Review'
// import config from '../../../config'
// import {
//   PermissionPolicyType,
//   TemplateStatus,
//   PermissionName,
//   useGetAllPermissionNamesQuery,
//   useUpdateTemplateMutation,
//   TemplateStage,
//   TemplatePermission,
//   TemplateStageReviewLevel,
//   useUpdateTemplateStageMutation,
//   TemplateSection,
//   useGetPermissionStatisticsQuery,
// } from '../../../utils/generated/graphql'

// import semanticComponentLibrary from '../evaluatorGui/semanticComponentLibrary'
// import { asObject, EvaluationContainer, Parameters } from '../shared/components'

// import { TemplateInfo } from './TemplateWrapper'
// type Error = { message: string; error: string }
// type Mutate = (doMutation: () => Promise<any>, setError: (error: Error) => void) => Promise<any>

// export const mutate: Mutate = async (doMutation, setError) => {
//   try {
//     const result = await doMutation()
//     if (result?.errors) {
//       setError({
//         message: 'error',
//         error: JSON.stringify(result.errors),
//       })
//       return null
//     }
//     return result
//   } catch (e) {
//     setError({ message: 'error', error: e })
//     return null
//   }
// }
// const Permissions: React.FC<{ templateInfo: TemplateInfo }> = ({ templateInfo }) => {
//   const { data: permissionNamesData } = useGetAllPermissionNamesQuery()
//   const [updateTemplate] = useUpdateTemplateMutation()
//   const [selectedApplyNameId, setSelectedApplyNameId] = useState(-1)
//   const [error, setError] = useState<Error | null>(null)
//   const [permissionSatistics, setPermissionSatistics] = useState<{
//     id: number
//     name: string
//     permissionPolicyId: number
//   } | null>(null)

//   const isEditable = templateInfo?.status === TemplateStatus.Draft
//   const templateId = templateInfo?.id || 0
//   const allPermissionNames = permissionNamesData?.permissionNames?.nodes
//   if (!allPermissionNames) return <Loading />

//   const names = (templateInfo?.templatePermissions?.nodes || []).map((templatePermission) => ({
//     ...(templatePermission?.permissionName as PermissionName),
//     templatePermissionId: templatePermission?.id || 0,
//     templatePermission: templatePermission,
//   }))

//   const applyNames = names.filter(
//     (permissionName) => permissionName?.permissionPolicy?.type === PermissionPolicyType.Apply
//   )
//   const allApplyNames = allPermissionNames.filter(
//     (permissionName) => permissionName?.permissionPolicy?.type === PermissionPolicyType.Apply
//   )

//   const availableApplyNames = allApplyNames.filter(
//     (name) => !applyNames.find((applyName) => name?.name === applyName?.name)
//   )

//   const canDeleteStage = (stage: TemplateStage) => {
//     const maxStageNumber = (templateInfo?.templateStages?.nodes || []).reduce(
//       (max, stage) => (max < Number(stage?.number) ? Number(stage?.number) : max),
//       0
//     )

//     return maxStageNumber === stage?.number
//   }

//   return (
//     <div className="config-permission-wrapper">
//       <div className="flex-row" style={{ justifyContent: 'flex-end' }}>
//         <Popup
//           header="Update row level policies"
//           content="Permission name joins to templates determine how row level policies in database are set up, must rest row level policies when adding or removing permission policies"
//           key="resetPolicies"
//           disabled={isEditable}
//           trigger={
//             <Button
//               primary
//               inverted
//               onClick={() => fetch(`${config.serverREST}/updateRowPolicies`)}
//             >
//               Update Row Level Security
//             </Button>
//           }
//         />
//       </div>
//       <div className="config-permission-container">
//         <Popup
//           content="Template permissions only editable on draft templates"
//           key="notDraftEdit"
//           disabled={isEditable}
//           trigger={
//             <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//               <Header style={{ margin: 0, marginRight: 3 }} as="h5">
//                 APPLY
//               </Header>
//               <Dropdown
//                 value={selectedApplyNameId}
//                 selection
//                 disabled={!isEditable}
//                 onChange={(_, { value }) => setSelectedApplyNameId(Number(value))}
//                 options={availableApplyNames.map((name) => ({
//                   key: name?.id,
//                   text: name?.name,
//                   value: name?.id,
//                 }))}
//               />
//               <Icon
//                 className="clickable"
//                 name="add"
//                 style={{ marginLeft: 5 }}
//                 onClick={async () => {
//                   if (!isEditable) return
//                   if (selectedApplyNameId === -1)
//                     return setError({
//                       error: 'select permission name',
//                       message: 'permission name not selected',
//                     })

//                   setSelectedApplyNameId(-1)
//                   await mutate(
//                     () =>
//                       updateTemplate({
//                         variables: {
//                           id: templateId,
//                           templatePatch: {
//                             templatePermissionsUsingId: {
//                               create: [{ permissionNameId: selectedApplyNameId }],
//                             },
//                           },
//                         },
//                       }),
//                     setError
//                   )
//                 }}
//               />
//             </div>
//           }
//         />
//         {applyNames.map((permissionName) => (
//           <div
//             key={permissionName?.id || 0}
//             className="indicators-container as-row"
//             style={{ justifyContent: 'flex-start', margin: 3 }}
//           >
//             <div key="permissionName" className="indicator">
//               <Label className="key" content="Permission Name" />
//               <Label className="value" content={permissionName?.name} />
//               <Icon
//                 name="info circle"
//                 className="clickable"
//                 color="blue"
//                 style={{ margin: 0, lineHeight: 'normal' }}
//                 onClick={() =>
//                   setPermissionSatistics({
//                     id: permissionName?.id,
//                     name: permissionName?.name || '',
//                     permissionPolicyId: permissionName?.permissionPolicyId || 0,
//                   })
//                 }
//               />
//             </div>

//             <div key="policyName" className="indicator">
//               <Label className="key" content="Policy Name" />
//               <Label className="value" content={permissionName?.permissionPolicy?.name} />
//             </div>

//             <Popup
//               content="Template permissions only editable on draft templates"
//               key="notDraftEdit"
//               disabled={isEditable}
//               trigger={
//                 <Icon
//                   className="clickable"
//                   style={{ alignSelf: 'center', margin: 0, marginLeft: 5 }}
//                   name="delete"
//                   onClick={async () => {
//                     if (!isEditable) return

//                     setSelectedApplyNameId(-1)
//                     await mutate(
//                       () =>
//                         updateTemplate({
//                           variables: {
//                             id: templateId,
//                             templatePatch: {
//                               templatePermissionsUsingId: {
//                                 deleteById: [{ id: permissionName?.templatePermissionId }],
//                               },
//                             },
//                           },
//                         }),
//                       setError
//                     )
//                   }}
//                 />
//               }
//             />
//           </div>
//         ))}
//       </div>
//       <div
//         className="clickable"
//         style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//       >
//         <Header style={{ margin: 0, marginRight: 3 }} as="h3">
//           Stages
//         </Header>
//         <Icon
//           style={{ marginLeft: 5 }}
//           name="add"
//           onClick={() => {
//             if (!isEditable) return

//             const maxStageNumber = (templateInfo?.templateStages?.nodes || []).reduce(
//               (max, stage) => (max < Number(stage?.number) ? Number(stage?.number) : max),
//               0
//             )
//             mutate(
//               () =>
//                 updateTemplate({
//                   variables: {
//                     id: templateId,
//                     templatePatch: {
//                       templateStagesUsingId: {
//                         create: [
//                           {
//                             number: maxStageNumber + 1,
//                             title: 'new stage',
//                             description: 'new stage description',
//                             colour: '#24B5DF',
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 }),
//               setError
//             )
//           }}
//         />
//       </div>
//       {(templateInfo?.templateStages?.nodes || []).map((stage) => (
//         <StageDisplay
//           setPermissionSatistics={setPermissionSatistics}
//           key={stage?.id}
//           stage={stage as TemplateStage}
//           templateId={templateId}
//           names={names as any}
//           allPermissionNames={allPermissionNames as any}
//           isEditable={isEditable}
//           setError={setError}
//           canDeleteStage={canDeleteStage(stage as TemplateStage)}
//           templateInfo={templateInfo}
//         />
//       ))}
//       <Modal open={!!error} onClick={() => setError(null)} onClose={() => setError(null)}>
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//           <Label size="large" color="red">
//             {String(error?.message)}
//             <Icon name="close" onClick={() => setError(null)} />
//           </Label>
//           <div style={{ margin: 20 }}>{String(error?.error)}</div>
//         </div>
//       </Modal>
//       <PermissionStatisticsWrapper
//         id={permissionSatistics?.id}
//         name={permissionSatistics?.name}
//         permissionPolicyId={permissionSatistics?.permissionPolicyId}
//         onClose={() => setPermissionSatistics(null)}
//       />
//     </div>
//   )
// }

// const PermissionStatisticsWrapper: React.FC<{
//   id?: number
//   name?: string
//   onClose: () => void
//   permissionPolicyId?: number
// }> = ({ id, name, onClose, permissionPolicyId }) => {
//   const [isOpen, setIsOpen] = useState(false)

//   useEffect(() => {
//     if (id && name && permissionPolicyId) {
//       setIsOpen(true)
//     }
//   }, [id, name])

//   if (!id || !name || !isOpen || !permissionPolicyId) return null

//   return (
//     <PermissionStatistics
//       id={id}
//       name={name}
//       permissionPolicyId={permissionPolicyId}
//       setIsOpen={() => {
//         onClose()
//         setIsOpen(false)
//       }}
//     />
//   )
// }

// const PermissionStatistics: React.FC<{
//   id: number
//   permissionPolicyId: number
//   name: string
//   setIsOpen: (isOpen: boolean) => void
// }> = ({ id, name, setIsOpen, permissionPolicyId }) => {
//   const { data } = useGetPermissionStatisticsQuery({
//     variables: { id, name, rowLeveSearch: `pp${permissionPolicyId}` },
//   })
//   const [isOpenRules, setIsOpenRules] = useState(false)
//   const [isOpenRowLevel, setIsOpenRowLevel] = useState(false)

//   return (
//     <Modal open={true} onClose={() => setIsOpen(false)} className="element-edit-modal">
//       {!data && <Loading />}
//       {data && (
//         <div className="flex-column" style={{ padding: 10, alignItems: 'center' }}>
//           <Header as="h1"> {`Statistics for ${name}`} </Header>
//           <div className="flex-row" style={{ justifyContent: 'space-between' }}>
//             <div className="flex-column">
//               <Header as="h2">Users and Organisations</Header>
//               {(data.permissionName?.permissionJoins?.nodes || []).map((permissionJoin, index) => (
//                 <div
//                   key={index}
//                   className="indicators-container as-row"
//                   style={{ justifyContent: 'flex-start' }}
//                 >
//                   <div key="username" className="indicator">
//                     <Label className="key" content="username" />
//                     <Label className="value" content={permissionJoin?.user?.username} />
//                   </div>
//                   <div key="firsName" className="indicator">
//                     <Label className="key" content="name" />
//                     <Label
//                       className="value"
//                       content={`${permissionJoin?.user?.firstName} ${permissionJoin?.user?.lastName}`}
//                     />
//                   </div>

//                   <div key="email" className="indicator">
//                     <Label className="key" content="email" />
//                     <Label className="value" content={permissionJoin?.user?.email} />
//                   </div>
//                   {permissionJoin?.organisation?.name && (
//                     <div key="organisationName" className="indicator">
//                       <Label className="key" content="organisation" />
//                       <Label className="value" content={permissionJoin?.organisation?.name} />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <div className="flex-column">
//               {(data.templateActions?.nodes || []).length > 0 && (
//                 <>
//                   <Header as="h2">Template Actions</Header>
//                   {(data.templateActions?.nodes || []).map((templateAction, index) => (
//                     <div
//                       className="flex-column"
//                       style={{ padding: 5, borderRadius: 7, background: 'rgba(50, 252, 50, 0.01)' }}
//                     >
//                       <div
//                         key={index}
//                         className="indicators-container as-row"
//                         style={{ justifyContent: 'flex-start' }}
//                       >
//                         <div key="template" className="indicator">
//                           <Label className="key" content="template" />
//                           <Label
//                             className="value"
//                             content={`${templateAction?.template?.code} - ${templateAction?.template?.name} `}
//                           />
//                         </div>
//                         <div key="action" className="indicator">
//                           <Label className="key" content="action code" />
//                           <Label className="value" content={`${templateAction?.actionCode}`} />
//                         </div>

//                         <div key="trigger" className="indicator">
//                           <Label className="key" content="trigger" />
//                           <Label className="value" content={`${templateAction?.trigger}`} />
//                         </div>
//                       </div>
//                       <EvaluationContainer
//                         key="condition"
//                         label="condition"
//                         currentElementCode={''}
//                         evaluation={asObject(templateAction?.condition)}
//                         setEvaluation={() => {}}
//                       />
//                       <Parameters
//                         key="parametersElement"
//                         currentElementCode={''}
//                         parameters={asObject(templateAction?.parameterQueries)}
//                         setParameters={() => {}}
//                       />
//                     </div>
//                   ))}
//                 </>
//               )}
//               {(data.templateElements?.nodes || []).length > 0 && (
//                 <>
//                   <Header as="h2">Template Elements</Header>
//                   {(data.templateElements?.nodes || []).map((templateElement, index) => (
//                     <div
//                       className="flex-column"
//                       style={{ padding: 5, borderRadius: 7, background: 'rgba(50, 252, 50, 0.01)' }}
//                     >
//                       <div
//                         key={index}
//                         className="indicators-container as-row"
//                         style={{ justifyContent: 'flex-start' }}
//                       >
//                         <div key="template" className="indicator">
//                           <Label className="key" content="template" />
//                           <Label
//                             className="value"
//                             content={`${templateElement?.section?.template?.code} - ${templateElement?.section?.template?.name} `}
//                           />
//                         </div>
//                         <div key="templateElement" className="indicator">
//                           <Label className="key" content="template element" />
//                           <Label
//                             className="value"
//                             content={`${templateElement?.code} - ${templateElement?.title}`}
//                           />
//                         </div>
//                       </div>
//                       <Parameters
//                         key="parametersElement"
//                         currentElementCode={''}
//                         parameters={asObject(templateElement?.parameters)}
//                         setParameters={() => {}}
//                       />
//                     </div>
//                   ))}
//                 </>
//               )}
//             </div>
//             <div className="flex-column">
//               <Header as="h2">Permission Policy</Header>
//               <div
//                 key="permissionPolicy"
//                 className="indicators-container as-row"
//                 style={{ justifyContent: 'flex-start' }}
//               >
//                 <div key="permissinPolicy" className="indicator">
//                   <Label className="key" content="Policy" />
//                   <Label
//                     className="value"
//                     content={`${data?.permissionName?.permissionPolicy?.name} - ${data?.permissionName?.permissionPolicy?.type} `}
//                   />
//                 </div>
//                 <div key="permissinPolicy" className="indicator">
//                   <Label className="key" content="Description" />
//                   <Label
//                     className="value"
//                     content={`${data?.permissionName?.permissionPolicy?.name} - ${data?.permissionName?.permissionPolicy?.description} `}
//                   />
//                 </div>
//               </div>

//               <Accordion
//                 style={{ borderRadius: 7, border: '1px solid black', padding: 3, margin: 5 }}
//               >
//                 <Accordion.Title
//                   className="evaluation-container-title"
//                   style={{ justifyContent: 'center', padding: 2 }}
//                   active={isOpenRules}
//                 >
//                   Policy Rules
//                   <Icon
//                     size="large"
//                     name={isOpenRules ? 'angle up' : 'angle down'}
//                     onClick={() => setIsOpenRules(!isOpenRules)}
//                   />
//                 </Accordion.Title>
//                 <Accordion.Content active={isOpenRules}>
//                   <ReactJson
//                     src={data?.permissionName?.permissionPolicy?.rules || {}}
//                     collapsed={2}
//                   />
//                 </Accordion.Content>
//               </Accordion>
//               <Accordion
//                 style={{ borderRadius: 7, border: '1px solid black', padding: 3, margin: 5 }}
//               >
//                 <Accordion.Title
//                   className="evaluation-container-title"
//                   style={{ justifyContent: 'center', padding: 2 }}
//                   active={isOpenRowLevel}
//                 >
//                   Row Level Policies
//                   <Icon
//                     size="large"
//                     name={isOpenRowLevel ? 'angle up' : 'angle down'}
//                     onClick={() => setIsOpenRowLevel(!isOpenRowLevel)}
//                   />
//                 </Accordion.Title>
//                 <Accordion.Content active={isOpenRowLevel}>
//                   {(data.postgresRowLevels?.nodes || []).length === 0 && (
//                     <div>No row level policies found, did you run row level update ?</div>
//                   )}

//                   {(data.postgresRowLevels?.nodes || []).length > 0 &&
//                     (data.postgresRowLevels?.nodes || []).map((postgresRowLevel, index) => (
//                       <div
//                         key={index}
//                         className="indicators-container as-row"
//                         style={{ justifyContent: 'flex-start' }}
//                       >
//                         <div key="type" className="indicator">
//                           <Label className="key" content="type" />
//                           <Label className="value" content={postgresRowLevel?.cmd} />
//                         </div>
//                         <div key="table" className="indicator">
//                           <Label className="key" content="table" />
//                           <Label className="value" content={postgresRowLevel?.tablename} />
//                         </div>
//                         <div key="policy-name" className="indicator">
//                           <Label className="key" content="policy name" />
//                           <Label className="value" content={postgresRowLevel?.policyname} />
//                         </div>
//                         {postgresRowLevel?.qual && (
//                           <div key="using" className="indicator">
//                             <Label className="key" content="USING" />
//                             <Label
//                               className="value"
//                               content={postgresRowLevel?.qual}
//                               style={{ whiteSpace: 'initial' }}
//                             />
//                           </div>
//                         )}
//                         {postgresRowLevel?.withCheck && (
//                           <div key="with-check" className="indicator">
//                             <Label className="key" content="WITH CHECK" />
//                             <Label
//                               className="value"
//                               content={postgresRowLevel?.withCheck}
//                               style={{ whiteSpace: 'initial' }}
//                             />
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                 </Accordion.Content>
//               </Accordion>
//               <Header as="h2">Templates</Header>

//               {(data?.permissionName?.templatePermissions?.nodes || []).map(
//                 (templatePermission, index) => (
//                   <div
//                     key={index}
//                     className="indicators-container as-row"
//                     style={{ justifyContent: 'flex-start' }}
//                   >
//                     <div key="templateName" className="indicator">
//                       <Label className="key" content="template" />
//                       <Label
//                         className="value"
//                         content={`${templatePermission?.template?.code} - ${templatePermission?.template?.name} `}
//                       />
//                     </div>
//                     <div key="templateVersion" className="indicator">
//                       <Label className="key" content="version" />
//                       <Label className="value" content={templatePermission?.template?.version} />
//                       <a
//                         target="_blank"
//                         href={`/admin/template/${templatePermission?.template?.id}/permissions`}
//                       >
//                         <Icon color="blue" style={{ lineHeight: 'normal' }} name="info circle" />
//                       </a>
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//           <Button style={{ margin: 10 }} primary inverted onClick={() => setIsOpen(false)}>
//             Close
//           </Button>
//         </div>
//       )}
//     </Modal>
//   )
// }

// type PermissionNameFlat = PermissionName & { templatePermission: TemplatePermission }
// const StageDisplay: React.FC<{
//   stage?: TemplateStage
//   templateId: number
//   isEditable: boolean
//   setError: (error: Error) => void
//   canDeleteStage: boolean
//   allPermissionNames: PermissionName[]
//   templateInfo: TemplateInfo
//   names: PermissionNameFlat[]
//   setPermissionSatistics: (props: { id: number; name: string; permissionPolicyId: number }) => void
// }> = ({
//   stage,
//   templateId,
//   isEditable,
//   templateInfo,
//   setError,
//   canDeleteStage,
//   allPermissionNames,
//   names,
//   setPermissionSatistics,
// }) => {
//   const [updateTemplate] = useUpdateTemplateMutation()
//   const [selectedAssignName, setSelectedAssignName] = useState(-1)
//   const [updateTemplateStage] = useUpdateTemplateStageMutation()
//   const assignNames = names.filter(
//     (permissionName) =>
//       permissionName?.permissionPolicy?.type === PermissionPolicyType.Assign &&
//       permissionName.templatePermission?.stageNumber === stage?.number
//   )
//   const allAssignNames = allPermissionNames.filter(
//     (permissionName) => permissionName?.permissionPolicy?.type === PermissionPolicyType.Assign
//   )
//   const availableAssignNames = allAssignNames.filter(
//     (name) => !assignNames.find((assignName) => name?.name === assignName?.name)
//   )

//   return (
//     <div className="config-permission-container">
//       <Label attached={'top right'} style={{ background: 'white' }}>
//         <div
//           className="increased-font-size"
//           style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//         >
//           <Stage name={stage?.title || ''} colour={stage?.colour || 'grey'} />
//           {isEditable && canDeleteStage && (
//             <Icon
//               className="clickable"
//               style={{ margin: 0, marginLeft: 4 }}
//               name="delete"
//               onClick={() => {
//                 mutate(
//                   () =>
//                     updateTemplate({
//                       variables: {
//                         id: templateId,
//                         templatePatch: {
//                           templateStagesUsingId: {
//                             deleteById: [{ id: stage?.id || 0 }],
//                           },
//                         },
//                       },
//                     }),
//                   setError
//                 )
//               }}
//             />
//           )}
//         </div>
//       </Label>

//       <div
//         key={stage?.id || 0}
//         style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//       >
//         <div
//           key={stage?.id || 0}
//           style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
//         >
//           {semanticComponentLibrary.TextInput({
//             title: 'Stage Name',
//             text: stage?.title || '',
//             disabled: !isEditable,
//             setText: (text) => {
//               if (!isEditable) return

//               mutate(
//                 () =>
//                   updateTemplate({
//                     variables: {
//                       id: templateId,
//                       templatePatch: {
//                         templateStagesUsingId: {
//                           updateById: [{ patch: { title: text }, id: stage?.id || 0 }],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )
//             },
//           })}

//           {semanticComponentLibrary.TextInput({
//             title: 'Color',
//             text: stage?.colour || '',
//             disabled: !isEditable,
//             setText: (text) => {
//               if (!isEditable) return

//               mutate(
//                 () =>
//                   updateTemplate({
//                     variables: {
//                       id: templateId,
//                       templatePatch: {
//                         templateStagesUsingId: {
//                           updateById: [{ patch: { colour: text }, id: stage?.id || 0 }],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )
//             },
//           })}
//           <a target="_blank" href={'https://www.w3schools.com/cssref/css_colors.asp'}>
//             <Icon style={{ color: stage?.colour || 'grey' }} name="info circle" />
//           </a>

//           <div className="indicators-container as-row">
//             <div key="stageNumber" className="indicator">
//               <Label className="key" content="State Number" />
//               <Label className="value" content={stage?.number} />
//             </div>
//           </div>

//           <div className="increased-width-input">
//             {semanticComponentLibrary.TextInput({
//               title: 'Description',
//               text: stage?.description || '',
//               disabled: !isEditable,
//               setText: (text) => {
//                 if (!isEditable) return

//                 mutate(
//                   () =>
//                     updateTemplate({
//                       variables: {
//                         id: templateId,
//                         templatePatch: {
//                           templateStagesUsingId: {
//                             updateById: [{ patch: { description: text }, id: stage?.id || 0 }],
//                           },
//                         },
//                       },
//                     }),
//                   setError
//                 )
//               },
//             })}
//           </div>
//         </div>
//       </div>

//       <Popup
//         content="Template permissions only editable on draft templates"
//         key="notDraftEdit"
//         disabled={isEditable}
//         trigger={
//           <div
//             style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
//           >
//             <Header style={{ margin: 0, marginRight: 3 }} as="h5">
//               Level 1 Assign
//             </Header>
//             <Dropdown
//               value={selectedAssignName}
//               selection
//               disabled={!isEditable}
//               onChange={(_, { value }) => setSelectedAssignName(Number(value))}
//               options={availableAssignNames.map((name) => ({
//                 key: name?.id,
//                 text: name?.name,
//                 value: name?.id,
//               }))}
//             />
//             <Icon
//               className="clickable"
//               name="add"
//               style={{ marginLeft: 5 }}
//               onClick={async () => {
//                 if (!isEditable) return
//                 if (selectedAssignName === -1)
//                   return setError({
//                     error: 'select permission name',
//                     message: 'permission name not selected',
//                   })

//                 setSelectedAssignName(-1)
//                 await mutate(
//                   () =>
//                     updateTemplate({
//                       variables: {
//                         id: templateId,
//                         templatePatch: {
//                           templatePermissionsUsingId: {
//                             create: [
//                               { permissionNameId: selectedAssignName, stageNumber: stage?.number },
//                             ],
//                           },
//                         },
//                       },
//                     }),
//                   setError
//                 )
//               }}
//             />
//           </div>
//         }
//       />

//       {assignNames.map((permissionName) => (
//         <div
//           key={permissionName?.id || 0}
//           className="indicators-container as-row"
//           style={{ justifyContent: 'flex-start', margin: 3 }}
//         >
//           <div key="permissionName" className="indicator">
//             <Label className="key" content="Permission Name" />
//             <Label className="value" content={permissionName?.name} />
//             <Icon
//               name="info circle"
//               className="clickable"
//               color="blue"
//               style={{ margin: 0, lineHeight: 'normal' }}
//               onClick={() =>
//                 setPermissionSatistics({
//                   id: permissionName?.id,
//                   name: permissionName?.name || '',
//                   permissionPolicyId: permissionName?.permissionPolicyId || 0,
//                 })
//               }
//             />
//           </div>

//           <div key="policyName" className="indicator">
//             <Label className="key" content="Policy Name" />
//             <Label className="value" content={permissionName?.permissionPolicy?.name} />
//           </div>

//           <Popup
//             content="Template permissions only editable on draft templates"
//             key="notDraftEdit"
//             disabled={isEditable}
//             trigger={
//               <Icon
//                 className="clickable"
//                 style={{ alignSelf: 'center', margin: 0, marginLeft: 5 }}
//                 name="delete"
//                 onClick={async () => {
//                   if (!isEditable) return

//                   setSelectedAssignName(-1)
//                   await mutate(
//                     () =>
//                       updateTemplate({
//                         variables: {
//                           id: templateId,
//                           templatePatch: {
//                             templatePermissionsUsingId: {
//                               deleteById: [{ id: permissionName?.templatePermission?.id }],
//                             },
//                           },
//                         },
//                       }),
//                     setError
//                   )
//                 }}
//               />
//             }
//           />
//         </div>
//       ))}
//       <div
//         className="flex-column"
//         style={{ padding: 10, marginTop: 10, background: '#f0f0f0', borderRadius: 7 }}
//       >
//         <div
//           className="clickable"
//           style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//         >
//           <Header style={{ margin: 6 }} as="h3">
//             Review Levels
//           </Header>
//           <Icon
//             style={{ marginLeft: 5 }}
//             name="add"
//             onClick={() => {
//               if (!isEditable) return

//               const maxLevelNumber = (
//                 stage?.templateStageReviewLevelsByStageId?.nodes || []
//               ).reduce(
//                 (max, level) => (max < Number(level?.number) ? Number(level?.number) : max),
//                 0
//               )

//               mutate(
//                 () =>
//                   updateTemplateStage({
//                     variables: {
//                       templateStagePatch: {
//                         templateStageReviewLevelsUsingId: {
//                           create: [
//                             {
//                               number: maxLevelNumber + 1,
//                               name: 'new review level name',
//                               description: 'new review level description',
//                             },
//                           ],
//                         },
//                       },
//                       id: stage?.id || 0,
//                     },
//                   }),
//                 setError
//               )
//             }}
//           />
//         </div>

//         {(stage?.templateStageReviewLevelsByStageId?.nodes || []).map((reviewLevel) => (
//           <ReviewLevel
//             setPermissionSatistics={setPermissionSatistics}
//             key={reviewLevel?.number}
//             setError={setError}
//             reviewLevel={reviewLevel as TemplateStageReviewLevel}
//             isEditable={isEditable}
//             stage={stage as TemplateStage}
//             names={names}
//             allPermissionNames={allPermissionNames}
//             templateId={templateId}
//             templateInfo={templateInfo}
//           />
//         ))}
//       </div>
//     </div>
//   )
// }

// const ReviewLevel: React.FC<{
//   isEditable: boolean
//   reviewLevel: TemplateStageReviewLevel
//   stage: TemplateStage
//   setError: (error: Error) => void
//   allPermissionNames: PermissionName[]
//   names: PermissionNameFlat[]
//   templateInfo: TemplateInfo
//   templateId: number
//   setPermissionSatistics: (props: { id: number; name: string; permissionPolicyId: number }) => void
// }> = ({
//   isEditable,
//   templateId,
//   templateInfo,
//   reviewLevel,
//   stage,
//   setError,
//   names,
//   allPermissionNames,
//   setPermissionSatistics,
// }) => {
//   const [selectedReviewNameId, setSelectedReviewNameId] = useState(-1)
//   const [updateTemplateStage] = useUpdateTemplateStageMutation()
//   const [updateTemplate] = useUpdateTemplateMutation()
//   const canChooseSelfAssign = true

//   const allReviewNames = allPermissionNames.filter(
//     (name) => name?.permissionPolicy?.type === PermissionPolicyType.Review
//   )
//   const currentNames = names.filter(
//     (name) =>
//       name?.templatePermission?.stageNumber === stage?.number &&
//       name?.templatePermission?.levelNumber === reviewLevel?.number
//   )
//   const availableReviewNames = allReviewNames.filter(
//     (name) => !currentNames.find((assignName) => name?.name === assignName?.name)
//   )

//   const canDeleteLevel = () => {
//     const maxLevelNumber = (stage?.templateStageReviewLevelsByStageId?.nodes || []).reduce(
//       (max, level) => (max < Number(level?.number) ? Number(level?.number) : max),
//       0
//     )

//     if (reviewLevel.number === maxLevelNumber) return true

//     return false
//   }

//   return (
//     <div key={reviewLevel?.id || 0} className="config-permission-container">
//       <Label attached={'top right'} style={{ background: 'white' }}>
//         <div
//           className="increased-font-size"
//           style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//         >
//           <Label style={{ fontSize: 16, borderRadius: 15 }}>{reviewLevel.name.toUpperCase()}</Label>
//           {isEditable && canDeleteLevel() && (
//             <Icon
//               className="clickable"
//               style={{ margin: 0, marginLeft: 4 }}
//               name="delete"
//               onClick={() => {
//                 mutate(
//                   () =>
//                     updateTemplateStage({
//                       variables: {
//                         id: stage?.id,
//                         templateStagePatch: {
//                           templateStageReviewLevelsUsingId: {
//                             deleteById: [{ id: reviewLevel.id }],
//                           },
//                         },
//                       },
//                     }),
//                   setError
//                 )
//               }}
//             />
//           )}
//         </div>
//       </Label>
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'row',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//         }}
//       >
//         {semanticComponentLibrary.TextInput({
//           title: 'Level Name',
//           text: reviewLevel?.name || '',
//           disabled: !isEditable,
//           setText: (text) => {
//             if (!isEditable) return

//             mutate(
//               () =>
//                 updateTemplateStage({
//                   variables: {
//                     id: stage?.id,
//                     templateStagePatch: {
//                       templateStageReviewLevelsUsingId: {
//                         updateById: [{ id: reviewLevel.id, patch: { name: text } }],
//                       },
//                     },
//                   },
//                 }),
//               setError
//             )
//           },
//         })}

//         <div className="indicators-container as-row">
//           <div key="levelNumber" className="indicator">
//             <Label className="key" content="Level Number" />
//             <Label className="value" content={reviewLevel?.number} />
//           </div>
//         </div>

//         <div className="increased-width-input">
//           {semanticComponentLibrary.TextInput({
//             title: 'Description',
//             text: reviewLevel?.description || '',
//             disabled: !isEditable,
//             setText: (text) => {
//               if (!isEditable) return

//               mutate(
//                 () =>
//                   updateTemplateStage({
//                     variables: {
//                       id: stage?.id,
//                       templateStagePatch: {
//                         templateStageReviewLevelsUsingId: {
//                           updateById: [{ id: reviewLevel.id, patch: { description: text } }],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )
//             },
//           })}
//         </div>
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
//         <Header style={{ margin: 0, marginRight: 3 }} as="h5">
//           {reviewLevel.name}
//         </Header>
//         <Dropdown
//           value={selectedReviewNameId}
//           selection
//           disabled={!isEditable}
//           onChange={(_, { value }) => setSelectedReviewNameId(Number(value))}
//           options={availableReviewNames.map((name) => ({
//             key: name?.id,
//             text: name?.name,
//             value: name?.id,
//           }))}
//         />
//         <Icon
//           className="clickable"
//           name="add"
//           style={{ marginLeft: 5 }}
//           onClick={async () => {
//             if (!isEditable) return
//             if (selectedReviewNameId === -1)
//               return setError({
//                 error: 'select permission name',
//                 message: 'permission name not selected',
//               })

//             setSelectedReviewNameId(-1)
//             await mutate(
//               () =>
//                 updateTemplate({
//                   variables: {
//                     id: templateId,
//                     templatePatch: {
//                       templatePermissionsUsingId: {
//                         create: [
//                           {
//                             permissionNameId: selectedReviewNameId,
//                             stageNumber: stage?.number,
//                             levelNumber: reviewLevel?.number,
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 }),
//               setError
//             )
//           }}
//         />
//       </div>

//       {currentNames.map((permissionName) => (
//         <div
//           key={permissionName?.id || 0}
//           className="indicators-container as-row"
//           style={{
//             justifyContent: 'flex-start',
//             padding: 5,
//             margin: 3,
//             borderRadius: 7,
//             background: 'rgb(240, 240, 240)',
//           }}
//         >
//           <div className="flex-column">
//             <div className="flex-row">
//               <div key="permissionName" className="indicator">
//                 <Label className="key" content="Permission Name" />
//                 <Label className="value" content={permissionName?.name} />
//                 <Icon
//                   name="info circle"
//                   className="clickable"
//                   color="blue"
//                   style={{ margin: 0, lineHeight: 'normal' }}
//                   onClick={() =>
//                     setPermissionSatistics({
//                       id: permissionName?.id,
//                       name: permissionName?.name || '',
//                       permissionPolicyId: permissionName?.permissionPolicyId || 0,
//                     })
//                   }
//                 />
//               </div>

//               <div key="policyName" className="indicator">
//                 <Label className="key" content="Policy Name" />
//                 <Label className="value" content={permissionName?.permissionPolicy?.name} />
//               </div>

//               <SelfAssignCheckBox
//                 permissionName={permissionName}
//                 canChooseSelfAssign={canChooseSelfAssign}
//                 setError={setError}
//                 templateId={templateId}
//                 isEditable={isEditable}
//               />
//               <Popup
//                 content="Template permissions only editable on draft templates"
//                 key="notDraftEdit"
//                 disabled={isEditable}
//                 trigger={
//                   <Icon
//                     className="clickable"
//                     style={{ alignSelf: 'center', margin: 0, marginLeft: 5 }}
//                     name="delete"
//                     onClick={async () => {
//                       if (!isEditable) return

//                       setSelectedReviewNameId(-1)
//                       await mutate(
//                         () =>
//                           updateTemplate({
//                             variables: {
//                               id: templateId,
//                               templatePatch: {
//                                 templatePermissionsUsingId: {
//                                   deleteById: [{ id: permissionName?.templatePermission?.id }],
//                                 },
//                               },
//                             },
//                           }),
//                         setError
//                       )
//                     }}
//                   />
//                 }
//               />
//             </div>
//             <div className="flex-row" style={{ flexWrap: 'wrap' }}>
//               {(templateInfo?.templateSections?.nodes || []).length > 1 &&
//                 (templateInfo?.templateSections?.nodes || []).map((section) => (
//                   <SectionRestriction
//                     section={section as TemplateSection}
//                     permissionName={permissionName}
//                     canChooseSelfAssign={canChooseSelfAssign}
//                     setError={setError}
//                     templateId={templateId}
//                     templateInfo={templateInfo}
//                     isEditable={isEditable}
//                   />
//                 ))}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// const SelfAssignCheckBox: React.FC<{
//   permissionName: PermissionNameFlat
//   canChooseSelfAssign: boolean
//   templateId: number
//   isEditable: boolean
//   setError: (error: Error) => void
// }> = ({ permissionName, canChooseSelfAssign, templateId, setError, isEditable }) => {
//   const [updateTemplate] = useUpdateTemplateMutation()
//   return (
//     <div key={permissionName?.templatePermission.id}>
//       {semanticComponentLibrary.Checkbox({
//         title: 'Can Self Assign',
//         checked: permissionName.templatePermission?.canSelfAssign,
//         disabled: !canChooseSelfAssign || !isEditable,
//         setChecked: (checked) => {
//           mutate(
//             () =>
//               updateTemplate({
//                 variables: {
//                   id: templateId,
//                   templatePatch: {
//                     templatePermissionsUsingId: {
//                       updateById: [
//                         {
//                           id: permissionName.templatePermission.id,
//                           patch: {
//                             canSelfAssign: checked,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                 },
//               }),
//             setError
//           )
//         },
//       })}
//     </div>
//   )
// }

// const SectionRestriction: React.FC<{
//   permissionName: PermissionNameFlat
//   section: TemplateSection
//   canChooseSelfAssign: boolean
//   templateInfo: TemplateInfo
//   isEditable: boolean
//   setError: (error: Error) => void
//   templateId: number
// }> = ({
//   section,
//   permissionName,
//   templateInfo,
//   canChooseSelfAssign,
//   setError,
//   templateId,
//   isEditable,
// }) => {
//   const [updateTemplate] = useUpdateTemplateMutation()

//   let checked =
//     permissionName.templatePermission?.canSelfAssign ||
//     (permissionName.templatePermission?.allowedSections || []).length === 0 ||
//     (permissionName.templatePermission?.allowedSections || []).includes(section?.code || '')
//   return (
//     <div key={section?.id} style={{ margin: 3 }}>
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'row',
//           alignItems: 'center',
//           borderRadius: 7,
//           padding: 3,
//           background: '#E8E8E8',
//         }}
//       >
//         <Label
//           style={{ whiteSpace: 'nowrap', margin: 0, marginRight: 2 }}
//         >{`allow (${section?.code})`}</Label>

//         <Checkbox
//           checked={checked}
//           toggle
//           disabled={
//             (canChooseSelfAssign && permissionName.templatePermission?.canSelfAssign) || !isEditable
//           }
//           size="small"
//           onChange={() => {
//             if (!isEditable) return
//             let allowedSections = [...(permissionName.templatePermission?.allowedSections || [])]

//             if (checked) {
//               if (allowedSections.length === 0) {
//                 allowedSections = (templateInfo?.templateSections.nodes || []).map(
//                   (templateSection) => templateSection?.code || ''
//                 )
//               }
//               const indexOf = allowedSections.indexOf(section?.code || '')
//               if (indexOf >= 0) allowedSections.splice(indexOf, 1)
//             } else {
//               if (!allowedSections.includes(section?.code || ''))
//                 allowedSections.push(section?.code || '')
//             }
//             mutate(
//               () =>
//                 updateTemplate({
//                   variables: {
//                     id: templateId,
//                     templatePatch: {
//                       templatePermissionsUsingId: {
//                         updateById: [
//                           {
//                             id: permissionName.templatePermission.id,
//                             patch: {
//                               allowedSections,
//                             },
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 }),
//               setError
//             )
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// export default Permissions
