"use client";

import { Component, type ReactNode } from "react";
import { track } from "../lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches unhandled React rendering errors.
 * Reports them via analytics and shows a friendly fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    track("error.react", {
      message: error.message,
      stack: error.stack?.slice(0, 500),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center p-8">
          <div className="max-w-md rounded-2xl border border-border/60 bg-card-bg p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-semibold mb-2">Nešto je pošlo naopako</h2>
            <p className="text-sm text-muted-dark mb-4">
              Došlo je do neočekivane greške. Probaj ponovo ili osveži stranicu.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mb-4 max-h-32 overflow-auto rounded-lg bg-surface-alt p-3 text-left text-xs text-red-600 dark:text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white
                           hover:bg-primary-dark active:scale-95 transition-all"
              >
                Probaj ponovo
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-dark
                           hover:bg-surface-alt active:scale-95 transition-all"
              >
                Osveži stranicu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
