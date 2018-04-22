import { connection } from './userservice.js';
import mysql from 'mysql';
import { mailService } from './mailservice';
import crypto from 'crypto';
crypto.DEFAULT_ENCODING = 'hex';
import moment from 'moment';

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
