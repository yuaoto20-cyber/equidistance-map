import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App rendering failed", error, info);
  }

  resetUrl = () => {
    window.history.replaceState(null, "", window.location.pathname);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell mode-shell">
          <main className="mode-picker error-card">
            <p className="eyebrow">Recovery</p>
            <h1>表示をリセットします</h1>
            <p className="mode-lead">
              URLに含まれる位置情報を読み込めませんでした。下のボタンで選択画面に戻れます。
            </p>
            <button className="primary-button" onClick={this.resetUrl} type="button">
              選択画面に戻る
            </button>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
