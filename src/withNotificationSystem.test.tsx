import { mount } from 'enzyme'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import { NotificationSystemProvider, NotificationProps, withNotifications } from './withNotificationSystem'

// tslint:disable-next-line:no-any
class ContextSpy extends React.Component<{ spy: any }> {
  static contextTypes = { notificationSystem: PropTypes.any }
  render() {
    this.props.spy(this.context.notificationSystem)
    return React.createElement('div')
  }
}

describe('<NotificationSystemProvider />', () => {
  it('passes the notification system in react context', () => {
    const contextSpy = jest.fn()
    mount(
      <NotificationSystemProvider>
        <ContextSpy spy={contextSpy} />
      </NotificationSystemProvider>
    )

    expect(contextSpy).toHaveBeenCalled()
  })
})

describe('withNotificationsSystem', () => {
  const createMockNotificationSystemProvider = (notificationSystem: {}) =>
    class MockNotificationSystemProvider extends React.Component<{ children: React.ReactNode }> {
      static childContextTypes = { notificationSystem: PropTypes.any }
      getChildContext = (): {} => ({ notificationSystem })
      render() {
        return React.createElement('div', {children: this.props.children})
      }
    }

  const SuccessButton = (props: NotificationProps) =>
    <button onClick={() => props.notification.add({})}>Succeed</button>

  const ConnectedSuccessButton = withNotifications<{}>(SuccessButton)

  it('will throw an error if it is used outside of a Notifications system provider', () => {
    let hasThrown = false
    try {
      mount(<ConnectedSuccessButton />)
    } catch (err) {
      hasThrown = true
      expect(err.message.includes('NotificationSystemProvider')).toBe(true)
    }
    expect(hasThrown).toBe(true)
  })

  it('will pass through calls to the notification system', () => {
    const createSpy = jest.fn()
    const MockNotificationSystemProvider = createMockNotificationSystemProvider({
      addNotification: createSpy,
    })
    const wrapper = mount(
      <MockNotificationSystemProvider>
        <ConnectedSuccessButton />
      </MockNotificationSystemProvider>
    )

    wrapper.find('button').simulate('click')

    expect(createSpy).toHaveBeenCalled()
  })
})