import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { renderLogin, renderAdminLogin } from './app';
import crypto from 'crypto';

crypto.DEFAULT_ENCODING = 'hex';

let loggedin = {};

export { loggedin };

export function deselectUser() {
  loggedin = {};
}

export class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className='centeredDiv'>
          <div className='loginDiv'>
            <h3>Login</h3> <br /> <br /> <br /> <br /> <br /> <br />
            <input ref='username' className='loginInput' type='text' placeholder='Brukernavn' /> <br />
            <input ref='password' className='loginInput' type='password' placeholder='Passord' /> <br />
            <button ref='login' className='submitBtn'>Logg inn</button>
            <div className='forgotPasswordLinkDiv'>
              <Link to='/forgotpassword' className='forgotPasswordLink'>Glemt passord?</Link>
            </div>
          </div>
        </div>
    );
  }

  componentDidMount () {
    this.refs.login.onclick = () => {
      crypto.pbkdf2(this.refs.password.value, 'RødeKors', 100, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;

        this.password = derivedKey;


        userService.login(this.refs.username.value, this.password, (result) => {
          if (result == undefined) {
            alert("Feil brukernavn eller passord");
          }
          else {
            loggedin = result;

            if (result.admin == true) {
              renderAdminLogin(result.id);
            }

            else {
              if (result.aktivert == false) {
                alert('Brukeren din er ikke godkjent av administrator enda.');
              }

              else {
                renderLogin(result.id);
              }
            }
          }
        });
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

    this.password = '';
  }

  render() {
   return (
     <div className='centeredDiv'>
      <div className='registrationDiv'>
        <h3>Registrering</h3>
        <input ref="fname" className='regInput, regFirstName' placeholder="Fornavn"></input>
        <input ref="lname" className='regLastName' placeholder="Etternavn"></input><br/>
        <input ref="adress" placeholder="Gateadresse"></input><br/>
        <input ref="postalnumber" className='regPostal' placeholder="Postnummer" maxLength='4'></input>
        <input ref="city" name="city" className='regCity' placeholder='Poststed' value={this.state.city} type='text' readOnly></input><br/>
        <input ref="tlf" placeholder="Telefon"></input><br/>
        <input ref="email" placeholder="Email"></input><br/>
        <input ref="username" placeholder="Brukernavn"></input><br/>
        <input ref="password1" placeholder="Passord" type='password'></input><br/>
        <input ref="password2" placeholder="Bekreft passord" type='password'></input><br/>
        <button ref="newUserButton" className='submitBtn'>Registrer</button>
      </div>
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
           this.refs.city.value = result.poststed;
         }

         else {
           this.refs.city.value = 'IKKE GYLDIG POSTNUMMER';
         }
       });
     }
   }

   this.refs.newUserButton.onclick = () => {
     if(this.refs.password1.value != this.refs.password2.value) {
       console.log('The passwords must match');
     }

     else {
       crypto.pbkdf2(this.refs.password1.value, 'RødeKors', 100, 64, 'sha512', (err, derivedKey) => {
         if (err) throw err;

         this.password = derivedKey;

         userService.addUser(this.refs.fname.value, this.refs.lname.value, this.refs.city.value,
           this.refs.adress.value, Number(this.refs.postalnumber.value), Number(this.refs.tlf.value), this.refs.email.value, this.refs.username.value,
           this.password, (result) => {
             this.nextPath('/registered');
         });
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
      <div className='centeredDiv'>
        <div ref='newPassword' className='loginDiv'>
          <div className='loginLogo'>
          LOGO
          </div>
          <div ref='resetContent'>
            <input ref="fpemail" placeholder="Type your email"></input><br/>
            <button ref="fpsubmit">Request</button> <br />
            <Link to='/login'>Back to login</Link>
          </div>
        </div>
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
          alert('Ingen brukere med denne epostadressen');
        }
        else {
          userService.resetPassword(result.email, result.username, (result, subject, text, email) => {
            this.refs.resetContent.textContent = 'Nytt passord er sendt.'
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
