import React from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services/userservice';
import { eventService } from './services/eventservice';
import { skillService } from './services/skillservice';
import { mailService } from './services/mailservice';
import { Menu, LoggedinMenu, AdminLoggedinMenu } from './menues';
import { Login, Registration, Registered, ForgotPassword, PasswordSent, loggedin, updateUserDetails, selectUser } from './outlogged';
import { Profile, MyProfile, EditProfile, checkOldSkills, ChangePassword } from './profile';
import { Requests, UserListAdmin, UserList, UserDetails } from './users';
import { EventList, CreateEvent, EditEvent, Roles, ChangeRole, OldEventRoles } from './events';
import { EventDetails } from './eventdetails';
import { Stats } from './stats'
import crypto from 'crypto';

crypto.DEFAULT_ENCODING = 'hex';



function checkPoints() { // Funksjon som kjører hver gang noen logger inn for å sjekke om det finnes vaktpoeng som ikke har blitt delt ut enda.
  eventService.getPoints((result) => {
    let eventroller = result; // Resultatet inneholder vakter der vaktpoeng ikke har blitt delt ut enda
    for (let eventrolle of eventroller) {
      let hours = Math.floor((eventrolle.end.getTime() - eventrolle.start.getTime()) / 3600000);
      eventService.givePoints(eventrolle.userid, hours, eventrolle.event_rolle_id, (result) => {  // Funksjon som gir et vaktpoeng for hver time vakten varer.

      });
    }
  });
}


// The Route-elements define the different pages of the application
// through a path and which component should be used for the path.
// The path can include a variable, for instance
// path='/customer/:customerId' component={CustomerDetails}
// means that the path /customer/5 will show the CustomerDetails
// with props.match.params.customerId set to 5.


export function renderOutlogged() { // Kjører når man logger inn
  checkOldSkills();
  let loggedinUser = userService.getSignedInUser(); // Sjekker om det ligger lagret en bruker i localStorage som ikke har logget ut
  if (loggedinUser != undefined) {  // Dersom det ligger en bruker her blir brukeren sendt videre til ReactDOM render for admin eller vanlig bruker.
    if (loggedinUser.admin == true) {
      renderAdminLogin(loggedinUser.id);
      selectUser(loggedinUser);
    }
    else {
      renderLogin(loggedinUser.id);
      selectUser(loggedinUser);
    }
  }
  else {  // Dersom ingen bruker er logget inn fra før, kjører denne ReactDOM.render, der man først kommer inn på login-siden
    ReactDOM.render((
      <HashRouter>
        <div>
          <Menu />
          <Switch>
            <Route exact path='/registration' component={Registration} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/forgotpassword' component={ForgotPassword} />
            <Route exact path='/passwordsent/:mail' component={PasswordSent} />
            <Route exact path='/registered' component={Registered} />
            <Login />
          </Switch>
        </div>
      </HashRouter>
    ), document.getElementById('root'));
  }
}

renderOutlogged();
checkPoints();

export function renderLogin(user) { //ReactDOM.render for standard brukere
  ReactDOM.render((
    <HashRouter>
      <div>
        <LoggedinMenu userId={user}/>
        <Switch>
          <Route exact path='/myprofile/:userId' component={MyProfile} />
          <Route exact path='/eventlist' component={EventList} />
          <Route exact path='/editprofile' component={EditProfile} />
          <Route exact path='/changepassword' component={ChangePassword} />
          <Route exact path='/userlist' component={UserList} />
          <Route exact path='/userdetails/:userId' component={UserDetails} />
          <Route exact path='/eventlist' component={EventList} />
          <Route exact path='/eventdetails/:eventId' component={EventDetails} />
          <Route exact path='/changerole/:userId' component={ChangeRole} />
          <Route exact path='/oldeventroles' component={OldEventRoles} />
          <EventList />
        </Switch>
      </div>
    </HashRouter>
  ), document.getElementById('root'));
}

export function renderAdminLogin(user) { //ReactDOM.render for admins
  ReactDOM.render((
    <HashRouter>
      <div>
        <AdminLoggedinMenu userId={user}/>
        <Switch>
          <Route exact path='/userlistadmin' component={UserListAdmin} />
          <Route exact path='/requests' component={Requests} />
          <Route exact path='/myprofile/:userId' component={MyProfile} />
          <Route exact path='/profile/:userId' component={Profile} />
          <Route exact path='/editprofile' component={EditProfile} />
          <Route exact path='/eventlist' component={EventList} />
          <Route exact path='/eventdetails/:eventId' component={EventDetails} />
          <Route exact path='/createevent' component={CreateEvent} />
          <Route exact path='/changepassword' component={ChangePassword} />
          <Route exact path='/editevent' component={EditEvent} />
          <Route exact path='/roles/:eventId' component={Roles} />
          <Route exact path='/stats' component={Stats} />
          <Route exact path='/changerole/:userId' component={ChangeRole} />
          <Route exact path='/oldeventroles' component={OldEventRoles} />
          <Requests />
        </Switch>
      </div>
    </HashRouter>
  ), document.getElementById('root'));
}
