import { Component, ReactNode } from 'react'

import { monitoring } from 'monitoring'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    monitoring.captureError(error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return <>{this.props.children}</>
  }
}
