import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates render failures so the rest of the shell (checkout, handshake, etc.) stays usable.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-[1rem] border border-border bg-white p-6 text-center shadow-sm"
        >
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" strokeWidth={1.5} aria-hidden />
          <p className="font-light text-black">{this.props.fallbackTitle ?? 'Something went wrong here.'}</p>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            Other parts of the app still work — try refreshing this section.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
