import mysql from 'mysql';
import { mailService } from './mailservice';
import crypto from 'crypto';
crypto.DEFAULT_ENCODING = 'hex';
import moment from 'moment';

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

export { connection };

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

  getUserforEvent(id, i, callback) {
    connection.query('SELECT * FROM Users WHERE id=?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0], i);
    });
  }

  getSignedInUser() {
    let item = localStorage.getItem('loggedinUser'); // Get User-object from browser
    if(!item) return null;

    return JSON.parse(item);
  }

  addUser(fname, lname, adress, postalnumber, phonenumber, email, username, password, callback) {
    connection.query('INSERT INTO Users (firstName, lastName, adress, postalnumber, phonenumber, email, username, passw) values (?, ?, ?, ?, ?, ?, ?, ?)', [fname, lname, adress, postalnumber, phonenumber, email, username, password], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getUserbyMail(mail, callback) {
    connection.query('SELECT * FROM Users WHERE email=?', [mail], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getOtherUserbyMail(mail, userid, callback) {
    connection.query('SELECT * FROM Users WHERE email=? AND id <> ?', [mail, userid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getUserbyUsername(username, callback) {
    connection.query('SELECT * FROM Users WHERE username=?', [username], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    })
  }

  login(username, password, callback) {
    connection.query('SELECT * FROM Users WHERE (username=? AND passw=?)', [username, password], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  resetPassword(email, username, callback) {
    let newPassword = Math.random().toString(36).slice(-8);
    let cryptopw;


    crypto.pbkdf2(newPassword, 'RødeKors', 100, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;

      cryptopw = derivedKey;

      connection.query('UPDATE Users SET passw=? WHERE email=?', [cryptopw, email], (error, result) => {
        if (error) throw error;

        let subject = "Tilbakestilling av passord for " + username;
        let text = "Ditt nye passord er: " + newPassword;

        mailService.sendMail(email, subject, text);

        callback(result);
      });
    });
  }

  changePassword(id, newpw, callback) {
    connection.query('UPDATE Users SET passw=? WHERE id=?', [newpw, id], (error,result) => {
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

  editProfile(id, firstName, lastName, phonenumber, email, adress, postalnumber, callback) {
    connection.query('UPDATE Users SET firstName=?, lastName=?, phonenumber=?, email=?, adress=?, postalnumber=? WHERE id=?', [firstName, lastName, phonenumber, email, adress, postalnumber, id], (error,result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getCity(postalnumber, callback) {
    connection.query('SELECT poststed FROM Postnummerregister WHERE postnr = ?', [postalnumber], (error, result) => {
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

  deactivate(id, callback) {
    connection.query('UPDATE Users SET aktivert = ? WHERE id = ?', [false, id], (error, result) => {
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

  getUserSkills(userid, callback) {
    connection.query('SELECT * FROM user_skills where userid = ?', [userid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getConfirmedUsers(callback) {
    connection.query('SELECT * FROM Users WHERE aktivert = 1 ORDER BY vaktpoeng DESC', (error, result) => {
      if(error) throw error;

      callback(result);
    });
  }

  getStats(startDate, endDate, callback) {
    connection.query('SELECT event_rolle_id, Events.eventid, title, start, end, firstName, lastName FROM event_rolle, Events, Users WHERE event_rolle.eventid = Events.eventid AND Events.start >= ? AND Events.start <= ? AND event_rolle.userid = Users.id', [startDate, endDate], (error, result) => {
      if(error) throw error;

      callback(result);
    });
  }

  setPassiv(userid, start, end, callback) {
    connection.query('INSERT INTO passiv (userid, passivstart, passivend) values (?, ?, ?)', [userid, start, end], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  setEventPassiv(userid, start, end, callback) {
    connection.query('INSERT INTO passiv (userid, passivstart, passivend, event) values (?, ?, ?, ?)', [userid, start, end, false], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getPassiv(userid, callback) {
    connection.query('SELECT * FROM passiv WHERE userid = ?', [userid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getPassivNoEvent(userid, callback) {
    connection.query('SELECT * FROM passiv WHERE event = ? AND userid = ?', [false, userid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  deletePassiv(passivid, callback) {
    connection.query('DELETE FROM passiv WHERE passivid = ?', [passivid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  deleteEventPassiv(start, end, userid, callback) {
    let startDate = this.fixDate(start);
    let endDate = this.fixDate(end);

    connection.query('DELETE FROM passiv WHERE passivstart = ? AND passivend = ? AND event = ? AND userid = ?', [startDate, endDate, true, userid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  deleteAllEventPassiv(start, end, callback) {
    let startDate = this.fixDate(start);
    let endDate = this.fixDate(end);

    connection.query('DELETE FROM passiv WHERE passivstart = ? AND passivend = ? AND event = ?', [startDate, endDate, true], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getUserEventInfo(userid, eventid, callback) {
    connection.query('SELECT * FROM Users, Events, event_rolle, Roller WHERE event_rolle.userid = Users.id AND event_rolle.rolleid = Roller.rolleid AND event_rolle.eventid = Events.eventid AND userid = ? AND event_rolle.eventid = ?', [userid, eventid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  giveVaktpoeng(userid, dager, callback) {
    connection.query('UPDATE Users SET vaktpoeng = vaktpoeng + ? WHERE id = ?', [dager, userid], (error, result) => {
      if (error) throw error;

      callback();
    });
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

    let date = year + '-' + month + '-' + day;
    return(date);
  }
}

let userService = new UserService();

export { userService };
