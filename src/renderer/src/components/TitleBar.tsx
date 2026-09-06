export default function TitleBar(): JSX.Element {
  return (
    <div className="titlebar">
      <div className="titlebar-controls">
        <div className="titlebar-btn close" onClick={() => window.api.window.close()} />
        <div className="titlebar-btn minimize" onClick={() => window.api.window.minimize()} />
        <div className="titlebar-btn maximize" onClick={() => window.api.window.maximize()} />
      </div>
      <span className="titlebar-title">Plan Studio</span>
      <div className="titlebar-actions" />
    </div>
  )
}
