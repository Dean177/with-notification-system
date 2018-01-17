import * as PropTypes from 'prop-types'
import * as React from 'react'
import { ChildContextProvider, Component, ComponentClass, ComponentType, createElement, ReactNode } from 'react'
import * as NotificationSystem from 'react-notification-system'
import { Notification as ReactNotification, System } from 'react-notification-system'

export type Notification = ReactNotification

export type ChildContext = { notificationSystem: System | null }

export type Props = NotificationSystem.Attributes & {
  className?: string,
  children: ReactNode,
}

export type State = { notificationSystem: System | null }

export class NotificationSystemProvider extends Component<Props, State> implements ChildContextProvider<ChildContext> {
  static childContextTypes = { notificationSystem: PropTypes.any }
  state = { notificationSystem: null }

  getChildContext = (): ChildContext => ({ notificationSystem: this.state.notificationSystem })

  saveSystemRef = (notificationSystem: System): void =>
    this.setState({ notificationSystem })

  render() {
    const { className, children, ...notificationSystemProps } = this.props
    return createElement('div', {
      className: className || 'NotificationSystemProvider',
      children: [
        ...[this.state.notificationSystem == null ? undefined : children],
        createElement(NotificationSystem, {
          key: 1,
          ref: this.saveSystemRef,
          ...notificationSystemProps,
        }),
      ]
    })
  }
}

export type Uid = number | string

export type ResultNotification = Notification & { uid: Uid }

export type NotificationProps = {
  notification: {
    add: (notification: Notification) => ResultNotification,
    remove: (notification: Notification | Uid) => void,
    removeAll: () => void,
  },
}

export const withNotifications = <OP>(WrappedComponent: ComponentType<OP & NotificationProps>): ComponentClass<OP> =>
  class NotificationsWrapper extends Component<OP> {
    static contextTypes = { notificationSystem: PropTypes.any }
    displayName: string = `withNotifications(${WrappedComponent.displayName || WrappedComponent.name})`
    notificationSystem: System = (null as any) // tslint:disable-line:no-any

    componentWillMount() {
      if (this.context.notificationSystem == null) {
        throw new Error('Component must be a descendant of a <NotificationSystemProvider /> element')
      } 
      this.notificationSystem = this.context.notificationSystem
    }

    addNotification = (notification: Notification): ResultNotification => {
      const level = notification.level || 'success'
      const title = notification.title || level.charAt(0).toUpperCase() + level.substr(1)
      return this.notificationSystem.addNotification({
        position: 'tr',
        ...notification,
        level,
        title,
      }) as ResultNotification
    }

    render() {
      const enhancedProps: OP & NotificationProps = Object.assign({}, this.props, { notification: {
        add: this.addNotification,
        remove: this.notificationSystem.removeNotification,
        removeAll: this.notificationSystem.clearNotifications,
      }})

      return createElement(
        WrappedComponent as ComponentClass<OP & NotificationProps>,
        enhancedProps,
      )
    }
  }
