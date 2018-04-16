import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { eventService, userService } from './services';
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

    this.user = userService.getSignedInUser();
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  render() {
    let evntsList = [];
    let availableEvents = [];
    for (let evnt of this.evntList) {
      let day = evnt.start.getDate();
      let month = evnt.start.getMonth() + 1;
      let year = evnt.start.getFullYear();
      evntsList.push(<tr key={evnt.eventid} className='tableRow' onClick={() => this.nextPath('/eventdetails/' + evnt.eventid)}><td className='tableLines'>{evnt.title}</td><td className='tableLines'>{evnt.start.toISOString().split("T")[0]}</td><td className='tableLines'>{evnt.end.toISOString().split("T")[0]}</td></tr>)
    }

    for(let evnt of this.evntList) {
      eventService.getEventRoller(evnt.eventid, (result) => {

      });
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
           <h4>Tilgjengelisge arrangementer</h4>
           <table className='eventTable'>
             <thead>
               <tr>
                 <th className='tableLines'>Navn</th>
                 <th className='tableLines'>Start</th>
                 <th className='tableLines'>Slutt</th>
               </tr>
             </thead>
             <tbody>
             {availableEvents}
             </tbody>
           </table>
           <br />
         </div>
       </div>
    );
  }

  componentDidMount () {
    eventService.getAllEvents((result) => {
      this.evntList = result;
      userService.getUserSkills(this.user.id, (result) => {
        this.userSkills = result;
        this.forceUpdate();
      })
    });
  }
}

export class EventDetails extends React.Component {
  constructor(props) {
    super(props);

    this.evnt = {};
    this.rolle = {};
    this.eventRoller = [];
    this.roleCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.id = props.match.params.eventId;
  }

  fixDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    if (hours < 10) {
      hours = '0' + hours;
    }
    let mins = date.getMinutes();
    if (mins < 10) {
      mins = '0' + mins;
    }

    let dateTime = day + '/' + month + '/' + year + ' ' + hours + ':' + mins;
    return(dateTime);
  }

  render() {
    let rolleList = [];
    let rolleBtn;
    let editBtn;
    for (let rolle of this.eventRoller) {
      if (rolle.userid == undefined) {
        rolleList.push(<tr key={ rolle.event_rolle_id } ><td> { rolle.rollenavn } </td><td> LEDIG </td></tr>);
      }

      else {
        rolleList.push(<tr key={ rolle.event_rolle_id } ><td> { rolle.rollenavn } </td><td> { rolle.userid } </td></tr>);
      }
    }

    // for (let rolle of this.eventRoller) {
    //   let ready = true;
    //   for (let check of rolleList) {
    //     if (check.key == rolle.rolleid) {
    //       ready = false;
    //     }
    //   }
    //   if (ready == true) {
    //     rolleList.push(<tr key={ rolle.rolleid } ><td> { rolle.rollenavn } </td><td> { this.roleCount[rolle.rolleid] } </td></tr>);
    //   }
    //
    // }

    let loggedinUser = userService.getSignedInUser();

    if (loggedinUser.admin == true) {
      rolleBtn = <button onClick={() => this.props.history.push('/roles/' + this.evnt.eventid)}>Roller</button>;
      editBtn = <button onClick={() => this.props.history.push('/editevent')}>Endre detaljer</button>;
    }

    return(
      <div>
        <div>
          <h3>{this.evnt.title}</h3> <br />
          Start: {this.start} <br />
          Slutt: {this.end} <br />
          Bekrivelse: {this.evnt.text} <br />
          Adresse: {this.evnt.adress}, {this.evnt.postalnumber} {this.city} <br />
        </div>
        {editBtn}
        <div>
          <h4>Roller til dette arrangementet</h4>
          <table>
            <tbody>
              {rolleList}
            </tbody>
          </table>
        </div>
        {rolleBtn}
      </div>
    );
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      localStorage.setItem('selectedEvent', JSON.stringify(result));
      this.start = this.fixDate(this.evnt.start);
      this.end = this.fixDate(this.evnt.end);
      userService.getCity(this.evnt.postalnumber, (result) => {
        this.city = result.poststed;
        eventService.getEventRoller(this.evnt.eventid, (result) => {
          this.eventRoller = result;
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
    // day + '/' + month + '/' + year + ' ' + hours + ':' + mins;
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
