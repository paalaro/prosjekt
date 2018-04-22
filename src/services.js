import mysql from 'mysql';
import { mailService } from './mail';
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

class EventService {
  getAllEvents(callback) {
    connection.query('SELECT * FROM Events', (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getUpcomingEvents(callback) {
    let today = new Date();

    connection.query('SELECT * FROM Events WHERE end >= ? ORDER BY start', [today], (error, result) => {
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

  getEventByEventRolleid(eventrolleid, callback) {
    connection.query('SELECT * FROM Events, event_rolle WHERE event_rolle.eventid = Events.eventid AND event_rolle_id = ?', [eventrolleid], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  createEvent(title, text, start, end, oppmote, adress, postalnumber, equipment, callback) {
    connection.query('INSERT INTO Events (title, text, start, end, oppmote, adress, postalnumber, equipment) values (?, ?, ?, ?, ?, ?, ?, ?)', [title, text, start, end, oppmote, adress, postalnumber, equipment], (error, result) => {
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

  getOldUserEventRoller(userid, callback) {
    let today = new Date();
    connection.query('SELECT * FROM event_rolle, Roller, Events WHERE event_rolle.rolleid = Roller.rolleid AND event_rolle.eventid = Events.eventid AND userid = ? AND Events.end <= ?', [userid, today], (error, result) => {
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

  getAllUsersByVaktpoeng(callback) {
    connection.query('SELECT * FROM Users ORDER BY vaktpoeng', (error, result) => {
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

  setRole(userid, eventrolleid, start, end, callback) {
    let timedate = new Date();
    connection.query('UPDATE event_rolle SET userid = ?, timecalled = ? WHERE event_rolle_id = ?', [userid, timedate, eventrolleid], (error, result) => {
      if (error) throw error;

      callback();
    });

    connection.query('INSERT INTO passiv (userid, passivstart, passivend, event) values (?, ?, ?, ?)', [userid, start, end, true], (error, result) => {
      if (error) throw error;
    });

    let startDate = start;
    let endDate = end;

    let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    let mins = seconds / 60;
    let hours = mins / 60;
    let days = hours / 24;
    console.log(Math.floor(days));

    // let dager = start.getDate();
    //
    // userService.giveVaktpoeng(userid)
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

  getVaktbytte(id, callback) {
    connection.query('SELECT * FROM vaktbytte WHERE id = ?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  }

  getAllVaktbytter(callback) {
    connection.query('SELECT vaktbytteid, Events.start, Events.end, event_rolle.eventid, a.id AS newUserid, b.id AS oldUserid, a.firstName AS newfirstName, a.lastName AS newlastName, b.firstName AS oldfirstName, b.lastName AS oldlastName, title, eventrolleid FROM Users a, Users b, event_rolle, vaktbytte, Events WHERE vaktbytte.newuserid = a.id AND vaktbytte.olduserid = b.id AND event_rolle.event_rolle_id = vaktbytte.eventrolleid AND event_rolle.eventid = Events.eventid AND adminOK = ?', [false], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  setVaktbytte(eventrolleid, olduserid, newuserid, callback) {
    connection.query('INSERT INTO vaktbytte (eventrolleid, olduserid, newuserid) values (?, ?, ?)', [eventrolleid, olduserid, newuserid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  confirmVaktbytte(userid, eventrolleid, start, end, callback) {
    let timedate = new Date();
    console.log(timedate);
    connection.query('UPDATE event_rolle SET userid = ?, timecalled = ?, timeconfirmed = ?, confirmed = ? WHERE event_rolle_id = ?', [userid, timedate, null, false, eventrolleid], (error, result) => {
      if (error) throw error;

      callback();
    });

    connection.query('INSERT INTO passiv (userid, passivstart, passivend, event) values (?, ?, ?, ?)', [userid, start, end, true], (error, result) => {
      if (error) throw error;
    });
  }

  deleteVaktbytte(vaktbyttid, callback) {
    connection.query('DELETE FROM vaktbytte WHERE vaktbytteid = ?', [vaktbytteid], (error, result) => {
      if (error) throw error;

      callback();
    });
  }

  setVaktbytteConfirmed(vaktbytteid, callback) {
    connection.query('UPDATE vaktbytte SET adminOK = ? WHERE vaktbytteid = ?', [true, vaktbytteid], (error, result) =>  {
      if (error) throw error;

      callback();
    });
  }

  getPoints(callback) {
    let today = new Date();
    connection.query('SELECT * FROM event_rolle, Events WHERE event_rolle.eventid = Events.eventid AND Events.end < ? AND userid IS NOT NULL AND pointsgiven = ?', [today, false], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  givePoints(userid, hours, eventrolleid, callback) {
    connection.query('UPDATE Users SET vaktpoeng = vaktpoeng + ? WHERE id = ?', [hours, userid], (error, result) => {
      if (error) throw error;

      callback();
    });

    console.log(eventrolleid);

    connection.query('UPDATE event_rolle SET pointsgiven = ? WHERE event_rolle_id = ?', [true, eventrolleid], (error, result) => {
      if (error) throw error;
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
