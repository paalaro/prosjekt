import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';

export class UnconfirmedUsers extends React.Component {
  constructor(props) {
    super(props);

    this.unconfirmedUsers = [];
  }

  confirm(userId) {
    userService.confirm(userId, (result) => {
      userService.getUnconfirmedUsers((result) => {
        this.unconfirmedUsers = result;
        this.forceUpdate();
      })
    });
  }

  render() {
    let listItems = [];
    for(let unconfirmedUser of this.unconfirmedUsers) {
      // NavLink is an extension of Link that can add style on the link that matches the active path
      listItems.push(<li key={unconfirmedUser.id}>{unconfirmedUser.firstName + ' ' + unconfirmedUser.lastName}<button onClick={() => this.confirm(unconfirmedUser.id)}>Confirm</button></li>);
    }

    return (
      <div>
        Unconfirmed users:
        <ul>{listItems}</ul>
      </div>
    );
  }

  componentDidMount() {
    userService.getUnconfirmedUsers((result) => {
      this.unconfirmedUsers = result;
      this.forceUpdate();
    });
  }
}
