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

const NotificationContext = (React as any).createContext('notification-context')

export class NotificationSystemProvider extends Component<Props, State>  {
  state = { notificationSystem: null }

  saveSystemRef = (notificationSystem: System): void =>
    this.setState({ notificationSystem })

  render() {
    const { className, children, ...notificationSystemProps } = this.props
    return createElement(NotificationContext.Provider, {
      className: className || 'NotificationSystemProvider',
      value: this.state.notificationSystem,
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
    displayName: string = `withNotifications(${WrappedComponent.displayName || WrappedComponent.name})`

    render() {
      return createElement(NotificationContext.Consumer, { children: (notificationSystem: System) => {
        if (notificationSystem == null) {
          throw new Error('Component must be a descendant of a <NotificationSystemProvider /> element')
        }
        const enhancedProps: OP & NotificationProps = {
          ...(this.props as {}),
          notification: {
            add: (notification: Notification): ResultNotification => {
              const level = notification.level || 'success'
              const title = notification.title || level.charAt(0).toUpperCase() + level.substr(1)
              return notificationSystem.addNotification({
                position: 'tr',
                ...notification,
                level,
                title,
              }) as ResultNotification
            },
            remove: notificationSystem.removeNotification,
            removeAll: notificationSystem.clearNotifications,
          },
        } as OP & NotificationProps
        return createElement(WrappedComponent as ComponentClass<OP & NotificationProps>, enhancedProps)
      }})
    }
  }
