import React from 'react';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { eventService, userService } from './services';
import { loggedin } from './outlogged';
import BigCalendar from 'react-big-calendar'
import moment from 'moment';
import VirtualizedSelect from 'react-virtualized-select';

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
  }

  nextPath(path) {
    this.props.history.push(path);
  }

  render() {
    let evntsList = [];
    for (let evnt of this.evntList) {
      let day = evnt.start.getDate();
      let month = evnt.start.getMonth() + 1;
      let year = evnt.start.getFullYear();
      evntsList.push(<tr key={evnt.eventid} className='tableRow' onClick={() => this.nextPath('/eventdetails/' + evnt.eventid)}><td className='tableLines'>{evnt.title}</td><td className='tableLines'>{evnt.start.toISOString().split("T")[0]}</td><td className='tableLines'>{evnt.end.toISOString().split("T")[0]}</td></tr>)
    }

    return(
      <div>
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
          <button onClick={() => this.nextPath('/createevent')}>Lag arrangement</button>
        </div>
        <div style={{height: 400}}>
           <BigCalendar
             events={this.evntList}
             showMultiDayTimes
             defaultDate={new Date(2018, 2, 1)}
             selectAble ={true}
             onSelectEvent={event => this.props.history.push('/eventdetails/' + event.eventid)
         }
             />
         </div>
       </div>
    );
  }

  componentDidMount () {
    eventService.getAllEvents((result) => {
      this.evntList = result;
      this.forceUpdate();
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
    for (let rolle of this.eventRoller) {
      let ready = true;
      for (let check of rolleList) {
        if (check.key == rolle.rolleid) {
          ready = false;
        }
      }
      if (ready == true) {
        rolleList.push(<tr key={ rolle.rolleid } ><td> { rolle.rollenavn } </td><td> { this.roleCount[rolle.rolleid] } </td></tr>);
      }

    }

    let loggedinUser = userService.getSignedInUser();

    return(
      <div>
        <div>
          <h3>{this.evnt.title}</h3> <br />
          Start: {this.start} <br />
          Slutt: {this.end} <br />
          Bekrivelse: {this.evnt.text} <br />
        </div>
        <div>
          <h4>Roller til dette arrangementet</h4>
          <table>
            <tbody>
              {rolleList}
            </tbody>
          </table>
        </div>
        <button onClick={() => this.props.history.push('/roles/' + this.evnt.eventid)}>Roller</button>
      </div>
    );
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      this.start = this.fixDate(this.evnt.start);
      this.end = this.fixDate(this.evnt.end);
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
  }
}

export class Roles extends React.Component {
  constructor(props) {
    super(props);

    this.evnt = {};
    this.roleCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.allRoles = [];

    this.id = props.match.params.eventId;
  }

  render() {
    let rolleList = [];
    for (let rolle of this.allRoles) {
      rolleList.push(<tr key={rolle.rolleid}><td>{ rolle.rollenavn }</td><td>{this.roleCount[rolle.rolleid + 1]}</td><td><button>+</button></td><td><button>-</button></td></tr>)
    }
    return(
      <div>
        <table>
          <tbody>
            {rolleList}
          </tbody>
        </table>
      </div>
    );
  }

  add() {

  }

  remove() {
    
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      eventService.getEventRoller(this.evnt.eventid, (result) => {
        this.eventRoller = result;
        eventService.getAllRoller((result) => {
          this.allRoles = result;
          console.log(this.allRoles);
        });
        eventService.countRoller((result) => {
          let count = result + 1;
          for (var i = 0; i < count; i++) {
            eventService.testRolle(this.evnt.eventid, i, (result, idnr) => {
              if (result[0] != undefined) {
                this.roleCount[result[0].rolleid + 1] = result.length;
              }

              if (idnr == count - 1) {
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

    this.id = props.match.params.eventId;

    this.state = {
      title: this.evnt.title,
      start: this.evnt.start,
      end: this.evnt.end,
      text: this.evnt.text,
      adress: this.evnt.adress,
      postalnumber: this.evnt.postalnumber,
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
        <input name='title' ref='title' value={this.state.title} onChange={this.onFieldChange('title').bind(this)} />
        <input name='start' ref='lastName' type='date' value={this.state.lastName} onChange={this.onFieldChange('lastName').bind(this)} />
        <br />
        <input name='phonenumber' ref='phonenumber' value={this.state.phonenumber} onChange={this.onFieldChange('phonenumber').bind(this)} />
        <input name='email' ref='email' value={this.state.email} onChange={this.onFieldChange('email').bind(this)} />
        <br />
        <input name='adress' ref='adress' value={this.state.adress} onChange={this.onFieldChange('adress').bind(this)} />
        <input name='postalnumber' ref='postalnumber' maxLength='4' value={this.state.postalnumber} onChange={this.onFieldChange('postalnumber').bind(this)} />
        <br />
        {rolleList}
        <button ref='editUserBtn'>Confirm</button>
      </div>
    );
  }

  componentDidMount() {
    eventService.getEvent(this.id, (result) => {
      this.evnt = result;
      this.forceUpdate();
    });
  }
}
