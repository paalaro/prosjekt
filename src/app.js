import React from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';
import { mailService } from './mail';
import { styles } from './styles';
import { Redirect } from 'react-router';

let view = 'login';

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

class Login extends React.Component {
  render() {
    return (
      <div>
        <input ref="username" placeholder="Type your username"></input><br/>
        <input ref="password" placeholder="Type your password" type="password"></input><br/>
        <button ref="login">Login</button> <br/>
        <Link to='/forgotpassword'>Forgot password</Link> <br/>
        // <Link to={'/loggedin/' + 27}>Logged In</Link>
      </div>
    );
  }

  componentDidMount () {
    this.refs.login.onclick = () => {
      userService.login(this.refs.username.value, this.refs.password.value, (result) => {
        console.log('Logged in as ' + result.firstName + ' ' + result.lastName);

        // this.props.history.push('/loggedin/' + result.id);
        // <Redirect from='/login' to='/loggedin' />
        <Redirect push to={'/loggedin/' + result.id} />

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

     }
     userService.addUser(this.refs.fname.value, this.refs.lname.value, this.refs.city.value,
       this.refs.adress.value, Number(this.refs.post.value), Number(this.refs.tlf.value), this.refs.email.value, this.refs.username.value,
       this.refs.password1.value, (result) => {

       });
   }
 }
}

class ForgotPassword extends React.Component {
  render() {
    return (
      <div>
        <Link to='/login'>Back to login</Link> <br/>
        <input ref="fpusername" placeholder="Type your username"></input><br/>
        <input ref="fpemail" placeholder="Type your email"></input><br/>
        <button ref="fpsubmit">Request</button>
      </div>
    );
  }

  componentDidMount() {
    this.refs.fpsubmit.onclick = () => {
      userService.resetPassword(this.refs.fpusername.value, this.refs.fpemail.value, (result, subject, text, email) => {
        mailService.sendMail(email, subject, text);
      });
    }
  }
}

class LoggedIn extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;
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
          <Route exact path='/loggedin/:userId' component={LoggedIn} />

        </Switch>
      </div>
    </HashRouter>
  ), document.getElementById('root'));


// else if(view === 'loggedin') {
//   ReactDOM.render((
//     <HashRouter>
//       <div>
//         <LoggedIn />
//         <Switch>
//           <Route exact path='/loggedin/:userId' component={LoggedIn} />
//         </Switch>
//       </div>
//     </HashRouter>
//   ))
//
// }
