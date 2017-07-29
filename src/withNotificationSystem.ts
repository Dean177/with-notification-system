import { assign } from 'lodash';
import * as PropTypes from 'prop-types';
import { Component, ComponentClass, ComponentType, createElement, ReactNode } from 'react';
import * as NotificationSystem from 'react-notification-system';
import { Notification, System } from 'react-notification-system';

type ChildContext = { notificationSystem: System | null };

type ComponentDecorator = <Props, EnhancedProps>(component: ComponentType<EnhancedProps>) => ComponentType<Props>;

export type ResultNotification = Notification & { uid: number };

export type Props = { children: ReactNode };
export type State = { notificationSystem: System | null };
export class NotificationSystemProvider extends Component<Props, State> {
  static childContextTypes = { notificationSystem: PropTypes.any };
  state = { notificationSystem: null };

  getChildContext = (): ChildContext => ({ notificationSystem: this.state.notificationSystem });

  saveSystemRef = (notificationSystem: System) => {
    if (this.state.notificationSystem == null) {
      this.setState({ notificationSystem });
    }
  }

  render() {
    return createElement('div', {
      className: 'NotificationSystemProvider',
      children: [
        this.state.notificationSystem == null ? undefined : this.props.children,
        createElement(NotificationSystem, { ref: this.saveSystemRef }),
      ]
    });
  }
}

const defaultNotification: Notification = {
  level: 'success',
  position: 'tr',
  title: 'Success',
};

export type NotificationProps = {
  notification: {
    create: (notification: Notification) => ResultNotification,
  },
};

export const withNotifications = <OP>(WrappedComponent: ComponentType<OP & NotificationProps>): ComponentClass<OP> =>
  class NotificationsWrapper extends Component<OP> {
    static contextTypes = { notificationSystem: PropTypes.any };
    notificationSystem: System = null as any;

    componentWillMount() {
      if (this.context.notificationSystem == null) {
        throw new Error('Component must be a descendant of a <NotificationSystemProvider /> element');
      } else {
        this.notificationSystem = this.context.notificationSystem;
      }
    }

    addNotification = (notification: Notification): ResultNotification =>
      this.notificationSystem.addNotification({ ...defaultNotification, ...notification }) as ResultNotification;

    render () {
      const enhancedProps: OP & NotificationProps = assign({}, this.props, { notification: {
        create: this.addNotification,
      }});
      return createElement(
        WrappedComponent as ComponentClass<OP & NotificationProps>,
        enhancedProps,
      );
    }
  };
