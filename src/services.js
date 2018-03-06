import mysql from 'mysql';
import { mailService } from './mail';

// Setup database server reconnection when server timeouts connection:
let connection;
function connect() {
  connection = mysql.createConnection({
    host: 'mysql.stud.iie.ntnu.no',
    user: 'g_oops_28',
    password: '1hhRtK1v',
    database: 'g_oops_28'
  });

  // Connect to MySQL-server
  connection.connect((error) => {
    if (error) throw error; // If error, show error in console and return from this function
  });

  // Add connection error handler
  connection.on('error', (error) => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') { // Reconnect if connection to server is lost
      connect();
    }
    else {
      throw error;
    }
  });
}
connect();

// Class that performs database queries related to customers
class UserService {
  getUsers(callback) {
    connection.query('SELECT * FROM Users', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getUser(id, callback) {
    connection.query('SELECT * FROM Users WHERE id=?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  addUser(fname, lname, city, adress, postalnumber, phonenumber, email, username, password, callback) {
    connection.query('INSERT INTO Users (firstName, lastName, city, adress, postalnumber, phonenumber, email, username, password) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [fname, lname, city, adress, postalnumber, phonenumber, email, username, password], (error, result) => {
      if (error) throw error;

      else {
        console.log(fname + " " + lname + " is registered.");
      }

      callback();
    });
  }

  getUserbyMail(mail, callback) {
    connection.query('SELECT * FROM Users WHERE email=?', [mail], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    })
  }

  login(username, password, callback) {
    connection.query('SELECT * FROM Users WHERE (username=? AND password=?)', [username, password], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  resetPassword(email, username, callback) {
    var newPassword = Math.random().toString(36).slice(-8);

    connection.query('UPDATE Users SET password=? WHERE email=?', [newPassword, email], (error, result) => {
      if (error) throw error;

      let subject = "Password reset for " + username;
      let text = "Your new password is: " + newPassword;

      mailService.sendMail(email, subject, text);

      callback(result, subject, text, email);
    });
  }

  changePassword(id, newpw, callback) {
    connection.query('UPDATE Users SET password=? WHERE id=?', [newpw, id], (error,result) => {
      if (error) throw error;

      callback(result);
    });
  }

  setPassword(id, newpw, callback) {
    connection.query('UPDATE Users SET password = ? WHERE id = ?', [newpw, id], (error, result) => {
      if (error) throw error;

      callback(result);
    })
  }

  editProfile(id, firstName, lastName, phonenumber, email, adress, postalnumber, city, callback) {
    connection.query('UPDATE Users SET firstName=?, lastName=?, phonenumber=?, email=?, adress=?, postalnumber=?, city=? WHERE id=?', [firstName, lastName, phonenumber, email, adress, postalnumber, city, id], (error,result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getCity(postalnumber, callback) {
    connection.query('SELECT Poststed FROM Postnummerregister  WHERE Postnummer = ?', [postalnumber], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getUnconfirmedUsers(callback) {
    connection.query('SELECT * FROM Users WHERE aktivert = ?', [false], (error, result) => {
      if (error) throw error;

      callback(result);
    })
  }

  confirm(id, callback) {
    connection.query('UPDATE Users SET aktivert = ? WHERE id = ?', [true, id], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  confirmAll(callback) {
    connection.query('UPDATE Users SET aktivert = ?', [true], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  searchUser(input, callback) {
    connection.query('SELECT * FROM Users WHERE CONCAT(firstName, " ", lastName) LIKE "%"?"%" OR CONCAT(lastName, " ", firstName) LIKE "%"?"%"', [input, input], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }
}

let userService = new UserService();

export { userService };

class EventService {
  getAllEvents(callback) {
    connection.query('SELECT * FROM Events', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getEvent(id, callback) {
    connection.query('SELECT * FROM Events WHERE id = ?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }
}

let eventService = new EventService();

export { eventService };
