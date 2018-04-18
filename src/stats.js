import React from 'react';
import { Link, NavLink, HashRouter, Switch, Route } from 'react-router-dom';
import { userService } from './services';

export class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.users = [];
    this.stats = [];
  }

  render() {
    console.log(this.stats);
    let statistikk = '';
    for (let stat of this.stats) {
      statistikk += stat.navn + ': ' + stat.vaktpoeng + '\r\n';
    }

    return(
      <div>
        {statistikk}
      </div>
    );
  }

  componentDidMount() {
    userService.getConfirmedUsers((result) => {
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
