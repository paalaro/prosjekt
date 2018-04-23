import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services/userservice';
import { eventService } from './services/eventservice';
import { skillService } from './services/skillservice';
import loggedinUser from './app';
import { deselectUser } from './outlogged';
import { renderOutlogged } from './app';

export function logout() {
  localStorage.clear();
  deselectUser();
  renderOutlogged();
}

export class Menu extends React.Component { // Meny som vises før man er logget inn
  render() {
    return (
      <ul className="olnavbar-ul">
        <li className="olnavbar-li"><Link to='/login' className="olnavbar-link">Login</Link></li>
        <li className="olnavbar-li"><Link to='/registration' className="olnavbar-link">Registrering</Link></li>
      </ul>
    );
  }
}

export class AdminLoggedinMenu extends React.Component {  // Innlogget-meny for administratorer
  constructor(props) {
    super(props);

    this.id = props.userId;
  }

  render() {
    return(
      <div>
      <ul className="navbar-ul">
          <li className='navbar-li-left'><img className='logo' src="src/img/Rodekors.jpg"/></li>
          <div className="dropdownknapp">
          <li className="dropdown-li"><Link to="/eventlist" className="navbar-link">Arrangement</Link></li>
          <div className="dropdowncontent">
          <ul className="navbar-ul">
            <li className="dropdown-li"><Link to='/createevent' className="dropdown-link">Opprett arrangement</Link></li>
            <li className="dropdown-li"><Link to='/oldeventroles' className="dropdown-link">Tidligere vakter</Link></li>
          </ul>
          </div>
        </div>


        <div className="dropdownknapp">
        <li className="dropdown-li"><Link to='/userlistadmin' className="navbar-link">Brukere</Link></li>
          <div className="dropdowncontent">
          <ul className="navbar-ul">
            <li className="dropdown-li"><Link to='/userlistadmin' className="dropdown-link">Brukerkatalog</Link></li>
            <li className="dropdown-li"><Link to='/stats' className='dropdown-link' >Statistikk</Link></li>
          </ul>
          </div>
        </div>

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

export class LoggedinMenu extends React.Component { // Innlogget-meny for vanlige brukere
  constructor(props) {
    super(props);

    this.id = props.userId;
  }

  render() {
    return (
      <div>
      <ul className="navbar-ul">
        <li className='navbar-li-left'><img className='logo' src="src/img/Rodekors.jpg"/></li>
        <li className="navbar-li"><Link to='/eventlist' className="navbar-link">Events</Link></li>
        <li className="navbar-li"><Link to='/userlist' className="navbar-link">Brukere</Link></li>
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
