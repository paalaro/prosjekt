import React from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { mailService } from './mail';

let user = {};

class Menu extends React.Component {
  render() {
    return (
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/login' className="navbar-link">Login</Link></li>
        <li className="navbar-li"><Link to='/registration' className="navbar-link">Registration</Link></li>
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
      <ul className="navbar-ul">
        <li className="navbar-li"><Link to='/events' className="navbar-link">Events</Link></li>
        <li className="navbar-li"><Link to='/skills' className="navbar-link">Skills</Link></li>
        <li className="navbar-li"><Link to={'/profile/' + this.id} className="navbar-link">My Profile</Link></li>
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
          <Link to={'/changePassword/' + this.userId}><button ref='changePassword'>Change Password</button></Link>

          <br />
          <br />
          <hr />
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

class EditProfile extends React.Component {
  constructor() {
    super();

    this.user = user;

    this.state = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      phonenumber: this.user.phonenumber,
      email: this.user.email,
      adress: this.user.adress,
      postalnumber: this.user.postalnumber,
      city: this.user.city
    };
  }

  onFieldChange(fieldName) {
        return function (event) {
            this.setState({[fieldName]: event.target.value});
        }
    }

  render() {
    return(
      <div>
        <input name='firstName' ref='firstName' value={this.state.firstName} onChange={this.onFieldChange('firstName').bind(this)} />
        <input name='lastName' ref='lastName' value={this.state.lastName} onChange={this.onFieldChange('lastName').bind(this)} />
        <br />
        <input name='phonenumber' ref='phonenumber' value={this.state.phonenumber} onChange={this.onFieldChange('phonenumber').bind(this)} />
        <input name='email' ref='email' value={this.state.email} onChange={this.onFieldChange('email').bind(this)} />
        <br />
        <input name='adress' ref='adress' value={this.state.adress} onChange={this.onFieldChange('adress').bind(this)} />
        <input name='postalnumber' ref='postalnumber' type='number' value={this.state.postalnumber} onChange={this.onFieldChange('postalnumber').bind(this)} />
        <input name='city' ref='city' value={this.state.city} onChange={this.onFieldChange('city').bind(this)} />
        <br />
        <button ref='editUserBtn'>Confirm</button>
      </div>
    );
  }

  componentDidMount() {
    this.refs.editUserBtn.onclick = () => {
      userService.editProfile(user.id, this.refs.firstName.value, this.refs.lastName.value, Number(this.refs.phonenumber.value),
        this.refs.email.value, this.refs.adress.value, Number(this.refs.postalnumber.value), this.refs.city.value, (result) => {
          userService.getUser(user.id, (result) => {
            user = result;
          });
        });
    }
  }
}

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.user = user;
  }
  render() {
    return(
      <div>
        Change password: <br/>
        <input ref='oldpw' placeholder='Current password' type='password'></input> <br/>
        <input ref='newpw' placeholder='New password' type='password'></input> <br/>
        <input ref='confirmnewpw' placeholder='Confirm new password' type='password'></input> <br/>
        <button ref='submitnewpw'>Change password</button>
      </div>
    )
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
          <Route exact path='/changePassword/:userId' component={ChangePassword} />
          <Home userId={user.userId} />
        </Switch>
      </div>
    </HashRouter>
  ), document.getElementById('root'));
}
