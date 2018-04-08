import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import loggedinUser from './app';
import { deselectUser } from './outlogged';
import { renderOutlogged } from './app';

export function logout() {
  deselectUser();
  renderOutlogged();
}

export class Menu extends React.Component {
  render() {
    return (
      <ul className="olnavbar-ul">
        <li className="olnavbar-li"><Link to='/login' className="olnavbar-link">Login</Link></li>
        <li className="olnavbar-li"><Link to='/registration' className="olnavbar-link">Registrering</Link></li>
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
        <li className="navbar-li"><Link to='/eventlist' className="navbar-link">Arrangement</Link></li>
        <li className="navbar-li"><Link to='/userlistadmin' className="navbar-link">Brukere</Link></li>
        <li className="navbar-li"><Link to='/requests' className="navbar-link">Forespørsler</Link></li>
        <li className="navbar-li"><Link to={'/myprofile/' + this.id} className="navbar-link">Min profil</Link></li>

        <li className="navbar-li-right"><Link to='#' onClick={() => logout()} className='navbar-link'>Logg ut</Link></li>
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
        <li className="navbar-li"><Link to='/eventlist' className="navbar-link">Events</Link></li>
        <li className="navbar-li"><Link to='/userlist' className="navbar-link">Brukere</Link></li>
        <li className="navbar-li"><Link to='/skills' className="navbar-link">Skills</Link></li>
        <li className="navbar-li"><Link to={'/myprofile/' + this.id} className="navbar-link">My Profile</Link></li>

        <li className="navbar-li-right"><Link to='#' onClick={() => logout()} className='navbar-link'>Logg ut</Link></li>
      </ul>
    );
  }
}
