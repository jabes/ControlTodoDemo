'use strict';

const Boom = require('boom');
const Auth = require('./auth');
const db = global.database;
const table = 'users';

const validationError = (key, message) => {
  const errors = [{key, message}];
  const validation = {errors};
  const error = Boom.badRequest(message, {validation});
  error.output.payload.validation = error.data.validation;
  return error;
};

class User {

  static safe(user) {
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
    };
  }

  static refreshToken(user) {
    return new Promise((resolve, reject) => {
      const safe = User.safe(user);
      user.token = Auth.generateToken(safe);
      db.update(table, user.id, user).then(resolve(user), reject);
    });
  }

  static get(id) {
    return db.get(table, id);
  }

  static byUsername(username) {
    return new Promise((resolve, reject) => {
      db
        .getAll(table, username, 'username')
        .then(response => {
          const user = response[0];
          resolve(user);
        }, reject);
    });
  }

  static create(username, password, full_name) {
    return new Promise((resolve, reject) => {
      User.byUsername(username).then(user => {
        if (user) reject(validationError('username', 'this username is taken'));
        const password_hash = Auth.hashPassword(password);
        const mock = {
          username,
          password_hash,
          full_name,
        };
        db.insert(table, mock).then(response => {
          const key = response.generated_keys[0];
          db.get(table, key).then(user => {
            User.refreshToken(user).then(resolve, reject);
          }, reject);
        }, reject);
      }, reject);
    });
  }

  static verify(username, password) {
    return new Promise((resolve, reject) => {
      User.byUsername(username).then(user => {
        if (user) {
          const valid = Auth.verifyPassword(password, user.password_hash);
          if (valid) resolve(user);
          else reject(validationError('password', 'password is not valid'));
        } else reject(validationError('username', 'username does not exist'));
      }, reject);
    });
  }

  static login(username, password) {
    return new Promise((resolve, reject) => {
      User.verify(username, password).then(user => {
        if (user.token) resolve(user);
        else User.refreshToken(user).then(resolve, reject);
      }, reject);
    });
  }

  static logout(id) {
    return db.update(table, id, {token: null});
  }

}

module.exports = User;
