import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundaryShell extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Page render failed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          title="Something went wrong"
          message="Sorry, this page hit an unexpected error."
        />
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }) => {
  const location = useLocation();

  return (
    <ErrorBoundaryShell key={location.pathname}>
      {children}
    </ErrorBoundaryShell>
  );
};
