import React from 'react';

/**
 * Goal: Catch JavaScript runtime errors in child components and display a graceful recovery interface.
 * Method: Implements React Error Boundary lifecycle methods (getDerivedStateFromError and componentDidCatch) to intercept errors before they crash the page.
 * Inputs/Outputs:
 *  - props.children (ReactNode): Wrapped components.
 *  - Returns: Fallback recovery UI when an error is caught, or standard children when normal.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Goal: Update state so the next render will show the fallback UI.
   * Method: Returns an updated state object containing the caught error.
   * Inputs/Outputs:
   *  - error (Error): The thrown runtime error.
   *  - Returns: Object updating hasError to true and storing error.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Goal: Log detailed error diagnostics for debugging.
   * Method: Logs error and component stack info to the browser console.
   * Inputs/Outputs:
   *  - error (Error): The error thrown.
   *  - errorInfo (Object): Component stack trace information.
   *  - Returns: void.
   */
  componentDidCatch(error, errorInfo) {
    console.error("Bundle Builder Error Boundary caught an error:", error, errorInfo);
  }

  /**
   * Goal: Reset error boundary state to allow re-rendering after recovery.
   * Method: Sets hasError back to false and error to null.
   * Inputs/Outputs: None -> updates component state.
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '32px 16px',
          textAlign: 'center',
          fontFamily: 'Gilroy-Medium, sans-serif',
          background: '#FFF5F5',
          borderRadius: '12px',
          margin: '24px auto',
          maxWidth: '600px',
          border: '1px solid #FED7D7'
        }}>
          <h3 style={{ color: '#E04F44', marginBottom: '8px', fontSize: '18px' }}>
            Bundle Builder Notice
          </h3>
          <p style={{ color: '#4A5568', fontSize: '13px', marginBottom: '16px' }}>
            {this.state.error?.message || 'A temporary display issue occurred while updating settings.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              backgroundColor: '#4E2FD2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
