import React from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Switch, Route } from 'react-router-dom';
import { customerService } from './services';

class Menu extends React.Component {
  render() {
    return (
      <div>
        Menu: <Link to='/'>Customers</Link>
      </div>
    );
  }
}

// Component that shows a list of all the customers
class CustomerList extends React.Component {
  constructor() {
    super(); // Call React.Component constructor

    this.customers = [];
  }

  render() {
    let listItems = [];
    for(let customer of this.customers) {
      listItems.push(
        <li key={customer.id}>
          <Link to={'/customer/' + customer.id}>{customer.firstName}</Link>
          <button onClick={() => {
            console.log('button for customer ' + customer.id + ' clicked');
          }}>x</button>
        </li>
      );
    }

    return (
      <div>
        Customers:
        <ul>{listItems}</ul>
        New customer:
        <div>
          Name: <input type='text' ref='newName' />
          City: <input type='text' ref='newCity' />
          <button ref='newCustomerButton'>Add</button>
        </div>
      </div>
    );
  }

  // Called after render() is called for the first time
  componentDidMount() {
    customerService.getCustomers((result) => {
      this.customers = result;
      this.forceUpdate(); // Rerender component with updated data
    });

    this.refs.newCustomerButton.onclick = () => {
      customerService.addCustomer(this.refs.newName.value, this.refs.newCity.value, (result) => {
        this.refs.newName.value = "";
        this.refs.newCity.value = "";

        customerService.getCustomers((result) => {
          this.customers = result;
          this.forceUpdate(); // Rerender component with updated data
        });
      });
    };
  }
}

// Detailed view of one customer
class CustomerDetails extends React.Component {
  constructor(props) {
    super(props); // Call React.Component constructor

    this.customer = {};

    // The customer id from path is stored in props.match.params.customerId
    this.id = props.match.params.customerId;
  }

  render() {
    return (
      <div>
        Customer:
        <ul>
          <li>Name: {this.customer.firstName}</li>
          <li>City: {this.customer.city}</li>
        </ul>
      </div>
    );
  }

  // Called after render() is called for the first time
  componentDidMount() {
    // The customer id from path is stored in props.match.params.customerId
    customerService.getCustomer(this.id, (result) => {
      this.customer = result;
      this.forceUpdate(); // Rerender component with updated data
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
        <Route exact path='/' component={CustomerList} />
        <Route exact path='/customer/:customerId' component={CustomerDetails} />
      </Switch>
    </div>
  </HashRouter>
), document.getElementById('root'));
