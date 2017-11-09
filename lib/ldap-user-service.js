const LdapAuth = require('ldapauth-fork');

/**
 * LdapUserService Class
 *
 * @param {Object}   ldapConfig   ldap config object
 * @param {Function} [userMapper] mapping from LDAP user to cnpm User
 *
 * @constructor
 */
function LdapUserService(ldapConfig, userMapper) {
	if (!(this instanceof LdapUserService)) {
		return new LdapUserService(ldapConfig, userMapper);
	}
	this.client = new LdapAuth(ldapConfig);
	this.userMapper = userMapper;
}

const proto = LdapUserService.prototype;

/**
 * `authenticate` method wrapper of the instance of `ldapauth-fork`
 *
 * @param  {String} login    login name
 * @param  {String} password login password
 * @returns {function(*=)}
 * @private
 */
proto._authenticate = function (login, password) {
	return callback => {
		this.client.authenticate(login, password, callback);
	};
};

/**
 * `_findUser` method wrapper of the instance of `ldapauth-fork`
 *
 * @param login
 * @returns {function(*=)}
 * @private
 */
proto._findUser = function (login) {
	return callback => {
		this.client._findUser(login, callback);
	};
};

/**
 * Default cnpmjs user mapper from LDAP user
 *
 * @param {Object} ldapUser
 * @returns {Object} cnpm user data structure
 * @private
 */
proto._userMapper = function (ldapUser) {
	if (typeof this.userMapper === 'function') {
		return this.userMapper(ldapUser);
	}

	// Require parameters
	const currentUser = {
		login: ldapUser.uid || '',
		email: ldapUser.mail || ''
	};

	currentUser.name = ldapUser.displayName || currentUser.login;

	return currentUser;
};

/**
 * Auth user with login name and password
 *
 * @param  {String} login    login name
 * @param  {String} password login password
 * @returns {Object} cnpm user data structure
 */
proto.auth = function * (login, password) {
	const res = yield this._authenticate(login, password);

	if (res instanceof Error) {
		throw res;
	}

	return this._userMapper(res);
};

/**
 * Get user by login name
 * @param  {String} login  login name
 * @returns {Object} cnpm user data structure
 */
proto.get = function * (login) {
	const res = yield this._findUser(login);

	if (res instanceof Error) {
		throw res;
	}

	return this._userMapper(res);
};

/**
 * List users
 *
 * @param  {Array<String>} logins  login names
 * @return {Array<Object>}
 */
proto.list = function * (logins) {
	return yield logins.map(this.get.bind(this));
};

/**
 * Search users
 *
 * @param  {String} query  query keyword
 * @param  {Object} [options] optional query params
 *  - {Number} limit match users count, default is `20`
 * @returns {Array<User>} array of cnpm user data structure
 */
proto.search = function * (query, options) { // eslint-disable-line no-unused-vars
	throw yield new Error('not supported');
};

module.exports = LdapUserService;
