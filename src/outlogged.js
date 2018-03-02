import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { renderLogin, renderAdminLogin } from './app';
import { mailService } from './mail';

let loggedin = {};

export { loggedin };

export class Login extends React.Component {
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
          if (result.admin == true) {
            loggedin = result;

            renderAdminLogin(result.id);
          }

          else {
            loggedin = result;

            renderLogin(result.id);
          }
        }
      });
    }
  }
}

export class Registration extends React.Component {
  constructor() {
    super();

    this.state = {
      city: ''
    }
  }

  render() {
   return (
     <div>
       <input ref="fname" placeholder="Type your firstname"></input><br/>
       <input ref="lname" placeholder="Type your lastname"></input><br/>
       <input ref="adress" placeholder="Type your adress"></input><br/>
       <input ref="postalnumber" placeholder="Type your postalnumber" maxLength='4'></input><br/>
       <input ref="city" name="city" value={this.state.city} type='text' readOnly></input><br/>
       <input ref="tlf" placeholder="Type your phonenumber"></input><br/>
       <input ref="email" placeholder="Type your email"></input><br/>
       <input ref="username" placeholder="Type your username"></input><br/>
       <input ref="password1" placeholder="Type your password" type='password'></input><br/>
       <input ref="password2" placeholder="Type your password" type='password'></input><br/>
       <button ref="newUserButton">Register</button>
     </div>
   );
 }

 nextPath(path) {
   this.props.history.push(path);
 }

 componentDidMount () {
   this.refs.postalnumber.oninput = () => {
     if (this.refs.postalnumber.value.length < 4) {
       this.refs.city.value = "";
     }

     else {
       userService.getCity(this.refs.postalnumber.value, (result) => {
         if (result != undefined) {
           this.refs.city.value = result.Poststed;
         }
       });
     }
   }

   this.refs.newUserButton.onclick = () => {
     if(this.refs.password1.value != this.refs.password2.value) {
       console.log('The passwords must match');
     }

     else {
     userService.addUser(this.refs.fname.value, this.refs.lname.value, this.refs.city.value,
       this.refs.adress.value, Number(this.refs.postalnumber.value), Number(this.refs.tlf.value), this.refs.email.value, this.refs.username.value,
       this.refs.password1.value, (result) => {
         this.nextPath('/registered');
       });
     }
   }
 }
}

export class Registered extends React.Component {
  render() {
    return(
      <div>
        User is registered. <br />
        <Link to='/login'>Back to Login</Link>
      </div>
    );
  }
}

export class ForgotPassword extends React.Component {
  render() {
    return (
      <div>
        <Link to='/login'>Back to login</Link> <br/>
        <input ref="fpemail" placeholder="Type your email"></input><br/>
        <button ref="fpsubmit">Request</button>
      </div>
    );
  }

  nextPath(path) {
    this.props.history.push(path);
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
            this.nextPath('/passwordsent/' + email);
          });
        }
      });
    }
  }
}

export class PasswordSent extends React.Component {
  constructor(props) {
    super(props);

    this.mail = props.match.params.mail;
  }

  render() {
    return(
      <div>
        A new password has been sent to {this.mail} <br />
        <Link to='/login'>Back to login</Link>
      </div>
    );
  }
}

export function updateUserDetails() {
  userService.getUser(loggedin.id, (result) => {
    loggedin = result;
  });
}
