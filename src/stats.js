import React from 'react';
import { Link, NavLink, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services/userservice';
import { eventService } from './services/eventservice';
import { skillService } from './services/skillservice';

export class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.users = [];
    this.stats = [];
    this.periodStats = [];
  }

  render() {
    let statistikk = '';
    for (let stat of this.stats) {
      statistikk += stat.navn + ': ' + stat.vaktpoeng + '\r\n';
    }

    let periode = '';
    for (let stat of this.periodStats) {
      let navn = stat.firstName + ' ' + stat.lastName;
      let startDate = new Date(stat.start).toLocaleDateString();
      let endDate = new Date(stat.end).toLocaleDateString();
      periode += navn + ', ' + stat.title + ', Start: ' + startDate + ', Slutt: ' + endDate + '\r\n';
    }

    return(
      <div>
        <div className="row">
        <h4>Periode Oversikt</h4>
          <div className="statsDiv col-5">
            Fra: <input ref="startDate" type="date" />
          </div>
          <div className="statsDiv col-5">
            Til: <input ref="endDate" type="date" />
          </div>
          <div className="statsDiv col-2">
            <button ref="finnStats" className="statsBtn">Hent</button>
          </div>
        </div>
        <div className="row">
          <div style={{color: 'red'}} ref='alertDiv' />
        </div>
        <div className="row">
          {periode}
        </div>

        <div className="row">
        <h4>Totale Vaktpoeng</h4>
          <div>
            {statistikk}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.refs.finnStats.onclick = () => {
      this.refs.alertDiv.textContent = '';

      // VALIDERING
      if (this.refs.startDate.value == '' || this.refs.endDate.value == '') {
        this.refs.alertDiv.textContent = 'Du må velge en start- og sluttdato';
      }

      else if (this.refs.startDate.value >= this.refs.endDate.value) {
        this.refs.alertDiv.textContent = 'Til-dato må være hørere enn fra-dato';
      }

      else {
        userService.getStats(this.refs.startDate.value, this.refs.endDate.value, (result) => {  // Henter vakter for brukeren innenfor tidsperioden
          this.periodStats = result;
          this.forceUpdate();
        });
      }
    }

    userService.getConfirmedUsers((result) => { // Henter aktiverte brukere
      this.users = result;
      for(let user of this.users) {
        let name = user.firstName + ' ' + user.lastName;
        let points;
        if (user.vaktpoeng == null) {
          points = 0;
        } else {
          points = user.vaktpoeng;
        }
        this.stats.push({navn: name, vaktpoeng: points});
      }

      this.forceUpdate();
    });
  }
}
