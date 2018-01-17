import * as React from 'react'
import * as CodeMirror from 'react-codemirror'
import {
  Notification,
  NotificationProps,
  NotificationSystemProvider,
  withNotifications
} from 'with-notification-system'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import './App.css'

require('codemirror/mode/javascript/javascript')
require('codemirror/mode/jsx/jsx')

type ErrorBoundaryState = { error: Error | null, info: React.ErrorInfo | null }
class DevErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  state = { error: null, info: null }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info })
  }
  render() {
    if (this.state.error != null) {
      return (
        <div className="ErrorBoundary">
          <h2>Error</h2>
          <p>
            If you are seeing this please create an issue on{' '}
            <a href="https://github.com/Dean177/with-notification-system/issues">Github</a> which includes the following
            information:
          </p>
          <pre>{JSON.stringify(this.state.error, null, 2)}</pre>
          <h2>Component</h2>
          <pre>{(this.state.info! as React.ErrorInfo).componentStack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

const SyntaxHighlight = (props: { mode?: { name: string }, code: string }) => (
  <CodeMirror
    options={{ mode: props.mode || { name: 'jsx', base: { name: 'javascript', typescript: true }}, theme: 'monokai' }}
    value={props.code}
  />
)

const ButtonGroup = ({ children }: { children: React.ReactNode }) =>
  <div className="ButtonGroup">{children}</div>

const SingleNotificationExample: React.ComponentType<NotificationProps> = (props) => (
  <ButtonGroup>
    <button onClick={() => props.notification.add({ position: 'tl' })}>Success</button>
    <button
      onClick={() => props.notification.add({
        title: 'Info',
        level: 'info',
        position: 'tc',
        message: 'Relevant information'
      })}
    >
      Info
    </button>
    <button onClick={() => props.notification.add({ level: 'warning' })}>Warning</button>
    <button
      onClick={() => props.notification.add({
        autoDismiss: 0,
        level: 'error',
        position: 'br',
        message: 'I must be manually dismissed',
      })}
    >
      Error
    </button>
  </ButtonGroup>
)

const EnhancedSingleNotification: React.ComponentType<{}> =
  withNotifications(SingleNotificationExample)

const SelfDismissButton = withNotifications<{}>((props: NotificationProps) => (
  <button
    onClick={() => {
      const notification = props.notification.add({
        autoDismiss: 0,
        dismissible: false,
        level: 'warning',
        title: 'Remove me manually',
        children: (
          <button onClick={() => props.notification.remove(notification)}>Remove</button>
        )
      })
    }}
  >
    Add with custom children
  </button>
))

const RemoveAllButton = withNotifications<{}>((props: NotificationProps) => (
  <ButtonGroup>
    <button
      onClick={() => {
        Array.from(Array(10), (_: null, i: number): Notification => ({
          autoDismiss: 0,
          dismissible: false,
          title: `Message #${i + 1}`,
        })).forEach((notification) => props.notification.add(notification))
      }}
    >
      Add ten notifications
    </button>
    <button onClick={props.notification.removeAll}>Remove them all!</button>
  </ButtonGroup>
))

export const App = () => (
  <DevErrorBoundary>
    <NotificationSystemProvider className="App">
      <div className="App-header">
        <h1>with-notification-system</h1>
      </div>
      <div className="content">
        <div className="status-icons github-buttons">
          <a
            className="status-icon github-button"
            href="https://github.com/dean177/with-notification-system"
            data-size="mega"
            data-icon="octicon-star"
            data-count-href="/dean177/with-notification-system/stargazers"
            data-show-count="true"
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star dean177/with-notification-system on GitHub"
          >
            Star
          </a>
          <a className="status-icon" href="https://circleci.com/gh/Dean177/with-notification-system">
            <img src="https://circleci.com/gh/Dean177/with-notification-system.svg?style=shield" />
          </a>
          <a className="status-icon" href="https://codecov.io/gh/Dean177/with-notification-system">
            <img src="https://codecov.io/gh/Dean177/with-notification-system/branch/master/graph/badge.svg" />
          </a>
          <a className="status-icon" href="https://greenkeeper.io/">
            <img src="https://badges.greenkeeper.io/Dean177/with-notification-system.svg" />
          </a>
          <a className="status-icon" href="https://www.npmjs.com/package/with-notification-system">
            <img src="https://badge.fury.io/js/with-notification-system.svg" alt="npm version" height="18" />
          </a>
        </div>
        <h2>Installation</h2>
        <p>Install the dependencies</p>
        <SyntaxHighlight code={`yarn install with-notification-system`} mode={{ name: 'shell' }} />

        <p>Wrap your app in a {`<NotificationSystemProvider />`}</p>
        <SyntaxHighlight
          code={`
const App = () =>
  <NotificationSystemProvider className="App">
    <div className="App-header">
      <h2>with-notification-system</h2>
    </div>
    <div className="content">
      <h1>Installation</h1>
      <p>Install the dependencies</p>
    </div>
  </NotificationSystemProvider>
          `}
        />

        <h2>Usage</h2>

        <h3>Add a notification</h3>
        <EnhancedSingleNotification />
        <CodeMirror
          options={{
            mode: { name: 'jsx', base: { name: 'javascript', typescript: true }},
            theme: 'monokai',
          }}
          value={`
// Create your component
const SingleNotificationExample: React.ComponentType<NotificationProps & { title?: string }> = (props) =>
  <button onClick={() => props.notification.add({ title: props.title })}>Success</button>

// Enhance it to link it to the notification system
const EnhancedSingleNotification: React.ComponentType<{ title?: string }> =
  withNotifications(SingleNotificationExample)

// Wrap you component with the notification system
const App = () =>
  <NotificationSystemProvider className="App">
    <EnhancedSingleNotification title="Custom title"/>
  </NotificationSystemProvider>
      `}
        />

        <h3>Add a notification with custom children</h3>
        <ButtonGroup>
          <SelfDismissButton />
        </ButtonGroup>
        <CodeMirror
          options={{
            mode: { name: 'jsx', base: { name: 'javascript', typescript: true }},
            theme: 'monokai',
          }}
          value={`
<button onClick={() => {
  const notification = props.notification.add({
    autoDismiss: 0,
    dismissible: false,
    level: 'warning',
    title: 'This notification can dismiss itself',
    children: (
      <button onClick={() => props.notification.remove(notification)}>Remove</button>
    )
  })
}}
>
  Add with custom children
</button>
      `}
        />
        <h3>Clear all notifications</h3>
        <RemoveAllButton />
        <SyntaxHighlight
          code={`
<ButtonGroup>
  <button
    onClick={() => {
      Array.from(Array(10), (_: null, i: number): Notification => ({
        autoDismiss: 0,
        dismissible: false,
        title: ${'`Message ${i + 1}`'},
      })).forEach((notification) => props.notification.add(notification))
    }}
  >
    Add ten notifications
  </button>
  <button onClick={props.notification.removeAll}>Remove them all!</button>
</ButtonGroup>
          `}
        />
      </div>
    </NotificationSystemProvider>
  </DevErrorBoundary>
)
