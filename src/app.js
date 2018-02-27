import React from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { mailService } from './mail';
import { styles } from './styles';

let user = {};

class Menu extends React.Component {
  render() {
    return (
      <ul style={styles.nbul}>
        <li style={styles.nbil}><Link to='/login' style={styles.nbLink}>Login</Link></li>
        <li style={styles.nbil}><Link to='/registration' style={styles.nbLink}>Registration</Link></li>
      </ul>
    );
  }
}

class Loggedin extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.userId;
  }

  render() {
    return (
      <ul style={styles.nbul}>
        <li style={styles.nbil}><Link to='/events' style={styles.nbLink}>Arrangementer</Link></li>
        <li style={styles.nbil}><Link to='/skills' style={styles.nbLink}>Kompetanse</Link></li>
        <li style={styles.nbil}><Link to={'/profile/' + this.id} style={styles.nbLink}>Min profil</Link></li>
      </ul>
    );
  }

  componentDidMount() {
    userService.getUser(this.id, (result) => {
      user = result;
      this.forceUpdate();
    });
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div>
          <input ref='username' type='text' placeholder='Username' /> <br />
          <input ref='password' type='password' placeholder='Password' /> <br />
          <button ref='login'>Login</button> <br />
          <Link to='/forgotpassword'>Forgot password</Link>
        </div>
    );
  }

  componentDidMount () {
    this.refs.login.onclick = () => {
      userService.login(this.refs.username.value, this.refs.password.value, (result) => {
        if (result == undefined) {
          alert("Feil!")
        }
        else {
          let user = {
            userId: result.id,
            // name: result.firstName,
          }

          renderLogin(user);

        }
      });
    }
  }
}

class Registration extends React.Component {
  render() {
   return (
     <div>
       <input ref="fname" placeholder="Type your firstname"></input><br/>
       <input ref="lname" placeholder="Type your lastname"></input><br/>
       <input ref="city" placeholder="Type your city"></input><br/>
       <input ref="adress" placeholder="Type your adress"></input><br/>
       <input ref="post" placeholder="Type your postalnumber"></input><br/>
       <input ref="tlf" placeholder="Type your phonenumber"></input><br/>
       <input ref="email" placeholder="Type your email"></input><br/>
       <input ref="username" placeholder="Type your username"></input><br/>
       <input ref="password1" placeholder="Type your password" type='password'></input><br/>
       <input ref="password2" placeholder="Type your password" type='password'></input><br/>
       <button ref="newUserButton">Register</button>
     </div>
   );
 }

 componentDidMount () {
   this.refs.newUserButton.onclick = () => {
     if(this.refs.password1.value != this.refs.password2.value) {
       console.log('The passwords must match');
     }

     else {
     userService.addUser(this.refs.fname.value, this.refs.lname.value, this.refs.city.value,
       this.refs.adress.value, Number(this.refs.post.value), Number(this.refs.tlf.value), this.refs.email.value, this.refs.username.value,
       this.refs.password1.value, (result) => {

       });
     }
   }
 }
}

class ForgotPassword extends React.Component {
  render() {
    return (
      <div>
        <Link to='/login'>Back to login</Link> <br/>
        <input ref="fpemail" placeholder="Type your email"></input><br/>
        <button ref="fpsubmit">Request</button>
      </div>
    );
  }

  componentDidMount() {
    this.refs.fpsubmit.onclick = () => {
      userService.getUserbyMail(this.refs.fpemail.value, (result) => {
        if (result == undefined) {
          alert('No users with this email adress.');
        }
        else {
          userService.resetPassword(result.email, result.username, (result, subject, text, email) => {
            mailService.sendMail(email, subject, text);
          });
        }
      });
    }
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.userId;
  }

  render() {
    return(
      <div>
        <h5>Du er logget inn som { this.user.firstName + this.user.lastName }</h5>
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

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;
  }

  render() {
    return(
      <div>
        <div>
          <br />
          Name: {this.user.firstName + ' ' + this.user.lastName} <br />
          Phone: {this.user.phonenumber} <br />
          Email: {this.user.email} <br />
          Adress: {this.user.adress + ', ' + this.user.postalnumber + ' ' + this.user.city} <br />
          <br />
          <Link to={'/editProfile/' + this.userId}><button ref='editUser'>Edit</button></Link>

          <br />
          <br />
          <hr />
        </div>
        <div>
          Change password: <br/>
          <input ref='oldpw' placeholder='Current password' type='password'></input> <br/>
          <input ref='newpw' placeholder='New password' type='password'></input> <br/>
          <input ref='confirmnewpw' placeholder='Confirm new password' type='password'></input> <br/>
          <button ref='submitnewpw'>Change password</button>
        </div>
      </div>
    );
  }

  componentDidMount() {
    userService.getUser(this.id, (result) => {
      this.user = result;
      this.forceUpdate();
    });

    this.refs.submitnewpw.onclick = () => {
      if (this.user.password != this.refs.oldpw.value) {
        console.log('Old password is wrong.');
      }

      else {
        if(this.refs.newpw.value != this.refs.confirmnewpw.value) {
          console.log('The new passwords are not matching.');
        }

        else {
          userService.changePassword(this.user.id, this.refs.newpw.value, (result) => {
            userService.getUser(this.id, (result) => {
              console.log('Password for ' + this.user.username + ' is updated.');
              this.user = result;
            });
          });
        }
      }
    }
  }
}

class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;
  }



  render() {
    return(
      <div>
        <input ref='editFirstName' value={this.user.firstName} />
        <input ref='editLastName' value={this.user.lastName} />
        <br />
        <input ref='editPhone' value={this.user.phonenumber} />
        <input ref='editEmail' value={this.user.email} />
        <br />
        <input ref='editAdress' value={this.user.adress} />
        <input ref='editPostalNumber' value={this.user.postalnumber} />
        <input ref='editCity' value={this.user.city} />
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

class Events extends React.Component {
  render() {
    console.log(user);
    return(
      <div>
        Test
      </div>
    );
  }
}

class Skills extends React.Component {
  render() {
    return(
      <div>
        Skills
      </div>
    );
  }
}



// The Route-elements define the different pages of the application
// through a path and which component should be used for the path.
// The path can include a variable, for instance
// path='/customer/:customerId' component={CustomerDetails}
// means that the path /customer/5 will show the CustomerDetails
// with props.match.params.customerId set to 5.

ReactDOM.render((
  <HashRouter>
    <div>
      <Menu />
      <Switch>
        <Route exact path='/registration' component={Registration} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/forgotpassword' component={ForgotPassword} />
        <Login />
      </Switch>
    </div>
  </HashRouter>
), document.getElementById('root'));

function renderLogin(user) {
  ReactDOM.render((
    <HashRouter>
      <div>
        <Loggedin userId={user.userId}/>
        <Switch>
          <Route exact path='/profile/:userId' component={Profile} />
          <Route exact path='/events' component={Events} />
          <Route exact path='/skills' component={Skills} />
          <Route exact path='/editProfile/:userId' component={EditProfile} />
          <Home userId={user.userId} />
        </Switch>
      </div>
    </HashRouter>
  ), document.getElementById('root'));
}

// <Route exact path='/profile' component={Profile} />
// <Route exact path='/skills' component={Skills} />
// <Route exact path='/events' component={Events} />
