import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService, skillService } from './services';
import { loggedin, updateUserDetails } from './outlogged';
import { history } from './app';
import VirtualizedSelect from 'react-virtualized-select';

let selectedUser = {};
let refNr = 0;

export function deselectUser() {
  selectedUser = {};
}

export function checkOldSkills() {
  let today = new Date();

  skillService.checkOldSkills(today, (result) => {

  });
}

export class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.user = {};

    this.id = props.match.params.userId;

    this.allSkills = [];
    this.skillOptions = [];
    this.state = {};
    this.inputList = [];
    this.dateInputList = [];
    this.userSkills = [];
    this.refNr = 0;
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  render() {
    let activateBtn;
    let status;
    const { selectValue } = this.state;
    let skillOptions = [];
    let userSkillList = [];

    if (this.user.aktivert == true) {
      activateBtn = <button ref="activateBtn">Deaktiver</button>;
      status = "Aktiv";
    }

    else {
      activateBtn = <button ref="activateBtn">Aktiver</button>;
      status = "Deaktivert";
    }

    for (let skill of this.allSkills) {
      skillService.checkUserSkill(this.user.id, skill.skillid, (result) => {
        if (result == undefined) {
          skillOptions.push({ label: skill.skilltitle, value: skill.skillid },);
        }
      });
    }

    for (let skill of this.userSkills) {
      if (skill.validto === null) {
        userSkillList.push(<tr key={skill.skillid} ><td> { skill.skilltitle } </td><td>Varer evig</td></tr>);
      }

      else {
        this.date = this.fixDate(skill.validto);
        userSkillList.push(<tr key={skill.skillid} ><td> { skill.skilltitle } </td><td>{this.date}</td></tr>);
      }
    }

    return(
      <div>
        <div>
          <br />
          Name: {this.user.firstName + ' ' + this.user.lastName} <br />
          Phone: {this.user.phonenumber} <br />
          Email: {this.user.email} <br />
          Adress: {this.user.adress + ', ' + this.user.postalnumber + ' ' + this.city} <br />
          <br />
          Status: {status} <br />
          <Link to='/editprofile'><button ref='editUser'>Endre</button></Link>
          <button ref='newpassword'>Send nytt passord på mail</button>
          {activateBtn}
        </div>
        <div>
          <h4>Dine kurs og ferdigheter</h4> <br />
          <table>
            <tbody>
              {userSkillList}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Kurs og ferdigheter</h4> <br />
          <VirtualizedSelect
            autoFocus
            clearable={true}
            removeSelected={true}
            multi={true}
            options={skillOptions}
            onChange={(selectValue) => this.setState({ selectValue }, this.changeHandler( selectValue ))}
            value={selectValue}
          />
        </div>
        <div>
          <table>
            <tbody>
              {this.inputList}
            </tbody>
          </table>
          <table>
            <tbody>
              {this.dateInputList}
            </tbody>
          </table>
        </div>
        <button className='editBtn' onClick={() => this.registerSkills(selectValue)}>Registrer</button>
      </div>
    );
  }

  fixDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();

    let dateTime = day + '/' + month + '/' + year;
    return(dateTime);
  }

  changeHandler(selectValue) {
    this.inputList = [];
    this.dateInputList = [];
    let ref = 0;
    for (let skill of selectValue) {
      skillService.getSkillInfo(skill.value, (result) => {
        if (result.duration === 0) {
          this.inputList.push(<tr key={skill.value}><td> { skill.label } </td><td>Varer evig</td></tr>);
        }

        else if (result.duration != 0 && this.dateInputList.length > 0) {
          this.setState(selectValue.splice(-1, 1));
          alert('Registrer ' + this.selectedSkillWithDate + ' før du legger til flere kurs med utløpsdato.');
        }

        else {
          this.dateInputList.push(<tr key={skill.value}><td> { skill.label } </td><td><input type='date' ref={(ref) => this.refNr = ref} /></td></tr>);
          this.selectedSkillWithDate = skill.label;
        }
        this.forceUpdate();
      });
    }
  }

  registerSkills(selectValue) {
    if (this.refNr == null) {
      this.skillDate = null;
    }

    else {
      this.skillDate = this.refNr.value;
    }

    for (let skill of selectValue) {
      skillService.getSkillInfo(skill.value, (result) => {
        this.skill = result;
        if (this.skillDate == '') {
          alert('Vennligst velg en dato');
        }

        else if (this.skill.duration != 0 && this.skillDate != undefined) {
          skillService.addSkills(this.user.id, skill.value, this.skillDate, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.setState({selectValue: []});
              this.inputList = [];
              this.dateInputList = [];
              this.forceUpdate();
            });
          });
        }

        else {
          skillService.addSkills(this.user.id, skill.value, null, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.setState({selectValue: []});
              this.inputList = [];
              this.dateInputList = [];
              this.forceUpdate();
            });
          });
        }
      });
    }
  }

  componentDidMount() {
    if (this.id == loggedin.id) {
      this.nextPath('/myprofile/' + this.id);
    }
    userService.getUser(this.id, (result) => {
      this.user = result;
      selectedUser = result;
      userService.getCity(this.user.postalnumber, (result) => {
        this.city = result.poststed;
        skillService.getAllSkills((result) => {
          this.allSkills = result;
          skillService.getUserSkills(this.user.id, (result) => {
            this.userSkills = result;
            this.forceUpdate();
          });
        });
      });
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
        });
      }
    }
  }
}

export class MyProfile extends React.Component {
  constructor(props) {
    super(props);

    this.id = props.match.params.userId;

    this.user = {};
    this.allSkills = [];
    this.skillOptions = [];
    this.state = {};
    this.inputList = [];
    this.dateInputList = [];
    this.userSkills = [];
    this.userSkillList = [];
    this.refNr = 0;
  }

  render() {
    const { selectValue } = this.state;
    let skillOptions = [];
    let userSkillList = [];

    for (let skill of this.allSkills) {
      skillService.checkUserSkill(this.user.id, skill.skillid, (result) => {
        if (result == undefined) {
          skillOptions.push({ label: skill.skilltitle, value: skill.skillid },);
        }
      });
    }

    for (let skill of this.userSkills) {
      if (skill.validto === null) {
        userSkillList.push(
          <tr key={skill.skillid} >
          <td> { skill.skilltitle } </td>
          <td>Varer evig</td>
          <td><button onClick={() => skillService.deleteSkill(this.id, skill.skillid, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.forceUpdate();
            });
          })}>Slett</button></td></tr>);
      }

      else {
        this.date = this.fixDate(skill.validto);
        userSkillList.push(
          <tr key={skill.skillid} >
          <td> { skill.skilltitle } </td>
          <td>{this.date}</td>
          <td><button onClick={() => skillService.deleteSkill(this.id, skill.skillid, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.forceUpdate();
            });
          })}>Slett</button></td></tr>);
      }
    }

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
        <div>
          <h4>Dine kurs og ferdigheter</h4> <br />
          <table>
            <tbody>
              {userSkillList}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Kurs og ferdigheter</h4> <br />
          <VirtualizedSelect
            autoFocus
            clearable={true}
            removeSelected={true}
            multi={true}
            options={skillOptions}
            onChange={(selectValue) => this.setState({ selectValue }, this.changeHandler( selectValue ))}
            value={selectValue}
          />
        </div>
        <div>
          <table>
            <tbody>
              {this.inputList}
            </tbody>
          </table>
          <table>
            <tbody>
              {this.dateInputList}
            </tbody>
          </table>
        </div>
        <button className='editBtn' onClick={() => this.registerSkills(selectValue)}>Registrer</button>
      </div>
    );
  }

  fixDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let dateTime = day + '/' + month + '/' + year;
    return(dateTime);
  }

  changeHandler(selectValue) {
    this.inputList = [];
    this.dateInputList = [];
    let ref = 0;
    for (let skill of selectValue) {
      skillService.getSkillInfo(skill.value, (result) => {
        if (result.duration === 0) {
          this.inputList.push(<tr key={skill.value}><td> { skill.label } </td><td>Varer evig</td></tr>);
        }

        else if (result.duration != 0 && this.dateInputList.length > 0) {
          this.setState(selectValue.splice(-1, 1));
          alert('Registrer ' + this.selectedSkillWithDate + ' før du legger til flere kurs med utløpsdato.');
        }

        else {
          this.dateInputList.push(<tr key={skill.value}><td> { skill.label } </td><td><input type='date' ref={(ref) => this.refNr = ref} /></td></tr>);
          this.selectedSkillWithDate = skill.label;
        }
        this.forceUpdate();
      });
    }
  }

  registerSkills(selectValue) {
    if (this.refNr == null) {
      this.skillDate = null;
    }

    else {
      this.skillDate = this.refNr.value;
    }

    for (let skill of selectValue) {
      skillService.getSkillInfo(skill.value, (result) => {
        this.skill = result;
        if (this.skillDate == '') {
          alert('Vennligst velg en dato');

        }

        else if (this.skill.duration != 0 && this.skillDate != undefined) {
          skillService.addSkills(this.user.id, skill.value, this.skillDate, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.setState({selectValue: []});
              this.inputList = [];
              this.dateInputList = [];
              this.forceUpdate();
            });
          });
        }

        else {
          skillService.addSkills(this.user.id, skill.value, null, (result) => {
            skillService.getUserSkills(this.user.id, (result) => {
              this.userSkills = result;
              this.setState({selectValue: []});
              this.inputList = [];
              this.dateInputList = [];
              this.forceUpdate();
            });
          });
        }
      });
    }
  }

  componentDidMount() {
    userService.getUser(this.id, (result) => {
      this.user = result;
      selectedUser = result;
      userService.getCity(this.user.postalnumber, (result) => {
        this.city = result.poststed;
        skillService.getAllSkills((result) => {
          this.allSkills = result;
          skillService.getUserSkills(this.user.id, (result) => {
            this.userSkills = result;
            this.forceUpdate();
          });
        });
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

  changeHandler(fieldName) {
        return function (event) {
            this.setState({[fieldName]: event.target.value});
        }
  }

  render() {
    return(
      <div>
        <input name='firstName' ref='firstName' value={this.state.firstName} onChange={this.changeHandler('firstName').bind(this)} />
        <input name='lastName' ref='lastName' value={this.state.lastName} onChange={this.changeHandler('lastName').bind(this)} />
        <br />
        <input name='phonenumber' ref='phonenumber' value={this.state.phonenumber} onChange={this.changeHandler('phonenumber').bind(this)} />
        <input name='email' ref='email' value={this.state.email} onChange={this.changeHandler('email').bind(this)} />
        <br />
        <input name='adress' ref='adress' value={this.state.adress} onChange={this.changeHandler('adress').bind(this)} />
        <input name='postalnumber' ref='postalnumber' maxLength='4' value={this.state.postalnumber} onChange={this.changeHandler('postalnumber').bind(this)} />
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
