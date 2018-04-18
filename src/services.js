import mysql from 'mysql';
import { mailService } from './mail';
import crypto from 'crypto';
crypto.DEFAULT_ENCODING = 'hex';

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

        callback(result, subject, text, email);
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

  setPassiv(userid, start, end, callback) {
    connection.query('INSERT INTO passiv (userid, passivstart, passivend) values (?, ?, ?)', [userid, start, end], (error, result) => {
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
    connection.query('SELECT * FROM Events WHERE eventid = ?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  createEvent(title, text, start, end, adress, postalnumber, callback) {
    connection.query('INSERT INTO Events (title, text, start, end, adress, postalnumber) values (?, ?, ?, ?, ?, ?)', [title, text, start, end, adress, postalnumber], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  editEvent(eventid, title, text, start, end, adress, postalnumber, callback) {
    connection.query('UPDATE Events SET title = ?, text = ?, start = ?, end = ?, adress = ?, postalnumber = ? WHERE eventid = ?', [title, text, start, end, adress, postalnumber, eventid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getVaktbytte(id, callback) {
    connection.query('SELECT * FROM foresporsel WHERE id = ?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getVaktmaler(callback) {
    connection.query('SELECT * FROM vaktmal', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getRoller(vaktmalid, callback) {
    connection.query('SELECT * FROM vakt_rolle WHERE vaktmalid = ?', [vaktmalid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getRolle(rolleid, callback) {
    connection.query('SELECT * FROM Roller WHERE rolleid = ?', [rolleid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getAllRoller(callback) {
    connection.query('SELECT * FROM Roller', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getEventRoller(eventid, callback) {
    connection.query('SELECT * FROM event_rolle, Roller, Users WHERE event_rolle.rolleid = Roller.rolleid AND event_rolle.userid = Users.id AND eventid = ?', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getUserEventRoller(userid, callback) {
    connection.query('SELECT * FROM event_rolle, Roller, Events WHERE event_rolle.rolleid = Roller.rolleid AND event_rolle.eventid = Events.eventid AND userid = ?', [userid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getEventRollernoUser(eventid, callback) {
    connection.query('SELECT event_rolle_id, userid, eventid, rollenavn, event_rolle.rolleid, COUNT(skillid) as antall FROM event_rolle, Roller, roller_skills WHERE event_rolle.rolleid = Roller.rolleid AND event_rolle.rolleid = roller_skills.rolleid AND event_rolle.userid IS NULL AND event_rolle.eventid = ? GROUP BY event_rolle_id ORDER BY `antall` DESC', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getEventRolle(eventid, rolleid, callback) {
    connection.query('SELECT * FROM event_rolle, Roller WHERE event_rolle.rolleid = Roller.rolleid AND eventid = ? AND event_rolle.rolleid = ?', [eventid, rolleid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  deleteEventRolle(eventrolleid, callback) {
    connection.query('DELETE FROM event_rolle WHERE event_rolle_id = ?', [eventrolleid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  regRolle(eventid, rolleid, callback) {
    connection.query('INSERT INTO event_rolle (eventid, rolleid) values (?, ?)', [eventid, rolleid, callback], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  countRoller(callback) {
    connection.query('SELECT * FROM Roller', (error, result) => {
      if (error) throw error;

      callback(result.length);
    });
  }

  testRolle(eventid, rolleid, callback) {
    connection.query('SELECT event_rolle.rolleid, event_rolle_id FROM event_rolle, Roller WHERE event_rolle.rolleid = Roller.rolleid AND eventid = ? AND event_rolle.rolleid = ?', [eventid, rolleid], (error, result) => {
      if (error) throw error;

      callback(result, rolleid);
    });
  }

  getInterest(eventid, userid, callback) {
    connection.query('SELECT * FROM interesse WHERE eventid = ? AND userid = ?', [eventid, userid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getInterestedUsers(eventid, callback) {
    connection.query('SELECT * FROM interesse, Users WHERE interesse.userid = Users.id AND eventid = ? ORDER BY vaktpoeng DESC', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  setInterest(eventid, userid, callback) {
    connection.query('INSERT INTO interesse (eventid, userid) values (?, ?)', [eventid, userid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  removeInterest(eventid, userid, callback) {
    connection.query('DELETE FROM interesse WHERE eventid = ? AND userid = ?', [eventid, userid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getUsersSkillsofRoles(rolleid, userid, callback) {
    connection.query('SELECT COUNT(*) AS antall, userid FROM user_skills, roller_skills WHERE user_skills.skillid = roller_skills.skillid and rolleid = ? AND userid = ?', [rolleid, userid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  setRole(userid, eventrolleid, callback) {
    let timedate = new Date();
    connection.query('UPDATE event_rolle SET userid = ?, timecalled = ? WHERE event_rolle_id = ?', [userid, timedate, eventrolleid], (error, result) => {
      if (error) throw error;

      callback();
    })
  }

  emptyEventRoles(eventid, callback) {
    connection.query('UPDATE event_rolle SET userid = ?, timeconfirmed = ?, confirmed = ?  WHERE eventid = ?', [null, null, false, eventid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  confirmRoleEvent(eventrolleid, callback) {
    let timedate = new Date();
    connection.query('UPDATE event_rolle SET confirmed = ?, timeconfirmed = ? WHERE event_rolle_id = ?', [true, timedate, eventrolleid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  getUsedUsers(eventid, callback) {
    connection.query('SELECT userid FROM event_rolle WHERE eventid = ? AND userid IS NOT NULL', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    })
  }

  getUsedEventRoles(eventid, callback) {
    connection.query('SELECT event_rolle_id FROM event_rolle WHERE eventid = ? AND userid IS NOT NULL', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    })
  }

  checkUserRole(eventid, userid, callback) {
    connection.query('SELECT * FROM event_rolle WHERE eventid = ? AND userid = ?', [eventid, userid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  checkUserRoleById(eventrolleid, callback) {
    connection.query('SELECT * FROM event_rolle WHERE event_rolle_id = ?', [eventrolleid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  checkRole(eventid, callback) {
    connection.query('SELECT * FROM event_rolle WHERE eventid = ?', [eventid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getEmptyRoles(eventid, callback) {
    connection.query('SELECT * FROM event_rolle WHERE eventid = ? AND userid IS NULL', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }
}

let eventService = new EventService();

export { eventService };

class SkillService {
  getAllSkills(callback) {
    connection.query('SELECT * FROM Skills ORDER BY skilltitle', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  addSkills(userid, skillid, validto, callback) {
    connection.query('INSERT INTO user_skills (userid, skillid, validto) values (?, ?, ?)', [userid, skillid, validto], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  checkUserSkill(userid, skillid, callback) {
    connection.query('SELECT * FROM user_skills WHERE userid = ? AND skillid = ?', [userid, skillid, callback], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getSkillInfo(skillid, callback) {
    connection.query('SELECT * FROM Skills WHERE skillid = ?', [skillid, callback], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getUserSkills(userid, callback) {
    connection.query('SELECT * FROM Skills, user_skills WHERE user_skills.skillid = Skills.skillid AND user_skills.userid = ? ORDER BY validto', [userid, callback], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getAllUserSkills(callback) {
    connection.query('SELECT * FROM user_skills', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  deleteSkill(userid, skillid, callback) {
    connection.query('DELETE FROM user_skills WHERE (userid = ? AND skillid = ?)', [userid, skillid, callback], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  checkOldSkills(date, callback) {
    connection.query('DELETE FROM user_skills WHERE validto < ?', [date], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  countRoleReq(callback) {
    connection.query('SELECT COUNT(*) AS antallskills, rolleid FROM roller_skills GROUP BY rolleid', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }
}

let skillService = new SkillService();

export { skillService };
