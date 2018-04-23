import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services/userservice';
import { eventService } from './services/eventservice';
import { skillService } from './services/skillservice';
import { renderLogin, renderAdminLogin } from './app';
import crypto from 'crypto';

crypto.DEFAULT_ENCODING = 'hex';

let loggedin = {};

export { loggedin };

export function deselectUser() {
  loggedin = {};
}

export function selectUser(user) {
  loggedin = user;
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
            <div style={{color: 'red'}} ref='alertDiv' />
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
      this.refs.alertDiv.textContent = '';

      // VALIDERING
      if (this.refs.username.value == '' || this.refs.password.value == '') {
        this.refs.alertDiv.textContent = 'Fyll inn brukernavn og passord';
      }

      else {
        crypto.pbkdf2(this.refs.password.value, 'RødeKors', 100, 64, 'sha512', (err, derivedKey) => { // Krypterer valuen i passord-input slik at den kan sammenlignes med databasen
          if (err) throw err;

          this.password = derivedKey;


          userService.login(this.refs.username.value, this.password, (result) => {
            if (result == undefined) {
              this.refs.alertDiv.textContent = "Feil brukernavn eller passord";
            }
            else {
              loggedin = result;
              localStorage.setItem('loggedinUser', JSON.stringify(result));  // Lagrer brukeren som logger inn i localStorage
              localStorage.setItem('edituser', JSON.stringify(result));

              if (result.admin == true) { // Kjører de forskjellige ReactDOM.render ettersom om brukeren er admin eller ikke
                renderAdminLogin(result.id);
              }

              else {
                if (result.aktivert == false) { // Feil dersom brukeren ikke er godkjent av admin enda
                  this.refs.alertDiv.textContent = 'Brukeren din er ikke godkjent av administrator enda';
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
}

export class Registration extends React.Component {
  constructor() {
    super();

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
        <input ref="city" name="city" className='regCity' placeholder='Poststed' type='text' readOnly></input><br/>
        <input ref="tlf" placeholder="Telefon"></input><br/>
        <input ref="email" placeholder="Email"></input><br/>
        <input ref="username" placeholder="Brukernavn"></input><br/>
        <input ref="password1" placeholder="Passord" type='password'></input><br/>
        <input ref="password2" placeholder="Bekreft passord" type='password'></input><br/>
        <button ref="newUserButton" className='submitBtn'>Registrer</button>
        <div style={{color: 'red'}}ref="alertDiv"></div>
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
      this.refs.alertDiv.textContent = '';

      // VALIDERING
      if (this.refs.fname.value == '' || this.refs.lname.value == '' || this.refs.adress.value == '' || this.refs.postalnumber.value == '' ||
      this.refs.email.value == '' || this.refs.username.value == '' || this.refs.password1.value == '' || this.refs.password2.value == '') {
        this.refs.alertDiv.textContent = 'Vennligst fyll ut alle feltene';
      }

      else if (this.refs.tlf.value.length != 8) {
        this.refs.alertDiv.textContent = 'Telefonnummer må bestå av 8 siffer';
      }

      else if(this.refs.password1.value != this.refs.password2.value) {
        this.refs.alertDiv.textContent = 'Passordene er ikke like';
      }

      else {
        userService.getUserbyMail(this.refs.email.value, (result) => {
          if (result != undefined) {
            this.refs.alertDiv.textContent = 'Det finnes allerede en bruker med denne epostadressen';
          }

          else {
            userService.getUserbyUsername(this.refs.username.value, (result) => {
              if (result != undefined) {
                this.refs.alertDiv.textContent = 'Det finnes allerede en bruker med dette brukernavnet';
              }

              else {
                crypto.pbkdf2(this.refs.password1.value, 'RødeKors', 100, 64, 'sha512', (err, derivedKey) => { // Krypterer passord, og registrerer deretter bruker
                  if (err) throw err;

                  this.password = derivedKey;

                  userService.addUser(this.refs.fname.value, this.refs.lname.value,
                    this.refs.adress.value, Number(this.refs.postalnumber.value), Number(this.refs.tlf.value), this.refs.email.value, this.refs.username.value,
                    this.password, (result) => {
                      this.nextPath('/registered');
                    });
                  });
              }
            });

          }
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
          userService.resetPassword(result.email, result.username, (result) => {
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
