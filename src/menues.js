import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import loggedinUser from './app';

export class Menu extends React.Component {
  render() {
    return (
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/login' className="navbar-link">Login</Link></li>
        <li className="navbar-li"><Link to='/registration' className="navbar-link">Registration</Link></li>
      </ul>
    );
  }
}

export class AdminLoggedinMenu extends React.Component {
  constructor(props) {
    super(props);

    this.id = props.userId;
  }
  render() {
    return(
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to={'/myprofile/' + this.id} className="navbar-link">Min profil</Link></li>
        <li className="navbar-li"><Link to='/userlist' className="navbar-link">Brukere</Link></li>
        <li className="navbar-li"><Link to='/unconfirmedusers' className="navbar-link">Ventende brukere</Link></li>
      </ul>
    );
  }
}

export class LoggedinMenu extends React.Component {
  constructor(props) {
    super(props);

    this.id = props.userId;
  }

  render() {
    return (
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/events' className="navbar-link">Events</Link></li>
        <li className="navbar-li"><Link to='/skills' className="navbar-link">Skills</Link></li>
        <li className="navbar-li"><Link to={'/myprofile/' + this.id} className="navbar-link">My Profile</Link></li>
        <li className="navbar-li"><Link to='' className="navbar-link" ref="logout">Logout</Link></li>
      </ul>
    );
  }
}
