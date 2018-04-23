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

let selectedEvent = {};

moment.locale('ko', {
    week: {
        dow: 1,
        doy: 1,
    },
});

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

export class EventList extends React.Component { // Arrangementframside med kalender og arrangementliste
  constructor(props) {
    super(props);

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

    for (let evnt of this.evntList) {   // Pusher kommende arrangementer inn i en liste/tabell
      evntsList.push(<tr key={evnt.eventid} className='tableRow' onClick={() => this.props.history.push('/eventdetails/' + evnt.eventid)}><td className='tableLines'>{evnt.title}</td><td className='tableLines'>{evnt.start.toLocaleString().slice(0, -3)}</td><td className='tableLines'>{evnt.end.toLocaleString().slice(0, -3)}</td></tr>)
    }

    for (let rolle of this.userRoles) {   // Pusher kommende roller for brukeren inn i en tabell
      if (rolle.confirmed == false) { // Forskjell på om rollen er godkjent eller ikke
        userRoles.push(<tr className='tableRow' key={rolle.event_rolle_id}>
          <td onClick={() => this.props.history.push('/eventdetails/' + rolle.eventid)} className='tableLines'>{rolle.title}</td>
          <td className='tableLines' onClick={() => this.props.history.push('/eventdetails/' + rolle.eventid)}>{rolle.rollenavn}</td>
          <td className='tableLines' onClick={() => this.props.history.push('/eventdetails/' + rolle.eventid)}>{rolle.start.toLocaleString()}</td>
          <td className='tableLines'><button onClick={() =>
            this.confirmRole(rolle.event_rolle_id)
          }>Godkjenn</button></td>
          <td className='tableLines'><button onClick={() =>
          this.goToRoleChange(rolle)}>Bytt vakt</button></td>
          </tr>);
      }

      else {
        userRoles.push(<tr className='tableRow' key={rolle.event_rolle_id}>
          <td className='tableLines' onClick={() => this.props.history.push('/eventdetails/' + rolle.eventid)}>{rolle.title}</td>
          <td className='tableLines' onClick={() => this.props.history.push('/eventdetails/' + rolle.eventid)}>{rolle.rollenavn}</td>
          <td className='tableLines'>{rolle.start.toLocaleString()}</td>
          <td className='tableLines'>Godkjent</td>
          <td className='tableLines'><button onClick={() =>
          this.goToRoleChange(rolle)}>Bytt vakt</button></td>
          </tr>);
      }
    }

    let today = new Date().toLocaleDateString();

    for (let passiv of this.userPassiv) {   // Skriver ut brukerens passiv-perioder
      if (passiv.passivstart.toLocaleDateString() > today) {
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
        <div className='columns'>
          <div className='calendar'>
             <BigCalendar
               events={this.evntList}
               showMultiDayTimes
               defaultDate={new Date()}
               selectAble ={true}
               onSelectEvent={event => this.props.history.push('/eventdetails/' + event.eventid)
           }
               />
          </div>
         <div className='userRoles'>
         <h3 className='eventRolesTitle'>Dine pågående og kommende vakter</h3>
         <div>
          <table className='userTable'>
            <tbody>
              {userRoles}
            </tbody>
          </table>
          </div>
        </div>
        </div>
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
          <div style={{color: 'red'}} ref='passivalertDiv'></div>
         </div>
       </div>
    );
  }

  goToRoleChange(rolle) { //Funksjon for å lagre vakt i localStorage og sende brukeren videre til siden for rollebytte
    localStorage.setItem('rollebytte', JSON.stringify(rolle));
    this.props.history.push('/changerole/' + rolle.userid);
  }

  confirmRole(eventrolleid) { // Funksjon for å godkjenne en rolle
    eventService.confirmRoleEvent(eventrolleid, (result) => {
      eventService.getUserEventRoller(this.user.id, (result) => {
        this.userRoles = result;
        this.forceUpdate();
      });
    });
  }

  regPassiv() { // Funksjon for å registrere en passiperiode
    this.refs.passivalertDiv.textContent = '';

    if (this.refs.startPassiv.value == '' || this.refs.endPassiv.value == '') {
      this.refs.passivalertDiv.textContent = 'Du må velge en start- og sluttdato';
    }

    else {
      userService.setPassiv(this.user.id, this.refs.startPassiv.value, this.refs.endPassiv.value, (result) => {
        userService.getPassivNoEvent(this.user.id, (result) => {
          this.userPassiv = result;
          this.forceUpdate();
        });
      });
    }
  }

  componentDidMount () {
    eventService.getUpcomingEvents((result) => {
      this.evntList = result;
      userService.getUserSkills(this.user.id, (result) => {
        this.userSkills = result;
        eventService.getUpcomingUserEventRoller(this.user.id, (result) => {
          this.userRoles = result;
          eventService.getOldUserEventRoller(this.user.id, (result) => {
            this.oldUserRoles = result;
            userService.getPassivNoEvent(this.user.id, (result) => {
              this.userPassiv = result;
              this.forceUpdate();
            });
          });
        });
      })
    });
  }
}

export class Roles extends React.Component {  // Side for å endre rolle for et arrangement
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

    for (let rolle of this.allRoles) {  // Skriver ut alle roller med en pluss og en minus-knapp
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

  confirmRoles() { // Funksjon for å sammenligne om det er gjort noen endringer i antall roller
    let equal = true;
    for (let rolle of this.allRoles) {
      if (this.roleCount[rolle.rolleid - 1] != this.roleCountAfter[rolle.rolleid - 1]) {
        equal = false;
      }
    }

    if (equal == true) {  // Dersom det ikke er gjort noen endringer
      this.props.history.push('/eventdetails/' + this.id);
    }

    else {
      for (let rolle of this.allRoles) {  // Setter differansen for hver rolle
        if (this.roleCount[rolle.rolleid - 1] != this.roleCountAfter[rolle.rolleid - 1]) {
          this.difference[rolle.rolleid - 1] = this.roleCountAfter[rolle.rolleid - 1] - this.roleCount[rolle.rolleid - 1];
        }
      }

      for (let i = 0; i < this.totalRoles; i++) {
        if (this.difference[i] > 0) { // Legger til roller ved positiv differanse
          for (let j = 0; j < this.difference[i]; j++) {
            eventService.regRolle(this.evnt.eventid, i + 1, (result) => {

            });
          }
        }

        else if (this.difference[i] < 0) {  // Sletter roller ved negativ differanse
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
              if (result[0] != undefined) { // Lager en plass i arrrayene for hver rolle
                this.roleCount[idnr - 1] = result.length; // Gjør klart for sammenligning
                this.roleCountAfter[idnr - 1] = result.length;
                this.difference[idnr - 1] = 0;
              }

              else {
                this.roleCount[idnr - 1] = 0;
                this.roleCountAfter[idnr - 1] = 0;
                this.difference[idnr - 1] = 0;
              }

              if (idnr == this.totalRoles) {  // Updater etter alle roller er kjørt igjennom
                this.forceUpdate();
              }
            });
          }
        });
      });
    });
  }
}

export class CreateEvent extends React.Component {  // Oppretting av arrangement
  constructor(props) {
    super(props);

    this.vaktmaler = [];
    this.equipment = {};

    this.state = {};
  }

  render() {
    const { selectValue } = this.state;
    let vaktmalOptions = [];

    for (let vaktmal of this.vaktmaler) {   // Henter ut alle vaktmaler med navn
      vaktmalOptions.push({label: vaktmal.vaktmaltittel, value: vaktmal.vaktmalid},);
    }

    return(
      <div className='centeredDiv'>
        <div className='createEventDiv'>
          <h3>Opprett arrangement</h3>
          Tittel: <input ref='title' type='text' /> <br />
          Bekskrivelse: <input ref='text' type='text' /> <br />
          Arrangementstart: <input ref='start' type='datetime-local' placeholder='Startdato' /> <br />
          Arrangementslutt: <input ref='end' type='datetime-local' placeholder='Sluttdato' /> <br />
          Oppmøtetidspunkt: <input ref='oppmote' type='time' /> <br />
          Adresse: <br />
          <input ref='adresse' type='text' placeholder='Gateadresse'/> <br />
          <input ref='postalnumber' type='text' maxLength='4' className='regPostal' placeholder='Postnr'/>
          <input ref='city' className='regCity' placeholder='Poststed' value={this.state.city} type='text' readOnly /><br />
          Utstyrsliste: <input ref='equipment' type='text' /> <br />
          <VirtualizedSelect
            autoFocus
            placeholder='Velg en vaktmal'
            clearable={true}
            removeSelected={true}
            options={vaktmalOptions}
            onChange={(selectValue) => this.setState({ selectValue })}
            value={selectValue}
            className='createEventSelect'
          />
          Kontaktperson: <br />
          <input ref='contactperson' type='text' placeholder='Navn' /> <br /> <input ref='contactphone' type='number' placeholder='Tlf' />
          <button className='submitBtn' onClick={() => this.registerEvent(selectValue)}>Registrer arrangement</button>
          <div ref='alertDiv'></div>
        </div>
      </div>
    );
  }

  registerEvent(selectValue) {
    this.refs.alertDiv.textContent = '';


    // VALIDERING
    if (this.refs.equipment.value == '') {
      this.equipment = 'Ingenting';
    }
    else {
      this.equipment = this.refs.equipment.value;
    }


    if (this.refs.title.value == '' || this.refs.text.value == '' || this.refs.start.value == '' || this.refs.end.value == '' ||
    this.refs.oppmote.value == '' || this.refs.adresse.value == '' || this.refs.postalnumber.value == '' ||
    this.refs.contactperson.value == '' || this.refs.contactphone.value == '') {
      this.refs.alertDiv.textContent = 'Vennligst fyll ut alle feltene';
    }

    else if (this.refs.city.value == 'IKKE GYLDIG POSTNUMMER') {
      this.refs.alertDiv.textContent += 'Fyll inn et gyldig postnummer';
    }

    else {
      eventService.createEvent(this.refs.title.value, this.refs.text.value, this.refs.start.value, this.refs.end.value,
      this.refs.oppmote.value, this.refs.adresse.value, this.refs.postalnumber.value, this.equipment,
      this.refs.contactperson.value, this.refs.contactphone.value, (result) => {
        this.nextId = result.insertId;
        if (selectValue != undefined) { // Dersom vaktmal er valgt, legges det til roller som hører til denne vaktmalen
          eventService.getRoller(selectValue.value, (result) => {
            this.registerRoller(result, this.nextId);
            this.props.history.push('/roles/' + this.nextId);
          });
        }

        else {
          this.props.history.push('/roles/' + this.nextId);
        }
      });
    }
  }

  registerRoller(roller, eventid) {   // Funskjon for å registrere rollene fra vaktmal
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

    this.refs.postalnumber.oninput = () => {  // Oppdaterer poststed-feltet når postnr skrives inn
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
  }
}

export class EditEvent extends React.Component {  // Endring av arrangementinfo
  constructor(props) {
    super(props);

    this.evnt = this.getSelectedEvent();

    let startTime = this.evnt.start;
    let endTime = this.evnt.end;
    let oppmoteTime = this.evnt.oppmote;
    this.startTime = this.evnt.start.slice(0, -1);  // Setter datoer og tidspunkt til riktig format i forhold til input-bokser
    this.endTime = this.evnt.end.slice(0, -1);
    this.oppmote = this.evnt.oppmote.slice(0, -3);

    this.state = {
      title: this.evnt.title,
      text: this.evnt.text,
      start: this.startTime,
      end: this.endTime,
      oppmote: this.oppmote,
      adress: this.evnt.adress,
      postalnumber: this.evnt.postalnumber,
      equipment: this.evnt.equipment,
      contactperson: this.evnt.contact,
      contactphone: this.evnt.phone
    };
  }

  onFieldChange(fieldName) { // Funksjon for å oppdatere riktig felt i this.state ved tastetrykk
    return function (event) {
        this.setState({[fieldName]: event.target.value});
    }
  }

  getSelectedEvent() {  // Henter informasjon om eventet fra localStorage
    let item = localStorage.getItem('selectedEvent');
    if(!item) return null;

    return JSON.parse(item);
  }

  render() {
    return(
      <div className='centeredDiv'>
        <div className='createEventDiv'>
          <h3>Endre arrangementinfo</h3>
          Tittel: <input name='title' ref='title' value={this.state.title} onChange={this.onFieldChange('title').bind(this)} /> <br />
          Beskrivelse: <input name='text' ref='text' value={this.state.text} onChange={this.onFieldChange('text').bind(this)} /> <br />
          Start: <input name='start' ref='start' type='datetime-local' value={this.state.start} onChange={this.onFieldChange('start').bind(this)} /> <br />
          Slutt: <input name='end' ref='end' type='datetime-local' value={this.state.end} onChange={this.onFieldChange('end').bind(this)} /> <br />
          Oppmøte: <input name='oppmote' ref='oppmote' type='time' value={this.oppmote} onChange={this.onFieldChange('oppmote').bind(this)} /> <br />
          Adresse: <input name='adress' ref='adress' value={this.state.adress} onChange={this.onFieldChange('adress').bind(this)} /> <br />
          Post: <input name='postalnumber' ref='postalnumber' className='regPostal' maxLength='4' value={this.state.postalnumber} onChange={this.onFieldChange('postalnumber').bind(this)} />
          <input ref='city' className='regCity'/> <br />
          Utstyr: <input name='equipment' ref='equipment' value={this.state.equipment} onChange={this.onFieldChange('equipment').bind(this)} /> <br />
          Kontaktperson: <input name='contactperson' ref='contactperson' value={this.state.contactperson} onChange={this.onFieldChange('contactperson').bind(this)} /> <br />
          Telefon: <input name='contactphone' ref='contactphone' value={this.state.contactphone} onChange={this.onFieldChange('contactphone').bind(this)} />
          <button className='submitBtn' ref='editEventBtn'>Confirm</button>
          <div style={{color: 'red'}} ref='alertDiv'></div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    userService.getCity(this.refs.postalnumber.value, (result) => {
      this.refs.city.value = result.poststed;
      this.forceUpdate();
    });

    this.refs.editEventBtn.onclick = () => {
      this.refs.alertDiv.textContent = '';

      // VALIDERING
      if (this.refs.equipment.value == '') {
        this.equipment = 'Ingenting';
      }
      else {
        this.equipment = this.refs.equipment.value;
      }

      if (this.refs.title.value == '' || this.refs.text.value == '' || this.refs.start.value == '' || this.refs.end.value == '' ||
      this.refs.oppmote.value == '' || this.refs.adress.value == '' || this.refs.postalnumber.value == '' || this.refs.contactperson.value == '' || this.refs.contactphone.value == '') {
        this.refs.alertDiv.textContent = 'Vennligst fyll ut alle feltene';
      }

      else if (this.refs.city.value == 'IKKE GYLDIG POSTNUMMER') {
        this.refs.alertDiv.textContent = 'Fyll inn et gyldig postnummer';
      }

      else {
        // Oppdaterer info og går deretter tilbake til arrangementinfo-side
        eventService.editEvent(this.evnt.eventid, this.refs.title.value, this.refs.text.value, this.refs.start.value, this.refs.end.value, this.refs.adress.value, this.refs.postalnumber.value, (result) => {
          this.props.history.push('/eventdetails/' + this.evnt.eventid);
        });
      }
    }

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
  }
}

export class ChangeRole extends React.Component { // Vaktbytte
  constructor(props) {
    super(props);

    this.userid = this.props.match.params.userId;
    this.user = {};
    this.loggedinUser = userService.getSignedInUser();
    this.toUser = {};

    this.eventRolle = JSON.parse(localStorage.getItem('rollebytte')); // Henter vakten vaktbyttet gjelder fra localStorage
  }

  render() {
    return(
      <div>
        <h4>Bytte bort vakt</h4>
        <div ref='infoDiv'>
          Skriv inn mailadresse til personen du har avtalt å bytte vakt med her. Administrator må godkjenne vaktbyttet.
        </div>
        <div ref='inputDiv'>
          <input type='text' ref='vaktbyttemail'/><button ref='vaktbytteBtn'>Bytt vakt</button>
        </div>
        <div ref='alertDiv'></div>
      </div>
    );
  }

  componentDidMount() {
    userService.getUser(this.userid, (result) => {
      this.user = result;
      eventService.getEvent(this.eventRolle.eventid, (result) => {
        this.evnt = result;
        this.forceUpdate();
      });
    });

    this.refs.vaktbytteBtn.onclick = () => {
      userService.getUserbyMail(this.refs.vaktbyttemail.value, (result) => { // Sjekker om det finnes en bruker med oppgitt epostadresse
        console.log(result);
        this.toUser = result;
        if (result != undefined) {
          userService.getPassiv(this.toUser.id, (result) => { // Sjekker om brukeren er passiv i perioden arrangementet pågår
            this.userPassiv = result;
            let passiv = false;
            let eventStart = this.evnt.start;
            let eventEnd = this.evnt.end;

            for (let p of this.userPassiv) {
              let startPassive = p.passivstart;
              let endPassive = p.passivend;

              if (startPassive <= eventEnd && endPassive >= eventStart) {
                passiv = true;
              }
            }

            if (passiv == false) {
              skillService.countRoleReq((result) => { // Sjekker om personen det ønskes å bytte til har kompetansen som kreves for denne rollen
                this.roleReq = result;
                eventService.getUsersSkillsofRoles(this.eventRolle.rolleid, this.toUser.id, this.evnt.end, (result) => {
                  let numberOfSkills = result.antall;
                  if (this.roleReq[this.eventRolle.rolleid - 1].antallskills == numberOfSkills) {
                    eventService.setVaktbytte(this.eventRolle.event_rolle_id, this.user.id, this.toUser.id, (result) => {
                      this.refs.inputDiv.textContent = 'Vaktbytte venter på godkjenning av administrator.';
                      this.refs.infoDiv.textContent = '';
                    });
                  }

                  else {
                    this.refs.alertDiv.textContent = 'Denne brukeren har ikke kompetansen som kreves for denne rollen.';
                    setTimeout(() => {
                      this.refs.alertDiv.textContent = '';
                    },5000);
                  }
                });
              });
            }

            else {
              this.refs.alertDiv.textContent = 'Denne brukeren har ikke mulighet til å stille opp i denne tidsperioden.';
              setTimeout(() => {
                this.refs.alertDiv.textContent = '';
              },5000);
            }
          });
        }

        else {
          this.refs.alertDiv.textContent = 'Ingen treff på denne epostadressen.';
          setTimeout(() => {
            this.refs.alertDiv.textContent = '';
          },5000);
        }
      });
    }
  }
}

export class OldEventRoles extends React.Component {  // Gamle vakter
  constructor(props) {
    super(props);

    this.user = userService.getSignedInUser();

    this.oldUserRoles = [];
  }

  render() {
    let roleList = [];
    let header;
    let tableHeader;

    if (this.oldUserRoles.length != 0) {  // Skriver ut gamle vakter dersom det finnes
      header = <h3>Dine tidligere vakter</h3>;

      for (let userRole of this.oldUserRoles) {
        roleList.push(<tr key={userRole.event_rolle_id} onClick={() =>
            this.props.history.push('/eventdetails/' + userRole.eventid)
          }>
          <td>{userRole.title}</td>
          <td>{userRole.rollenavn}</td>
          <td>{userRole.start.toLocaleString()}</td>
          <td>{userRole.end.toLocaleString()}</td>
          <td></td></tr>);
      }
    }

    else {
      header = <h3>Du har ikke deltatt på arrangement tidligere</h3>;
    }

    return(
      <div>
        {header}
        <div>
          <table>
            <thead>
              {tableHeader}
            </thead>
            <tbody>
              {roleList}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  componentDidMount() {
    eventService.getOldUserEventRoller(this.user.id, (result) => {
      this.oldUserRoles = result;
      console.log(result);
      this.forceUpdate();
    });
  }
}
