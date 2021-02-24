import React from 'react'
import { Label } from 'semantic-ui-react'
import { PLUGIN_ERRORS } from './pluginProvider'

type Props = {
  pluginCode: any
  children: JSX.Element
  FallbackComponent?: any
}

type State = Readonly<{
  hasError: boolean
  errorMessage: string
}>

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  // This trigger is for updating UI, can use prop 'error' in this method
  static getDerivedStateFromError(error: Error) {
    console.log(Error)
    const knownError = Object.values(PLUGIN_ERRORS).find(
      (errorMessage) => errorMessage === error.message
    )
    return { hasError: true, errorMessage: knownError ? error.message : 'Failed to load plugin' }
  }

  // This trigger is for logging, can use prop 'error', 'errorInfo'
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) return <this.props.FallbackComponent />
      return (
        <Label basic color="red">
          {`${this.state.errorMessage}
            code: ${this.props.pluginCode}`}
        </Label>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
