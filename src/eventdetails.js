import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services/userservice';
import { eventService } from './services/eventservice';
import { skillService } from './services/skillservice';
import { mailService } from './services/mailservice';
import { loggedin } from './outlogged';
import BigCalendar from 'react-big-calendar'
import moment from 'moment';
import VirtualizedSelect from 'react-virtualized-select';


export class EventDetails extends React.Component { //Side for å vise frem og endre detaljer og roller for arrangement
  constructor(props) {
    super(props);

    this.user = userService.getSignedInUser();
    this.evnt = {};
    this.rolle = {};
    this.eventRoller = [];
    this.eventRollernoUser = [];
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

    let today = new Date();

    if (this.interest == undefined && this.evnt.start > today) { // Knapp for å melde interesse dersom man ikke har gjort det fra før
      interestBtn = <button onClick={() =>
        eventService.setInterest(this.evnt.eventid, this.user.id, (result) => { // Oppdaterer brukeren sin interesse for arrangementet
          eventService.getInterest(this.evnt.eventid, this.user.id, (result) => {
            this.interest = result;
            this.forceUpdate();
          });
        })}>Meld interesse</button>;
    }

    else if (this.evnt.start > today) { // Knapp for å fjerne interesse
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
      rolleList.push(<tr key={ rolle.event_rolle_id } ><td> { rolle.rollenavn } </td><td> LEDIG </td></tr>);  // Alle roller på arrangementet som ikke har blitt tildelt noen bruker enda
    }

    if (this.user.admin == true) { // Knapper som skal skrives til siden dersom innlogget bruker er administrator
      if (this.evnt.end >= today) {
        rolleBtn = <button onClick={() => this.props.history.push('/roles/' + this.evnt.eventid)}>Roller</button>;
        editBtn = <button onClick={() => this.props.history.push('/editevent')}>Endre detaljer</button>;
      }

      if (this.eventRollernoUser.length != 0) { // Knapp for å fordele roller vises dersom det fortsatt finnes roller som ikke har blitt tildelt en person
        fordelRollerBtn = <button onClick={() => this.giveRoles()}>Fordel roller</button>;
      }

      if (this.eventRoller[0] != undefined) {
        emptyRolesBtn = <button onClick={() => // Mulighet for knapp til å fjerne personer fra rollene på dette arrangementet
          eventService.emptyEventRoles(this.evnt.eventid, (result) => {
            userService.deleteAllEventPassiv(this.evnt.start, this.evnt.end, (result) => {
              eventService.getEventRoller(this.evnt.eventid, (result) => {  // Oppdateres rollene for arrangementet
                this.eventRoller = result;
                eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                  this.eventRollernoUser = result;
                  this.forceUpdate();
                });
              });
            });
          })}>Tøm roller</button>;
      }


      for (let rolle of this.eventRoller) {   // Skriver ut rollene til liste ettersom om rollene er godkjent eller ikke
        if (rolle.confirmed == true) { // Forskjell på om vakta er godtatt eller ikke
          if (rolle.userid == this.user.id) {   // Dersom innlogget bruker er den samme som brukeren som skal listes ut, får man opp en knapp for vaktbytte
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
              <td><button onClick={() => this.confirmRole(rolle.event_rolle_id)}>Godkjenn</button></td>
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
      for (let rolle of this.eventRoller) { // Listen for vanlige brukere ser litt annerledes ut
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
              <td> { rolle.firstName } { rolle.lastName }</td>
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
              <td><button onClick={() => this.confirmRole(rolle.event_rolle_id)}>Godkjenn</button></td>
              <td><button onClick={() => this.goToRoleChange(rolle)}>Bytt vakt</button></td></tr>);
          }

          else {
            rolleList.push(<tr key={ rolle.event_rolle_id } >
              <td> { rolle.rollenavn } </td>
              <td>Venter på godkjenning</td>
              <td>  --  </td>
              <td>  --  </td>
              </tr>);
          }
        }
      }
    }



    if (this.eventRoller.length > 0) {  //Forskjellige headere på listen/tabellen for roller/brukere ettersom om det finnes tomme roller eller ikke
      rolleListHeader = <tr><th>Rolle</th><th>Status</th><th>Tildelt</th><th>Godkjent</th></tr>;
    }

    else if (this.eventRoller.length == 0 && this.eventRollernoUser.length > 0) {
      rolleListHeader = <tr><th>Rolle</th><th>Status</th></tr>;
    }

    if (this.evnt.oppmote != undefined) { //Skriver ut oppmøtetidspunkt i riktig format
      this.oppmote = this.evnt.oppmote.slice(0, -3);
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

  goToRoleChange(rolle) { //Funksjon for å lagre vakt i localStorage og sende brukeren videre til siden for rollebytte
    localStorage.setItem('rollebytte', JSON.stringify(rolle));
    this.props.history.push('/changerole/' + rolle.userid)
  }

  giveRoles() { // Funksjon som deler ut roller til interesserte brukere med riktig kompetanse
    this.refs.fordelRollerDiv.textContent = 'Roller fordeles';  //  Tekst som blir stående på siden mens roller fordeles
    let stop = false;
    let usedUserids = [];
    let usedEventRoleids = [];
    let interestedUsersNotUsed = [];
    this.capableUsers = [];
    let userPassiv = [];
    this.emailRecievers = [];
    let roleRequirement;

    eventService.getUsedUsers(this.evnt.eventid, (result) => {  // Brukere som allerede har en rolle på dette arrangementet hentes og pushes i en array
      for (let id of result) {
        usedUserids.push(id.userid);
      }

      eventService.getUsedEventRoles(this.evnt.eventid, (result) => { // Roller som allerede er dekket på dette arrangementet hentes og pushes i en array
        for (let id of result) {
          usedEventRoleids.push(id.event_rolle_id);
        }

        eventService.getInterestedUsers(this.evnt.eventid, (result) => {  // Henter interesserte brukere for dette arrangementet sortert etter vaktpoeng
          this.interestedUsers = result;
          for (let id of this.interestedUsers) {  // Sjekker om de interesserte brukerne allerede har en rolle på dette arrangementet
            let includes = usedUserids.includes(id.id);

            if (includes == false) {
              interestedUsersNotUsed.push(id);  // Interesserte brukere som ikke har en rolle enda
            }
          }

          if (interestedUsersNotUsed.length != 0) { // Dersom det finnes interesserte brukere uten rolle på dette arrangementet
            eventService.getEventRollernoUser(this.evnt.eventid, (result) => {  // Henter roller uten brukere for dette arrangementet
              this.eventRollernoUser = result;
              skillService.countRoleReq((result) => { // Teller hvor mange kompetansekrav det er for hver rolle
                this.roleReq = result;
                if (this.interestedUsers != undefined) {
                  for (let user of interestedUsersNotUsed) {  // Kjører gjennom alle interesserte brukere som ikke har rolle på arrangementet
                    userService.getPassiv(user.userid, (result) => {  // Henter alle passiv-perioder for denne brukeren
                      userPassiv = result;
                      let passiv = false;
                      let eventStart = this.evnt.start;
                      let eventEnd = this.evnt.end;

                      for (let i = 0; i < userPassiv.length; i++) { // Sjekker alle passiv-perioder om de forstyrrer arrangementet
                        let startPassive = userPassiv[i].passivstart;
                        let endPassive = userPassiv[i].passivend;

                        if (startPassive <= eventEnd && endPassive >= eventStart) { // Dersom de gjør det, blir brukeren satt som passiv
                          passiv = true;
                        }
                      }


                      if (user == interestedUsersNotUsed[interestedUsersNotUsed.length - 1]) {  //  Dersom brukeren er den siste i listen over intereserte brukere som ikke har rolle
                        for (let eventRolle of this.eventRollernoUser) {
                          if (passiv == true) {   // Sjekker om brukeren er passiv
                            eventService.getEventRoller(this.evnt.eventid, (result) => {  // Oppdaterer rollelistene
                              this.eventRoller = result;
                              eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                this.eventRollernoUser = result;
                                // Dersom det fortsatt er igjen roller uten bruker, dette er den siste
                                if (this.eventRollernoUser.length != 0 && eventRolle.event_rolle_id == this.eventRollernoUser[this.eventRollernoUser.length - 1].event_rolle_id) {
                                  stop = true;
                                  this.giveRolesToNotInterested();  // Kjører funksjon for å fordele roller til ikke interesserte brukere
                                }

                                else if (this.eventRollernoUser.length == 0) { // Dersom det ikke er igjen roller uten bruker, stopper funksjonen her
                                  this.refs.fordelRollerDiv.textContent = '';
                                  this.forceUpdate();
                                }
                              });
                            });
                          }

                          else {
                          eventService.getUsersSkillsofRoles(eventRolle.rolleid, user.userid, this.evnt.end, (result) => {  // Teller hvor mange av kompetansekravene for denne rollen brukeren har
                            let numberOfSkills = result.antall;
                            if (this.roleReq[eventRolle.rolleid - 1] != undefined) {
                              roleRequirement = this.roleReq[eventRolle.rolleid - 1].antallskills;
                            }

                            else {
                              roleRequirement = 0;
                            }

                            if (numberOfSkills != undefined && numberOfSkills == roleRequirement) { // Dersom brukeren har riktig antall av kompetansekravene for rollen
                              // Pushes inn i array med brukere med riktig kopetanse
                              this.capableUsers.push({userid: user.userid, rolleid: eventRolle.rolleid, points: user.vaktpoeng, eventrolleid: eventRolle.event_rolle_id, passivStart: user.passivstart, passivEnd: user.passivEnd});
                              for (let i = 0; i < this.capableUsers.length; i++) {  // Kjører gjennom utvalgte brukere og sjekker om de allerede er har en rolle på dette arrangementet
                                let exists = usedUserids.includes(this.capableUsers[i].userid);
                                let hasUser = usedEventRoleids.includes(this.capableUsers[i].eventrolleid);

                                if (exists == false && hasUser == false) { // Dersom de ikke har det
                                  usedUserids.push(this.capableUsers[i].userid);  // Setter brukeren inn i arrayen over brukere med rolle på dette arrangementet
                                  usedEventRoleids.push(this.capableUsers[i].eventrolleid);   // Setter rollen inn i arrayen over roller med bruker på arrangementet
                                  this.emailRecievers.push(this.capableUsers[i].userid);  // Setter bruker-id'en in i array med brukere det skal sendes epost til

                                  eventService.setRole(this.capableUsers[i].userid, this.capableUsers[i].eventrolleid, this.evnt.start, this.evnt.end, (result) => {  // Setter id'en til brukeren inn i rollen
                                    eventService.getEventRoller(this.evnt.eventid, (result) => {  // Oppdaterer rollelistene
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
                                          if (stop == false) {  // Kjører mail-funkjonen dersom den ikke allerede er kjørt
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


                      else if (passiv == false && user != interestedUsersNotUsed[interestedUsersNotUsed.length - 1]) {  // Dersom brukeren ikke er den siste av de interesserte brukeren uten rolle
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
                                    eventService.getEventRollernoUser(this.evnt.eventid, (result) => {
                                      this.eventRollernoUser = result;
                                      if (this.eventRollernoUser.length == 0) {
                                        eventService.getEventRoller(this.evnt.eventid, (result) => {
                                          this.eventRoller = result;
                                          if (stop == false) {
                                            this.sendMail(this.emailRecievers);
                                            stop = true;
                                          }
                                          this.forceUpdate();
                                        });
                                      }
                                    });
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

  giveRolesToNotInterested() {  // Samme funksjon som over, bare for ikke-interesserte brukere
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

        eventService.getAllUsersByVaktpoeng((result) => {   // Her hentes brukerne ut og sorteres etter vaktpoeng i stigende rekkefølge, altså de med minst vaktpoeng prioriteres
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

  sendMail(userList) {  // Funksjonen som sender ut mail til brukerne som har blitt tildelt en rolle på arrangementet
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

  confirmRole(eventrolleid) { // Funksjon for å godkjenne en rolle
    eventService.confirmRoleEvent(eventrolleid, (result) => {
      eventService.getEventRoller(this.evnt.eventid, (result) => {
        this.eventRoller = result;
        this.forceUpdate();
      });
    });
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      localStorage.setItem('selectedEvent', JSON.stringify(result));  // Lagrer arrangementet i localStorage for raskere tilgang til info dersom man skal endre arrangementinfo.
      this.start = this.evnt.start.toLocaleString().slice(0, -3); // Setter start og sluttdato til riktig format
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
                this.allUsers = result;
                this.forceUpdate();
              });
            });
          });
        });
      });
    });
  }
}
