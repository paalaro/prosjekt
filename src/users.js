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

  confirmAll() {
    if (confirm('Er du sikkert på at du vil godkjenne alle brukere som venter på godkjenning?') == true) {
      userService.confirmAll((result) => {
        userService.getUnconfirmedUsers((result) => {
          this.unconfirmedUsers = result;
          this.forceUpdate();
        });
      });
    }
  }

  render() {
    if (this.unconfirmedUsers.length == 0) {
      return(
        <div>
          Ingen brukere venter på godkjenning.
        </div>
      );
    }

    else {
      let listItems = [];
      for(let unconfirmedUser of this.unconfirmedUsers) {
        // NavLink is an extension of Link that can add style on the link that matches the active path
        listItems.push(<li key={unconfirmedUser.id}>{unconfirmedUser.firstName + ' ' + unconfirmedUser.lastName}<button onClick={() => this.confirm(unconfirmedUser.id)}>Confirm</button></li>);
      }

      return(
        <div>
          Unconfirmed users:
          <ul>{listItems}</ul>
          <br />
          <button ref='confirmAll' onClick={() => this.confirmAll()}>Confirm all</button>
        </div>
      );
    }
  }

  componentDidMount() {
    userService.getUnconfirmedUsers((result) => {
      this.unconfirmedUsers = result;
      this.forceUpdate();
    });
  }
}

export class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.userList = [];
  }

  render() {
    let userList = [];
    let adminList = [];
    for (let user of this.userList) {
      if (user.admin == true) {
        adminList.push(<li key={user.id}><Link to={'/profile/' + user.id}>{user.firstName + ' ' + user.lastName}</Link></li>);
      }

      else {
        userList.push(<li key={user.id}><Link to={'/profile/' + user.id}>{user.firstName + ' ' + user.lastName}</Link></li>);
      }
    }
    return (
      <div>
        Admins:
        <ul>{adminList}</ul>
        Users:
        <ul>{userList}</ul>
      </div>
    );
  }

  componentDidMount() {
    userService.getUsers((result) => {
      this.userList = result;
      this.forceUpdate();
    });
  }
}
