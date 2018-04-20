import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { eventService, userService, skillService } from './services';
import { mailService } from './mail';
import { loggedin } from './outlogged';
import BigCalendar from 'react-big-calendar'
import moment from 'moment';
import VirtualizedSelect from 'react-virtualized-select';

let selectedEvent = {};

moment.locale('ko', {
    week: {
        dow: 1,
        doy: 1,
    },
});

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

export class EventList extends React.Component {
  constructor() {
    super();

    this.evntList = [];
    this.userRoles = [];
    this.userPassiv = [];

    this.user = userService.getSignedInUser();
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  render() {
    let evntsList = [];
    let availableEvents = [];
    let userRoles = [];
    let passivList = [];
    let passivHeader;

    for (let evnt of this.evntList) {
      evntsList.push(<tr key={evnt.eventid} className='tableRow' onClick={() => this.nextPath('/eventdetails/' + evnt.eventid)}><td className='tableLines'>{evnt.title}</td><td className='tableLines'>{evnt.start.toLocaleString().slice(0, -3)}</td><td className='tableLines'>{evnt.end.toLocaleString().slice(0, -3)}</td></tr>)
    }

    for (let rolle of this.userRoles) {
      if (rolle.confirmed == false) {
        userRoles.push(<tr key={rolle.event_rolle_id}><td>{rolle.title}</td><td>{rolle.rollenavn}</td><td><button onClick={() => this.confirmRole(rolle.event_rolle_id)}>Godkjenn</button></td></tr>)

      }

      else {
        userRoles.push(<tr key={rolle.event_rolle_id}><td>{rolle.title}</td><td>{rolle.rollenavn}</td><td>Godkjent</td></tr>)
      }
    }

    let today = new Date().toLocaleDateString();

    for (let passiv of this.userPassiv) {
      if (passiv.passivstart.toLocaleDateString() > today || passiv.passivend.toLocaleDateString() > today) {
        passivList.push(<tr className='tableRow' key={passiv.passivid}><td className='tableLines'>{passiv.passivstart.toLocaleDateString()}</td><td>{passiv.passivend.toLocaleDateString()}</td>
        <td><button onClick={() => userService.deletePassiv(passiv.passivid, (result) => {
          userService.getPassivNoEvent(this.user.id, (result) => {
            this.userPassiv = result;
            this.forceUpdate();
          });
        })}>Slett</button></td></tr>)
      }
    }

    if (passivList.length > 0) {
      passivHeader = <tr><th>Start</th><th>Slutt</th></tr>;
    }

    return(
      <div>
        <div style={{height: 400}}>
           <BigCalendar
             events={this.evntList}
             showMultiDayTimes
             defaultDate={new Date()}
             selectAble ={true}
             onSelectEvent={event => this.props.history.push('/eventdetails/' + event.eventid)
         }
             />
         </div>
         <button onClick={() => this.nextPath('/createevent')}>Lag arrangement</button>
         <div className='tableList'>
           <table className='eventTable'>
             <thead>
               <tr>
                 <th className='tableLines'>Navn</th>
                 <th className='tableLines'>Start</th>
                 <th className='tableLines'>Slutt</th>
               </tr>
             </thead>
             <tbody>
             {evntsList}
             </tbody>
           </table>
           <br />
         </div>
         <div>
          <table>
            <tbody>
              {userRoles}
            </tbody>
          </table>
         </div>
         <div>
          <h4>Dine passivperioder</h4>
          <table>
            <thead>
              {passivHeader}
            </thead>
            <tbody>
              {passivList}
            </tbody>
          </table>
         </div>
         <div>
          Sett deg selv som passiv for en periode. <br />
          <div>
            <div className="statsDiv col-5">
              <input ref='startPassiv' type='date' />
            </div>
            <div className="statsDiv col-5">
              <input ref='endPassiv' type='date' />
            </div>
          </div>
          <br />
          <button onClick={() => this.regPassiv()}>Registrer</button>
         </div>
       </div>
    );
  }

  confirmRole(eventrolleid) {
    eventService.confirmRoleEvent(eventrolleid, (result) => {
      eventService.getUserEventRoller(this.user.id, (result) => {
        this.userRoles = result;
        this.forceUpdate();
      });
    });
  }

  regPassiv() {
    userService.setPassiv(this.user.id, this.refs.startPassiv.value, this.refs.endPassiv.value, (result) => {
      userService.getPassivNoEvent(this.user.id, (result) => {
        this.userPassiv = result;
        this.forceUpdate();
      });
    });
  }

  componentDidMount () {
    eventService.getAllEvents((result) => {
      this.evntList = result;
      userService.getUserSkills(this.user.id, (result) => {
        this.userSkills = result;
        eventService.getUserEventRoller(this.user.id, (result) => {
          this.userRoles = result;
          userService.getPassivNoEvent(this.user.id, (result) => {
            this.userPassiv = result;
            this.forceUpdate();
          });
        });
      })
    });
  }
}

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

    if (this.eventRoller[0] != undefined) {
      emptyRolesBtn = <button onClick={() =>
        eventService.emptyEventRoles(this.evnt.eventid, (result) => {
          userService.deleteEventPassiv(this.evnt.start, this.evnt.end, (result) => {
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

    if (this.interest != undefined) {
      interessert = 'Du er interessert i dette arrangementet';
    }

    for (let rolle of this.eventRollernoUser) {
      rolleList.push(<tr key={ rolle.event_rolle_id } ><td> { rolle.rollenavn } </td><td> LEDIG </td></tr>);
    }

        let byttvaktBtn = {
          valueOf: function() {
            return <button onClick={() => this.byttVakt()}>Bytt vakeet</button>;
          }
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
            <td>{ rolle.timeconfirmed.toLocaleString().slice(0, -3) }</td></tr>);
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
            <td>Ikke godkjent</td></tr>);
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

    if (loggedinUser.admin == true) {
      rolleBtn = <button onClick={() => this.props.history.push('/roles/' + this.evnt.eventid)}>Roller</button>;
      editBtn = <button onClick={() => this.props.history.push('/editevent')}>Endre detaljer</button>;
      if (this.eventRollernoUser.length != 0) {
        fordelRollerBtn = <button onClick={() => this.giveRoles()}>Fordel roller</button>;
      }
    }

    return(
      <div>
        <div>
          <h3>{this.evnt.title}</h3> <br />
          Start: {this.start} <br />
          Slutt: {this.end} <br />
          Oppmøtetidspunkt: {this.oppmote} <br />
          Bekrivelse: {this.evnt.text} <br />
          Adresse: {this.evnt.adress}, {this.evnt.postalnumber} {this.city} <br />
          <br />
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
    this.props.history.push('/changerole')
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

          console.log(interestedUsersNotUsed);

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
                      for (let i = 0; i < userPassiv.length; i++) {
                        let startPassive = userPassiv[i].passivstart;
                        let endPassive = userPassiv[i].passivend;
                        let eventStart = this.evnt.start;
                        let eventEnd = this.evnt.end;

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
                                  console.log('Test1');
                                  this.forceUpdate();
                                }
                              });
                            });
                          }

                          else {
                          eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.userid, (result) => {
                            let numberOfSkills = result.antall;

                            if (numberOfSkills != undefined && numberOfSkills == this.roleReq[eventRolle.rolleid - 1].antallskills) {
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
                                            console.log(stop);
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
                          eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.userid, (result) => {
                            let numberOfSkills = result.antall;

                            if (numberOfSkills != undefined && numberOfSkills == this.roleReq[eventRolle.rolleid - 1].antallskills) {
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
    console.log('Notinterested');

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
                        eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.id, (result) => {
                          let numberOfSkills = result.antall;


                          if (numberOfSkills != undefined && numberOfSkills == this.roleReq[eventRolle.rolleid - 1].antallskills) {
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
                        eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.id, (result) => {
                          let numberOfSkills = result.antall;

                          if (numberOfSkills != undefined && numberOfSkills == this.roleReq[eventRolle.rolleid - 1].antallskills) {
                            this.capableUsers.push({userid: user.id, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id});

                            for (let i = 0; i < this.capableUsers.length; i++) {
                              let exists = usedUserids.includes(this.capableUsers[i].userid);
                              let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);

                              if (exists == false && hasUser == false) {
                                usedUserids.push(this.capableUsers[i].userid);
                                usedEventRoleids.push(this.capableUsers[i].eventrolleid);
                                console.log(this.capableUsers[i].userid + ' 4');
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
      console.log(user);
      userService.getUserEventInfo(user, this.evnt.eventid, (result) => {
        this.userEvent = result;
        console.log(result);

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

export class Roles extends React.Component {
  constructor(props) {
    super(props);

    this.evnt = {};
    this.roleCount = [];
    this.roleCountAfter = [];
    this.allRoles = [];
    this.difference = [];
    this.allRolleEvent = [];

    this.id = props.match.params.eventId;
  }

  render() {
    let rolleList = [];
    // for (let rolle of this.allRoles) {
    //   this.roleCountAfter[rolle.rolleid - 1] = this.roleCount[rolle.rolleid - 1];
    // }
    for (let rolle of this.allRoles) {
      rolleList.push(
        <tr key={rolle.rolleid}>
        <td>{ rolle.rollenavn }</td>
        <td>{this.roleCountAfter[rolle.rolleid - 1]}</td>
        <td><button onClick={() => {
          this.roleCountAfter[rolle.rolleid - 1]++;
          this.forceUpdate();
        }}>+</button></td>
        <td><button onClick={() => {
          if (this.roleCountAfter[rolle.rolleid-1] > 0) {
            this.roleCountAfter[rolle.rolleid-1]--;
            this.forceUpdate();
          }
        }}>-</button></td></tr>)
    }
    return(
      <div>
        <table>
          <tbody>
            {rolleList}
          </tbody>
        </table>
        <button onClick={() => this.confirmRoles()}>Bekreft</button>
      </div>
    );
  }

  confirmRoles() {
    let equal = true;
    for (let rolle of this.allRoles) {
      if (this.roleCount[rolle.rolleid - 1] != this.roleCountAfter[rolle.rolleid - 1]) {
        equal = false;
      }
    }

    if (equal == true) {
      this.props.history.push('/eventdetails/' + this.id);
    }

    else {
      for (let rolle of this.allRoles) {
        if (this.roleCount[rolle.rolleid - 1] != this.roleCountAfter[rolle.rolleid - 1]) {
          this.difference[rolle.rolleid - 1] = this.roleCountAfter[rolle.rolleid - 1] - this.roleCount[rolle.rolleid - 1];
        }
      }

      for (let i = 0; i < this.totalRoles; i++) {
        if (this.difference[i] > 0) {
          for (let j = 0; j < this.difference[i]; j++) {
            eventService.regRolle(this.evnt.eventid, i + 1, (result) => {

            });
          }
        }

        else if (this.difference[i] < 0) {
          eventService.getEventRolle(this.evnt.eventid, i + 1, (result) => {
            this.allRolleEvent = result;
            for (var j = 0; j < -this.difference[i]; j++) {
              eventService.deleteEventRolle(this.allRolleEvent[j].event_rolle_id, (result) => {

              });
            }
          });
        }
      }
      this.props.history.push('/eventdetails/' + this.id);
    }
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      eventService.getEventRoller(this.evnt.eventid, (result) => {
        this.eventRoller = result;
        eventService.getAllRoller((result) => {
          this.allRoles = result;
        });
        eventService.countRoller((result) => {
          this.totalRoles = result;
          for (let i = 0; i < this.totalRoles + 1; i++) {
            eventService.testRolle(this.evnt.eventid, i, (result, idnr) => {
              if (result[0] != undefined) {
                this.roleCount[idnr - 1] = result.length;
                this.roleCountAfter[idnr - 1] = result.length;
                this.difference[idnr - 1] = 0;
              }

              else {
                this.roleCount[idnr - 1] = 0;
                this.roleCountAfter[idnr - 1] = 0;
                this.difference[idnr - 1] = 0;
              }

              if (idnr == this.totalRoles) {
                this.forceUpdate();
              }
            });
          }
        });
      });
    });
  }
}

export class EventDetailsAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.arrangement = {};

    this.id = props.match.params.eventId;
  }

  render() {
    return(
      <div>
        {this.arrangement.title}
      </div>
    );
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.arrangement = result;
      this.forceUpdate();
    });
  }
}

export class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.vaktmaler = [];

    this.state = {};
  }

  render() {
    const { selectValue } = this.state;
    let vaktmalOptions = [];

    for (let vaktmal of this.vaktmaler) {
      vaktmalOptions.push({label: vaktmal.vaktmaltittel, value: vaktmal.vaktmalid},);
    }

    return(
      <div>
        <input ref='title' type='text' placeholder='Tittel'/> <br />
        <input ref='text' type='text' placeholder='Beskrivelse'/> <br />
        <input ref='start' type='datetime-local' placeholder='Startdato'/> <br />
        <input ref='end' type='datetime-local' placeholder='Sluttdato'/> <br />
        <input ref='adresse' type='text' placeholder='Adresse'/> <br />
        <input ref='postalnumber' type='text' maxLength='4' placeholder='Postnr'/> <br />
        <div>
          <h4>Vaktmal</h4> <br />
          <VirtualizedSelect
            autoFocus
            clearable={true}
            removeSelected={true}
            options={vaktmalOptions}
            onChange={(selectValue) => this.setState({ selectValue })}
            value={selectValue}
          />
        </div>
        <button onClick={() => this.registerEvent(selectValue)}>Registrer arrangement</button>
      </div>
    );
  }

  registerEvent(selectValue) {
      eventService.createEvent(this.refs.title.value, this.refs.text.value, this.refs.start.value, this.refs.end.value, this.refs.adresse.value, this.refs.postalnumber.value, (result) => {
        this.nextId = result.insertId;
        eventService.getRoller(selectValue.value, (result) => {
          this.registerRoller(result, this.nextId);
          this.props.history.push('/roles/' + this.nextId);
        });
      });
  }

  registerRoller(roller, eventid) {
    for (let rolle of roller) {
      eventService.regRolle(eventid, rolle.rolleid, (result) => {

      });
    }
  }

  componentDidMount() {
    eventService.getVaktmaler((result) => {
      this.vaktmaler = result;
      this.forceUpdate();
    });
  }
}

export class EditEvent extends React.Component {
  constructor(props) {
    super(props);

    this.evnt = this.getSelectedEvent();

    let startTime = this.evnt.start;
    let endTime = this.evnt.end;
    this.startTime = startTime.slice(0, -1);
    this.endTime = endTime.slice(0, -1);

    this.state = {
      title: this.evnt.title,
      text: this.evnt.text,
      start: this.startTime,
      end: this.endTime,
      adress: this.evnt.adress,
      postalnumber: this.evnt.postalnumber,
    };
  }

  onFieldChange(fieldName) {
        return function (event) {
            this.setState({[fieldName]: event.target.value});
        }
  }

  fixDate(d) {
    let day = d.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    let month = d.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    let year = d.getFullYear();
    let hours = d.getHours();
    if (hours < 10) {
      hours = '0' + hours;
    }
    let mins = d.getMinutes();
    if (mins < 10) {
      mins = '0' + mins;
    }

    let dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + mins;
    return(dateTime);
  }

  getSelectedEvent() {
    let item = localStorage.getItem('selectedEvent');
    if(!item) return null;

    return JSON.parse(item);
  }

  render() {
    return(
      <div>
        <input name='title' ref='title' value={this.state.title} onChange={this.onFieldChange('title').bind(this)} />
        <input name='text' ref='text' value={this.state.text} onChange={this.onFieldChange('text').bind(this)} />
        <br />
        <input name='start' ref='start' type='datetime-local' value={this.state.start} onChange={this.onFieldChange('start').bind(this)} />
        <input name='end' ref='end' type='datetime-local' value={this.state.end} onChange={this.onFieldChange('end').bind(this)} />
        <br />
        <input name='adress' ref='adress' value={this.state.adress} onChange={this.onFieldChange('adress').bind(this)} />
        <input name='postalnumber' ref='postalnumber' maxLength='4' value={this.state.postalnumber} onChange={this.onFieldChange('postalnumber').bind(this)} />
        <br />
        <button ref='editEventBtn'>Confirm</button>
      </div>
    );
  }

  componentDidMount() {
    this.refs.editEventBtn.onclick = () => {
      eventService.editEvent(this.evnt.eventid, this.refs.title.value, this.refs.text.value, this.refs.start.value, this.refs.end.value, this.refs.adress.value, this.refs.postalnumber.value, (result) => {
        this.props.history.push('/eventdetails/' + this.evnt.eventid);
      });
    }
  }
}

export class ChangeRole extends React.Component {
  constructor(props) {
    super(props);

    this.user = userService.getSignedInUser();
    
    this.rolle = JSON.parse(localStorage.getItem('rollebytte'));
  }

  render() {
    return(
      <div>
      </div>
    );
  }

  componentDidMount() {

  }
}
