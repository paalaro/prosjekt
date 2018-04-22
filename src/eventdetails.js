import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { eventService, userService, skillService } from './services';
import { mailService } from './mail';
import { loggedin } from './outlogged';
import BigCalendar from 'react-big-calendar'
import moment from 'moment';
import VirtualizedSelect from 'react-virtualized-select';


export class EventDetails extends React.Component {
  constructor(props) {
    super(props);

    this.user = userService.getSignedInUser();
    this.evnt = {};
    this.rolle = {};
    this.eventRoller = [];
    this.eventRollernoUser = [];
    this.roleCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.allUsers = [];
    this.interestedUsers = [];
    this.capableUsers = [];
    this.usedUsers = [];
    this.usedEventRoles = [];
    this.emailRecievers = [];
    this.contactPerson = {};
    this.contactPhone = {};

    this.id = props.match.params.eventId;
  }

  render() {
    let rolleList = [];
    let rolleListHeader;
    let rolleBtn;
    let editBtn;
    let interestBtn;
    let interessert;
    let fordelRollerBtn;
    let emptyRolesBtn;

    if (this.interest == undefined) {
      interestBtn = <button onClick={() =>
        eventService.setInterest(this.evnt.eventid, this.user.id, (result) => {
          eventService.getInterest(this.evnt.eventid, this.user.id, (result) => {
            this.interest = result;
            this.forceUpdate();
          });
        })}>Meld interesse</button>;
    }

    else {
      interestBtn = <button onClick={() =>
        eventService.removeInterest(this.evnt.eventid, this.user.id, (result) => {
          eventService.getInterest(this.evnt.eventid, this.user.id, (result) => {
            this.interest = result;
            this.forceUpdate();
          });
        })}>Fjern interesse</button>;
    }

    if (this.interest != undefined) {
      interessert = 'Du er interessert i dette arrangementet';
    }


    for (let rolle of this.eventRollernoUser) {
      rolleList.push(<tr key={ rolle.event_rolle_id } ><td> { rolle.rollenavn } </td><td> LEDIG </td></tr>);
    }

    if (this.user.admin == true) {
      rolleBtn = <button onClick={() => this.props.history.push('/roles/' + this.evnt.eventid)}>Roller</button>;
      editBtn = <button onClick={() => this.props.history.push('/editevent')}>Endre detaljer</button>;
      if (this.eventRollernoUser.length != 0) {
        fordelRollerBtn = <button onClick={() => this.giveRoles()}>Fordel roller</button>;
      }

      if (this.eventRoller[0] != undefined) {
        emptyRolesBtn = <button onClick={() =>
          eventService.emptyEventRoles(this.evnt.eventid, (result) => {
            userService.deleteAllEventPassiv(this.evnt.start, this.evnt.end, (result) => {
              eventService.getEventRoller(this.evnt.eventid, (result) => {
                this.eventRoller = result;
                eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                  this.eventRollernoUser = result;
                  this.forceUpdate();
                });
              });
            });
          })}>Tøm roller</button>;
      }


      for (let rolle of this.eventRoller) {
        if (rolle.confirmed == true) {
          if (rolle.userid == this.user.id) {
            rolleList.push(<tr key={ rolle.event_rolle_id} >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> {rolle.timecalled.toLocaleString().slice(0, -3) }</td>
              <td>{ rolle.timeconfirmed.toLocaleString().slice(0, -3) }</td>
              <td><button onClick={() => this.goToRoleChange(rolle)}>Bytt vakt</button></td></tr>);
          }

          else {
            rolleList.push(<tr key={ rolle.event_rolle_id} >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> {rolle.timecalled.toLocaleString().slice(0, -3) }</td>
              <td>{ rolle.timeconfirmed.toLocaleString().slice(0, -3) }</td>
              </tr>);
          }
        }

        else {
          if (rolle.userid == this.user.id) {
            rolleList.push(<tr key={ rolle.event_rolle_id } >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> { rolle.timecalled.toLocaleString().slice(0, -3) } </td>
              <td>Ikke godkjent</td>
              <td><button onClick={() => this.goToRoleChange(rolle)}>Bytt vakt</button></td></tr>);
          }

          else {
            rolleList.push(<tr key={ rolle.event_rolle_id } >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> { rolle.timecalled.toLocaleString().slice(0, -3) } </td>
              <td>Ikke godkjent</td>
              </tr>);
          }
        }
      }
    }

    else {
      for (let rolle of this.eventRoller) {
        if (rolle.confirmed == true) {
          if (rolle.userid == this.user.id) {
            rolleList.push(<tr key={ rolle.event_rolle_id} >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> { rolle.timecalled.toLocaleString().slice(0, -3) }</td>
              <td>{ rolle.timeconfirmed.toLocaleString().slice(0, -3) }</td>
              <td><button onClick={() => this.goToRoleChange(rolle)}>Bytt vakt</button></td></tr>);
          }

          else {
            rolleList.push(<tr key={ rolle.event_rolle_id} >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              </tr>);
          }
        }

        else {
          if (rolle.userid == this.user.id) {
            rolleList.push(<tr key={ rolle.event_rolle_id } >
              <td> { rolle.rollenavn } </td>
              <td> { rolle.firstName } {rolle.lastName}</td>
              <td> { rolle.timecalled.toLocaleString().slice(0, -3) } </td>
              <td>Ikke godkjent</td>
              <td><button onClick={() => this.goToRoleChange(rolle)}>Bytt vakt</button></td></tr>);
          }

          else {
            rolleList.push(<tr key={ rolle.event_rolle_id } >
              <td> { rolle.rollenavn } </td>
              <td>
              Venter på godkjenning
              </td>
              </tr>);
          }
        }
      }
    }



    if (this.eventRoller.length > 0) {
      rolleListHeader = <tr><th>Rolle</th><th>Status</th><th>Tildelt</th><th>Godkjent</th></tr>;
    }

    else if (this.eventRoller.length == 0 && this.eventRollernoUser.length > 0) {
      rolleListHeader = <tr><th>Rolle</th><th>Status</th></tr>;
    }

    if (this.evnt.start != undefined) {
      if (this.evnt.oppmote == null) {
        this.oppmote = this.evnt.start.toLocaleTimeString().slice(0, -3);
      }

      else {
        this.oppmote = this.evnt.oppmote.slice(0, -3);
      }
    }

    let loggedinUser = userService.getSignedInUser();

    return(
      <div>
        <div>
          <h3>{this.evnt.title}</h3> <br />
          Start: {this.start} <br />
          Slutt: {this.end} <br />
          Oppmøtetidspunkt: {this.oppmote} <br />
          Bekrivelse: {this.evnt.text} <br />
          Adresse: {this.evnt.adress}, {this.evnt.postalnumber} {this.city} <br />
          Utstyr: {this.evnt.equipment} <br />
          <br />
          Kontaktperson: {this.evnt.contact}, {this.evnt.phone} <br /> <br />
          {interessert} <br />
        </div>
        {editBtn}
        {interestBtn}
        {fordelRollerBtn}
        <div ref='fordelRollerDiv'></div>
        <div>
          <h4>Roller til dette arrangementet</h4>
          <table>
            <thead>
              {rolleListHeader}
            </thead>
            <tbody>
              {rolleList}
            </tbody>
          </table>
        </div>
        {rolleBtn}
        {emptyRolesBtn}
      </div>
    );
  }

  goToRoleChange(rolle) {
    localStorage.setItem('rollebytte', JSON.stringify(rolle));
    this.props.history.push('/changerole/' + rolle.userid)
  }

  giveRoles() {
    this.refs.fordelRollerDiv.textContent = 'Roller fordeles';
    let stop = false;
    let usedUserids = [];
    let usedEventRoleids = [];
    let interestedUsersNotUsed = [];
    this.capableUsers = [];
    let userPassiv = [];
    this.emailRecievers = [];
    let roleRequirement;

    eventService.getUsedUsers(this.evnt.eventid, (result) => {
      for (let id of result) {
        usedUserids.push(id.userid);
      }

      eventService.getUsedEventRoles(this.evnt.eventid, (result) => {
        for (let id of result) {
          usedEventRoleids.push(id.event_rolle_id);
        }

        eventService.getInterestedUsers(this.evnt.eventid, (result) => {
          this.interestedUsers = result;
          for (let id of this.interestedUsers) {
            let includes = usedUserids.includes(id.id);

            if (includes == false) {
              interestedUsersNotUsed.push(id);
            }
          }

          if (interestedUsersNotUsed.length != 0) {
            eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
              this.eventRollernoUser = result;
              skillService.countRoleReq((result) => {
                this.roleReq = result;
                if (this.interestedUsers != undefined) {
                  for (let user of interestedUsersNotUsed) {
                    userService.getPassiv(user.userid, (result) => {
                      userPassiv = result;
                      let passiv = false;
                      let eventStart = this.evnt.start;
                      let eventEnd = this.evnt.end;

                      for (let i = 0; i < userPassiv.length; i++) {
                        let startPassive = userPassiv[i].passivstart;
                        let endPassive = userPassiv[i].passivend;

                        if (startPassive <= eventEnd && endPassive >= eventStart) {
                          passiv = true;
                        }
                      }

                      if (user == interestedUsersNotUsed[interestedUsersNotUsed.length - 1]) {
                        for (let eventRolle of this.eventRollernoUser) {
                          if (passiv == true) {
                            eventService.getEventRoller(this.evnt.eventid, (result) => {
                              this.eventRoller = result;
                              eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                this.eventRollernoUser = result;
                                if (this.eventRollernoUser.length != 0 && eventRolle.event_rolle_id == this.eventRollernoUser[this.eventRollernoUser.length - 1].event_rolle_id) {
                                  stop = true;
                                  this.giveRolesToNotInterested();
                                }

                                else if (this.eventRollernoUser.length == 0) {
                                  this.refs.fordelRollerDiv.textContent = '';
                                  this.forceUpdate();
                                }
                              });
                            });
                          }

                          else {
                          eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.userid, this.evnt.end, (result) => {
                            let numberOfSkills = result.antall;
                            if (this.roleReq[eventRolle.rolleid - 1] != undefined) {
                              roleRequirement = this.roleReq[eventRolle.rolleid - 1].antallskills;
                            }

                            else {
                              roleRequirement = 0;
                            }

                            if (numberOfSkills != undefined && numberOfSkills == roleRequirement) {
                              this.capableUsers.push({userid: user.userid, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id, passivStart: user.passivstart, passivEnd: user.passivEnd});
                              for (let i = 0; i < this.capableUsers.length; i++) {
                                let exists = usedUserids.includes(this.capableUsers[i].userid);
                                let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);

                                if (exists == false && hasUser == false) {
                                  usedUserids.push(this.capableUsers[i].userid);
                                  usedEventRoleids.push(this.capableUsers[i].eventrolleid);
                                  this.emailRecievers.push(this.capableUsers[i].userid);

                                  eventService.setRole(this.capableUsers[i].userid, this.capableUsers[i].eventrolleid, this.evnt.start, this.evnt.end, (result) => {
                                      eventService.getEventRoller(this.evnt.eventid, (result) => {
                                        this.eventRoller = result;
                                        eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                          this.eventRollernoUser = result;
                                          if (this.eventRollernoUser.length != 0 && eventRolle.event_rolle_id == this.eventRollernoUser[this.eventRollernoUser.length - 1].event_rolle_id && stop == false) {
                                            stop = true;
                                            this.giveRolesToNotInterested();
                                          }

                                          else if (this.eventRollernoUser.length == 0) {
                                            this.forceUpdate();
                                            this.refs.fordelRollerDiv.textContent = '';
                                            if (stop == false) {
                                              this.sendMail(this.emailRecievers);
                                              stop = true;
                                            }
                                          }
                                        });
                                      });
                                  });
                                }

                                else {
                                  eventService.getEventRoller(this.evnt.eventid, (result) => {
                                    this.eventRoller = result;
                                    eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                      this.eventRollernoUser = result;
                                      if (this.eventRollernoUser.length != 0 && eventRolle.event_rolle_id == this.eventRollernoUser[this.eventRollernoUser.length - 1].event_rolle_id && stop == false) {
                                        stop = true;
                                        this.giveRolesToNotInterested();
                                      }

                                      else if (this.eventRollernoUser.length == 0) {
                                        this.refs.fordelRollerDiv.textContent = '';
                                        if (stop == false) {
                                          this.sendMail(this.emailRecievers);
                                          this.forceUpdate();
                                          stop = true;
                                        }
                                      }
                                    });
                                  });
                                }
                              }
                            }

                            else {
                              eventService.getEventRoller(this.evnt.eventid, (result) => {
                                this.eventRoller = result;
                                eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                  this.eventRollernoUser = result;
                                  if (this.eventRollernoUser.length != 0 && eventRolle.event_rolle_id == this.eventRollernoUser[this.eventRollernoUser.length - 1].event_rolle_id && stop == false) {
                                    stop = true;
                                    this.giveRolesToNotInterested();
                                  }

                                  else if (this.eventRollernoUser.length == 0){
                                    this.refs.fordelRollerDiv.textContent = '';
                                    if (stop == false) {
                                      this.sendMail(this.emailRecievers);
                                      this.forceUpdate();
                                      stop = true;
                                    }
                                  }
                                });
                              });
                            }
                          });
                          }
                        }
                      }


                      else if (passiv == false && user != interestedUsersNotUsed[interestedUsersNotUsed.length - 1]) {
                        for (let eventRolle of this.eventRollernoUser) {
                          eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.userid, this.evnt.end, (result) => {
                            let numberOfSkills = result.antall;
                            if (this.roleReq[eventRolle.rolleid - 1] != undefined) {
                              roleRequirement = this.roleReq[eventRolle.rolleid - 1].antallskills;
                            }

                            else {
                              roleRequirement = 0;
                            }

                            if (numberOfSkills != undefined && numberOfSkills == roleRequirement) {
                              this.capableUsers.push({userid: user.userid, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id});

                              for (let i = 0; i < this.capableUsers.length; i++) {
                                let exists = usedUserids.includes(this.capableUsers[i].userid);
                                let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);

                                if (exists == false && hasUser == false) {
                                  usedUserids.push(this.capableUsers[i].userid);
                                  usedEventRoleids.push(this.capableUsers[i].eventrolleid);
                                  this.emailRecievers.push(this.capableUsers[i].userid);

                                  eventService.setRole(this.capableUsers[i].userid, this.capableUsers[i].eventrolleid, this.evnt.start, this.evnt.end, (result) => {

                                  });
                                }
                              }
                            }
                          })
                        }
                      }
                    });
                  }
                }
              });
            });
          }

          else {
            this.giveRolesToNotInterested();
          }
        });
      });
    });
  }

  giveRolesToNotInterested() {
    this.refs.fordelRollerDiv.textContent = 'Roller fordeles, snart ferdig';
    let usedUserids = [];
    let usedEventRoleids = [];
    let usersNotUsed = [];
    this.capableUsers = [];
    let userPassiv = [];
    let stop = false;
    let roleRequirement;

    eventService.getUsedUsers(this.evnt.eventid, (result) => {
      for (let id of result) {
        usedUserids.push(id.userid);
      }

      eventService.getUsedEventRoles(this.evnt.eventid, (result) => {
        for (let id of result) {
          usedEventRoleids.push(id.event_rolle_id);
        }

        eventService.getAllUsersByVaktpoeng((result) => {
          this.sortedUsers = result;
          for (let id of this.sortedUsers) {
            let includes = usedUserids.includes(id.id);

            if (includes == false) {
              usersNotUsed.push(id);
            }
          }

          eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
            this.eventRollernoUser = result;
            skillService.countRoleReq((result) => {
              this.roleReq = result;
              if (this.sortedUsers != undefined) {
                for (let user of usersNotUsed) {
                  userService.getPassiv(user.userid, (result) => {
                    userPassiv = result;
                    let passiv = false;
                    for (let i = 0; i < userPassiv.length; i++) {

                      let startPassive = userPassiv[i].passivstart.toLocaleDateString();
                      let endPassive = userPassiv[i].passivend.toLocaleDateString();
                      let eventStart = this.evnt.start.toLocaleDateString();
                      let eventEnd = this.evnt.end.toLocaleDateString();

                      if ((startPassive >= eventStart && startPassive <= eventEnd) || (endPassive >= eventStart && endPassive <= eventEnd)) {
                        passiv = true;
                      }
                    }

                    if (passiv == false && user == usersNotUsed[usersNotUsed.length - 1]) {

                      for (let eventRolle of this.eventRollernoUser) {
                        eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.id, this.evnt.end, (result) => {
                          let numberOfSkills = result.antall;
                          if (this.roleReq[eventRolle.rolleid - 1] != undefined) {
                            roleRequirement = this.roleReq[eventRolle.rolleid - 1].antallskills;
                          }

                          else {
                            roleRequirement = 0;
                          }

                          if (numberOfSkills != undefined && numberOfSkills == roleRequirement) {
                            this.capableUsers.push({userid: user.id, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id, passivStart: user.passivstart, passivEnd: user.passivEnd});
                            for (let i = 0; i < this.capableUsers.length; i++) {
                              let exists = usedUserids.includes(this.capableUsers[i].userid);
                              let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);


                              if (exists == false && hasUser == false) {
                                usedUserids.push(this.capableUsers[i].userid);
                                usedEventRoleids.push(this.capableUsers[i].eventrolleid);
                                this.emailRecievers.push(this.capableUsers[i].userid);

                                eventService.setRole(this.capableUsers[i].userid, this.capableUsers[i].eventrolleid, this.evnt.start, this.evnt.end, (result) => {
                                  eventService.getEventRoller(this.evnt.eventid, (result) => {
                                    this.eventRoller = result;
                                    eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                      this.eventRollernoUser = result;
                                      this.refs.fordelRollerDiv.textContent = '';
                                      if (stop == false) {
                                        this.sendMail(this.emailRecievers);
                                        this.forceUpdate();
                                        stop = true;
                                      }
                                    });
                                  });
                                });
                              }

                              else {
                                eventService.getEventRoller(this.evnt.eventid, (result) => {
                                  this.eventRoller = result;
                                  eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                    this.eventRollernoUser = result;
                                    this.refs.fordelRollerDiv.textContent = '';
                                    if (stop == false) {
                                      this.sendMail(this.emailRecievers);
                                      this.forceUpdate();
                                      stop = true;
                                    }
                                  });
                                });
                              }
                            }
                          }

                          else {
                            eventService.getEventRoller(this.evnt.eventid, (result) => {
                              this.eventRoller = result;
                              eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                this.eventRollernoUser = result;
                                this.refs.fordelRollerDiv.textContent = '';
                                if (stop == false) {
                                  this.sendMail(this.emailRecievers);
                                  this.forceUpdate();
                                  stop = true;
                                }
                              });
                            });
                          }
                        });
                      }
                    }


                    else if (passiv == false && user != usersNotUsed[usersNotUsed.length - 1]) {
                      for (let eventRolle of this.eventRollernoUser) {
                        eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.id, this.evnt.end, (result) => {
                          let numberOfSkills = result.antall;
                          if (this.roleReq[eventRolle.rolleid - 1] != undefined) {
                            roleRequirement = this.roleReq[eventRolle.rolleid - 1].antallskills;
                          }

                          else {
                            roleRequirement = 0;
                          }

                          if (numberOfSkills != undefined && numberOfSkills == roleRequirement) {
                            this.capableUsers.push({userid: user.id, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id});

                            for (let i = 0; i < this.capableUsers.length; i++) {
                              let exists = usedUserids.includes(this.capableUsers[i].userid);
                              let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);

                              if (exists == false && hasUser == false) {
                                usedUserids.push(this.capableUsers[i].userid);
                                usedEventRoleids.push(this.capableUsers[i].eventrolleid);
                                this.emailRecievers.push(this.capableUsers[i].userid);

                                eventService.setRole(this.capableUsers[i].userid, this.capableUsers[i].eventrolleid, this.evnt.start, this.evnt.end, (result) => {

                                });
                              }
                            }
                          }
                        })
                      }
                    }
                  });
                }
              }
            });
          });
        });
      });
    });
  }

  sendMail(userList) {
    for (let user of userList) {
      userService.getUserEventInfo(user, this.evnt.eventid, (result) => {
        this.userEvent = result;

        let recieverAdress = this.userEvent.email;
        let mailSubject = 'Utkalling til arrangement';
        let text = 'Hei ' + this.userEvent.firstName + '. Du har blitt kalt ut til arrangement ' + this.userEvent.title + ' som ' + this.userEvent.rollenavn + '. Logg inn på appen for mer info og for å godkjenne vakten.';

        // mailService.sendMail(recieverAdress, mailSubject, text);
      });
    }
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      localStorage.setItem('selectedEvent', JSON.stringify(result));
      this.start = this.evnt.start.toLocaleString().slice(0, -3);
      this.end = this.evnt.end.toLocaleString().slice(0, -3);
      userService.getCity(this.evnt.postalnumber, (result) => {
        this.city = result.poststed;
        eventService.getEventRoller(this.evnt.eventid, (result) => {
          this.eventRoller = result;
          eventService.getInterest(this.evnt.eventid, this.user.id, (result) => {
            this.interest = result;
            eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
              this.eventRollernoUser = result;
              userService.getUsers((result) => {
                this.allUsers = result
                eventService.countRoller((result) => {
                  let count = result + 1;
                  for (var i = 0; i < count; i++) {
                    eventService.testRolle(this.evnt.eventid, i, (result, idnr) => {
                      if (result[0] != undefined) {
                        this.roleCount[result[0].rolleid] = result.length;
                      }

                      if (idnr == count - 1) {
                        this.forceUpdate();
                      }
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  }
}
