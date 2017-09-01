'use strict';

const Auth = require('./auth');
const Response = require('./response');
const db = global.database;
const table = 'users';

class User {

  static get(username) {
    return new Promise((resolve, reject) => {
      db
        .getAll(table, username, 'username')
        .then(response => {
          const user = response[0];
          resolve(user);
        }, reject);
    });
  }

  static create(username, password) {
    return new Promise((resolve, reject) => {
      User.get(username)
        .then(user => {
          if (user) Response.throwValidationError(reject, 'username', 'this username is taken');
          const uuid = Auth.generateUUID();
          const token = Auth.generateToken(uuid);
          const hash = Auth.hashPassword(password);
          const data = {
            id: uuid,
            token: token,
            username: username,
            password_hash: hash,
          };
          db
            .insert(table, data)
            .then(resolve(data), reject);
        }, reject);
    });
  }

  static refreshToken(user) {
    return new Promise((resolve, reject) => {
      user.token = Auth.generateToken(user.id);
      db
        .update(table, user.id, user)
        .then(resolve(user), reject);
    });
  }

  static login(username, password) {
    return new Promise((resolve, reject) => {
      User.get(username)
        .then(user => {
          if (user) {
            const valid = Auth.verifyPassword(password, user.password_hash);
            if (valid) {
              User.refreshToken(user)
                .then(user => resolve(user), reject);
            } else Response.throwValidationError(reject, 'password', 'password is not valid');
          } else Response.throwValidationError(reject, 'username', 'username does not exist');
        }, reject);
    });
  }

}

module.exports = User;
