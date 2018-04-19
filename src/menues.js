import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import loggedinUser from './app';
import { deselectUser } from './outlogged';
import { renderOutlogged } from './app';

export function logout() {
  localStorage.clear();
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
      <div>
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/eventlist' className="navbar-link">Arrangement</Link></li>
        <li className="navbar-li"><Link to='/userlistadmin' className="navbar-link">Brukere</Link></li>
        <li className="navbar-li"><Link to='/requests' className="navbar-link">Forespørsler</Link></li>
        <div className="dropdownknapp">
        <li className="dropdown-li"><Link to={'/myprofile/' + this.id} className="navbar-link">Profil</Link></li>
          <div className="dropdowncontent">
          <ul className="navbar-ul">
            <li className="dropdown-li"><Link to={'/myprofile/' + this.id} className="dropdown-link">Min profil</Link></li>
            <li className="dropdown-li"><Link to={'/changepassword/'} className='dropdown-link' >Endre passord</Link></li>
            <li className="dropdown-li"><Link to='#' onClick={() => logout()} className='dropdown-link' >Logg ut</Link></li>
          </ul>
        </div>
        </div>
      </ul>
    </div>
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
      <div>
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/eventlist' className="navbar-link">Events</Link></li>
        <li className="navbar-li"><Link to='/userlist' className="navbar-link">Brukere</Link></li>
        <li className="navbar-li"><Link to='/skills' className="navbar-link">Skills</Link></li>
        <div className="dropdownknapp">
          <li className="dropdown-li"><Link to={'/myprofile/' + this.id} className="navbar-link">Profil</Link></li>
          <div className="dropdowncontent">
            <ul className="navbar-ul">
              <li className="dropdown-li"><Link to={'/myprofile/' + this.id} className="dropdown-link">Min profil</Link></li>
              <li className="dropdown-li"><Link to={'/changepassword/'} className='dropdown-link' >Endre passord</Link></li>
              <li className="dropdown-li"><Link to='#' onClick={() => logout()} className='dropdown-link' >Logg ut</Link></li>
            </ul>
          </div>
        </div>

      </ul>
      </div>
    );
  }
}
