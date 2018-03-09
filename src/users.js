import React from 'react';
import { Link, NavLink, HashRouter, Switch, Route } from 'react-router-dom';
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
      });
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
        <div className='centeredDiv'>
          <div className='alert'>
            <h2>Ingen brukere venter på godkjenning</h2>
          </div>
        </div>
      );
    }

    else {
      let listItems = [];
      for(let unconfirmedUser of this.unconfirmedUsers) {
        // NavLink is an extension of Link that can add style on the link that matches the active path
        listItems.push(<li key={unconfirmedUser.id} className=''>{unconfirmedUser.firstName + ' ' + unconfirmedUser.lastName}<button onClick={() => this.confirm(unconfirmedUser.id)}>Confirm</button></li>);
      }

      return(
        <div className='centeredDiv'>
          <h3>Unconfirmed users</h3>
          <ul className='userUl'>{listItems}</ul>
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

export class UserListAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.userList = [];
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  activate(id) {
    console.log(id);
  }

  deactivate(id) {
    userService.deactivate(id, (result) => {
      userService.getUsers((result) => {
        this.userList = result;
        this.forceUpdate();
      });
    });
  }

  render() {
    let userList = [];
    let adminList = [];
    let deactivatedList = [];
    for (let user of this.userList) {
      if (user.admin == true) {
        adminList.push(<tr key={user.id} className='tableRow'><td onClick={() => this.nextPath('/profile/' + user.id)} style={{width: 40+'%'}} className='tableLines'>{user.firstName} {user.lastName}</td><td style={{width: 35+'%'}} className='tableLines'>{user.phonenumber}</td><td className='tableLines'>{user.email}</td></tr>);
      }

      else if (user.aktivert == false) {
        deactivatedList.push(<tr key={user.id} className='tableRow'><td onClick={() => this.nextPath('/profile/' + user.id)} style={{width: 40+'%'}} className='tableLines'>{user.firstName} {user.lastName}</td><td className='tableLines'><button onClick={() => this.activate(user.id)}>Aktiver</button></td></tr>);
      }

      else {
        userList.push(<tr key={user.id} className='tableRow' onClick={() => this.nextPath('/profile/' + user.id)}><td style={{width: 40+'%'}} className='tableLines'>{user.firstName} {user.lastName}</td><td style={{width: 35+'%'}} className='tableLines'>{user.phonenumber}</td><td className='tableLines'>{user.email}</td></tr>);
      }
    }

    return (
      <div className='userList'>
        <input ref='search' type='text' placeholder='Søk etter bruker' />
        <h3>Admins</h3>
        <table className='userTable'>
          <thead>
            <tr>
              <th className='tableLines'>Navn</th>
              <th className='tableLines'>Telefon</th>
              <th className='tableLines'>Epost</th>
            </tr>
          </thead>
          <tbody>
            {adminList}
          </tbody>
        </table>

        <br />

        <h3>Andre brukere</h3>
        <table className='userTable'>
          <thead>
            <tr>
              <th className='tableLines'>Navn</th>
              <th className='tableLines'>Telefon</th>
              <th className='tableLines'>Epost</th>
            </tr>
          </thead>
          <tbody>
            {userList}
          </tbody>
        </table>

        <br />

        <h3>Deaktiverte brukere</h3>
        <table className='userTable'>
          <thead>
            <tr>
              <th className='tableLines'>Navn</th>
              <th className='tableLines'>Knapp</th>
            </tr>
          </thead>
          <tbody>
            {deactivatedList}
          </tbody>
        </table>
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

export class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.usersList = [];
  }

  render() {
    let userList = [];
    let adminList = [];
    for (let user of this.usersList) {
      if (user.admin == true) {
        adminList.push(<tr key={user.id} className='tableRow'><td className='tableLines'>{user.firstName} {user.lastName}</td><td className='tableLines'>{user.phonenumber}</td><td className='tableLines'>{user.email}</td></tr>);
      }

      else {
        userList.push(<tr key={user.id} className='tableRow'><td className='tableLines'>{user.firstName} {user.lastName}</td><td className='tableLines'>{user.phonenumber}</td><td className='tableLines'>{user.email}</td></tr>);
      }
    }

    if (userList.length == 0 && adminList.length == 0) {
      return(
        <div className='tableList'>
          <input ref='search' type='text' placeholder='Søk etter bruker' />
          <div>
          <h4>Finner ingen brukere som oppfyller søkekravet</h4>
          </div>
        </div>
      );
    }

    else if (adminList.length == 0) {
      return(
        <div className='tableList'>
          <input ref='search' type='text' placeholder='Søk etter bruker' />
          <h3>Andre brukere</h3>
          <table className='userTable'>
            <thead>
              <tr>
                <th className='tableLines'>Navn</th>
                <th className='tableLines'>Telefon</th>
                <th className='tableLines'>Epost</th>
              </tr>
            </thead>
            <tbody>
              {userList}
            </tbody>
          </table>
        </div>
      );
    }

    else if (userList.length == 0) {
      return(
        <div className='tableList'>
          <input ref='search' type='text' placeholder='Søk etter bruker' />
          <h3>Admins</h3>
          <table className='userTable'>
            <thead>
              <tr>
                <th className='tableLines'>Navn</th>
                <th className='tableLines'>Telefon</th>
                <th className='tableLines'>Epost</th>
              </tr>
            </thead>
            <tbody>
              {adminList}
            </tbody>
          </table>
        </div>
      );
    }

    else {
      return(
        <div className='tableList'>
          <input ref='search' type='text' placeholder='Søk etter bruker' />
          <h3>Admins</h3>
          <table className='userTable'>
            <thead>
              <tr>
                <th className='tableLines'>Navn</th>
                <th className='tableLines'>Telefon</th>
                <th className='tableLines'>Epost</th>
              </tr>
            </thead>
            <tbody>
              {adminList}
            </tbody>
          </table>

          <br />

          <h3>Andre brukere</h3>
          <table className='userTable'>
            <thead>
              <tr>
                <th className='tableLines'>Navn</th>
                <th className='tableLines'>Telefon</th>
                <th className='tableLines'>Epost</th>
              </tr>
            </thead>
            <tbody>
              {userList}
            </tbody>
          </table>
        </div>
      );
    }
  }

  componentDidMount() {
    userService.getUsers((result) => {
      this.usersList = result;
      this.forceUpdate();
    });

    this.refs.search.oninput = () => {
      this.resultList = [];
      userService.searchUser(this.refs.search.value, (result) => {
        this.usersList = result;
        this.forceUpdate();
      });
    }
  }
}

export class UserDetails extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;
  }

  render() {
    return(
      <div className='centeredDiv'>
        <div>
          <table>
            <tbody>
              <Link to='/userlist'>
              <tr>
                <td>Navn</td>
                <td>{this.user.firstName} {this.user.lastName}</td>
              </tr>
              </Link>
              <tr>
                <td>Telefon</td>
                <td>{this.user.phonenumber}</td>
              </tr>
              <tr>
                <td>Epost</td>
                <td>{this.user.email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  componentDidMount() {
    userService.getUser(this.id, (result) => {
      this.user = result;
      this.forceUpdate();
    });
  }
}
