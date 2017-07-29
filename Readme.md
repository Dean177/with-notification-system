# with-notification-system

Provides [react-notification-system](https://github.com/igorprado/react-notification-system) as a [higher-order-component](https://facebook.github.io/react/docs/higher-order-components.html).
 
## Installation

`yarn add with-notifications-system`

## Usage

Wrap your app in a `<NotificationSystemProvider />` see the [react-notification-system docs](https://github.com/igorprado/react-notification-system#using) for more details on where to place this element
```javascript
// index.js
import { render } from 'react-dom';
import { withNotificationSystem } from 'with-notification-system';

const rootElement = document.getElementById('root');

render(<NotificationSystemProvider><App /></NotificationSystemProvider>, rootElement);
```

Then anywhere you want a component to be able to create notifications
```javascript
import React from 'react';
import { withNotificationSystem } from 'with-notification-system';

export class SuccessButton extends React.Component {
  handleClick = () =>
    this.props.notifications.create({});
    
  render() {
    return <button onClick={this.handleClick}>Succeed</button>
  }
}

export default withNotificationSystem(SuccessButton)
```