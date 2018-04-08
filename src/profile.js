import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { loggedin, updateUserDetails } from './outlogged';
import { history } from './app';

let selectedUser = {};

export function deselectUser() {
  selectedUser = {};
}

export class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  render() {
    let activateBtn;
    let status;

    if (this.user.aktivert == true) {
      activateBtn = <button ref="activateBtn">Deaktiver</button>;
      status = "Aktiv";
    }

    else {
      activateBtn = <button ref="activateBtn">Aktiver</button>;
      status = "Deaktivert";
    }

    return(
      <div>
        <div>
          <br />
          Name: {this.user.firstName + ' ' + this.user.lastName} <br />
          Phone: {this.user.phonenumber} <br />
          Email: {this.user.email} <br />
          Adress: {this.user.adress + ', ' + this.user.postalnumber + ' ' + this.user.city} <br />
          <br />
          Status: {status} <br />
          <Link to='/editprofile'><button ref='editUser'>Endre</button></Link>
          <button ref='newpassword'>Send nytt passord på mail</button>
          {activateBtn}
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.id == loggedin.id) {
      this.nextPath('/myprofile/' + this.id);
    }
    userService.getUser(this.id, (result) => {
      this.user = result;
      selectedUser = result;
      this.forceUpdate();
    });

    this.refs.newpassword.onclick = () => {
      userService.resetPassword(selectedUser.email, selectedUser.username, (result) => {
        alert('Passord sendt til ' + selectedUser.email);
      });
    }

    this.refs.activateBtn.onclick = () => {
      if (this.user.aktivert == true) {
        userService.deactivate(this.user.id, (result) => {
          this.nextPath('/userlistadmin');
        });
      }

      else {
        userService.confirm(this.user.id, (result) => {
          this.nextPath('/userlistadmin');
        })
      }
    }
  }
}

export class MyProfile extends React.Component {
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
          <table>
            <tbody>
              <tr>
                <td>Name:</td>
                <td>{this.user.firstName} {this.user.lastName}</td>
              </tr>
              <tr>
                <td>Telefon:</td>
                <td>{this.user.phonenumber}</td>
              </tr>
              <tr>
                <td>Epost:</td>
                <td>{this.user.email}</td>
              </tr>
              <tr>
                <td>Gateadresse:</td>
                <td>{this.user.adress}</td>
              </tr>
              <tr>
                <td>Poststed:</td>
                <td>{this.user.postalnumber} {this.city}</td>
              </tr>
            </tbody>
          </table>
          <br />
          <Link to='/editprofile'><button ref='editUser' className='editBtn'>Endre detaljer</button></Link>
          <Link to='/changepassword'><button ref='changePassword' className='editBtn'>Bytt passord</button></Link>
        </div>

      </div>
    );
  }

  componentDidMount() {
    userService.getUser(this.id, (result) => {
      this.user = result;
      selectedUser = result;
      userService.getCity(this.user.postalnumber, (result) => {
        this.city = result.poststed;
        this.forceUpdate();
      });
    });
  }
}

export class EditProfile extends React.Component {
constructor() {
    super();

    this.user = selectedUser;

    this.state = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      phonenumber: this.user.phonenumber,
      email: this.user.email,
      adress: this.user.adress,
      postalnumber: this.user.postalnumber,
    };
  }

  nextPath(path) {
    this.props.history.push(path);
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
        <input name='postalnumber' ref='postalnumber' maxLength='4' value={this.state.postalnumber} onChange={this.onFieldChange('postalnumber').bind(this)} />
        <br />
        <button ref='editUserBtn'>Confirm</button>
      </div>
    );
  }

  componentDidMount() {
    userService.getUser(loggedin.id, (result) => {
      this.user = result;
      this.forceUpdate();
    });

    this.refs.postalnumber.oninput = () => {
      userService.getCity(this.refs.postalnumber.value, (result) => {
        if (result != undefined) {
          this.city = result.poststed;
        }
      });
    }

    this.refs.editUserBtn.onclick = () => {
      userService.editProfile(selectedUser.id, this.refs.firstName.value, this.refs.lastName.value,
                              Number(this.refs.phonenumber.value),
                              this.refs.email.value, this.refs.adress.value, Number(this.refs.postalnumber.value),
                              (result) => {
        userService.getUser(selectedUser.id, (result) => {
          updateUserDetails();
          this.nextPath('/profile/' + selectedUser.id);
        });
      });
    }
  }
}
