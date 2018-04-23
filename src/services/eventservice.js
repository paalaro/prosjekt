import { connection } from './userservice.js';
import mysql from 'mysql';
import { mailService } from './mailservice';
import crypto from 'crypto';
crypto.DEFAULT_ENCODING = 'hex';
import moment from 'moment';

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

  createEvent(title, text, start, end, oppmote, adress, postalnumber, equipment, contactperson, contactphone, callback) {
    connection.query('INSERT INTO Events (title, text, start, end, oppmote, adress, postalnumber, equipment, contact, phone) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, text, start, end, oppmote, adress, postalnumber, equipment, contactperson, contactphone], (error, result) => {
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

  getUpcomingUserEventRoller(userid, callback) {
    let today = new Date();
    connection.query('SELECT * FROM event_rolle, Roller, Events WHERE event_rolle.rolleid = Roller.rolleid AND event_rolle.eventid = Events.eventid AND userid = ? AND end >= ?', [userid, today], (error, result) => {
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
    connection.query('SELECT event_rolle_id, userid, eventid, rollenavn, event_rolle.rolleid, COUNT(skillid) as antall FROM ((Roller LEFT JOIN event_rolle ON event_rolle.rolleid = Roller.rolleid) LEFT JOIN roller_skills ON roller_skills.rolleid = event_rolle.rolleid) WHERE event_rolle.userid IS NULL AND event_rolle.eventid = ? GROUP BY event_rolle_id ORDER BY `antall` DESC', [eventid], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getEventRollerwithnoUser(eventid, callback) {
    connection.query('SELECT * FROM event_rolle, Roller WHERE event_rolle.rolleid = Roller.rolleid AND eventid = ?', [eventid], (error, result) => {
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
    connection.query('SELECT * FROM interesse, Users WHERE interesse.userid = Users.id AND eventid = ? AND Users.aktivert = ? ORDER BY vaktpoeng DESC', [eventid, true], (error, result) => {
      if (error) throw error;

      callback(result);
    });
  }

  getAllUsersByVaktpoeng(callback) {
    connection.query('SELECT * FROM Users WHERE aktivert = ? ORDER BY vaktpoeng', [true], (error, result) => {
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

  getUsersSkillsofRoles(rolleid, userid, date, callback) {
    connection.query('SELECT COUNT(*) AS antall, userid FROM user_skills, roller_skills WHERE user_skills.skillid = roller_skills.skillid and rolleid = ? AND userid = ? AND (validto > ? OR validto IS NULL)', [rolleid, userid, date, null], (error, result) => {
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

    connection.query('UPDATE event_rolle SET pointsgiven = ? WHERE event_rolle_id = ?', [true, eventrolleid], (error, result) => {
      if (error) throw error;
    });
  }
}

let eventService = new EventService();

export { eventService };
