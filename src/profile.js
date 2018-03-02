import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { loggedin, updateUserDetails } from './outlogged';
import { history } from './app';

let profileUser = {};

export class Profile extends React.Component {
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

export class EditProfile extends React.Component {
constructor() {
    super();

    this.user = loggedin;

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
      userService.editProfile(loggedin.id, this.refs.firstName.value, this.refs.lastName.value,
                              Number(this.refs.phonenumber.value),
                              this.refs.email.value, this.refs.adress.value, Number(this.refs.postalnumber.value),
                              this.refs.city.value, (result) => {
        userService.getUser(loggedin.id, (result) => {
          updateUserDetails();
          history.push('/profile/' + loggedin.id);
        });
      });
    }
  }
}
