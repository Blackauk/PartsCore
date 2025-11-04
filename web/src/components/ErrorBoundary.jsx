import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // no-op: could log to monitoring here
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-6">Something went wrong.</div>;
    }
    return this.props.children;
  }
}




