# cnpm-ldap-user-service
> LDAP user service for [cnpmjs.org](https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization)

[![XO code style][xo-image]][xo-url]
[![NPM version][npm-image]][npm-url]
[![NPM download][npm-download]][npm-url]
[![Gittip][gittip-image]][gittip-url]

## Install

```bash
$ npm install cnpm-ldap-user-service --save
```

## Example
Set `userService` on your [config/config.js](https://github.com/cnpm/cnpmjs.org/blob/master/config/index.js)

```js
var LdapUserService = require('cnpm-ldap-user-service');

module.exports = {
  // input your custom config here
  admin: {
    'admin': 'admin@cnpmjs.org'
  },
  // enable private mode, only admin can publish, other use just can sync package from source npm
  enablePrivate: false,

  // registry scopes, if don't set, means do not support scopes
  scopes: [
    '@lnpm',
  ],

  // redirect @cnpm/private-package => private-package
  // forward compatbility for update from lower version cnpmjs.org
  adaptScope: true,

  // force user publish with scope
  // but admins still can publish without scope
  forcePublishWithScope: true,
  
  // your ldap user service
  userService: new LdapUserService({
    url: 'ldaps://ldap.example.org:636',
    bindDN: 'uid=myadminusername,ou=users,dc=example,dc=org',
    bindCredentials: 'mypassword',
    searchBase: 'ou=users,dc=example,dc=org',
    searchFilter: '(uid={{username}})',
    reconnect: true
  })  
};
```

## API
`new LdapUserService(ldapConfig, userMapper)`

Returns: instance of `LdapUserService`

**Arguments**
- `ldapConfig`: **(required)** pass the [`LdapAuth` Config Object](https://github.com/vesse/node-ldapauth-fork#ldapauth-config-options) 
- `userMapper`: (optional) custom user mapper function

By default, internal `userMapper` bound three properties like below.  

- `login` property is bound to `uid` attribute
- `email` property is bound to `mail` attribute
- `name` property is bound to `displayName` attribute

If you want to change the default, you can pass the `userMapper` function like below.

```js
var LdapUserService = require('cnpm-ldap-user-service');

module.exports = {
  // input your custom config here
  admins: {
    'admin': 'admin@cnpmjs.org'
  },
  // ...
  userService: new LdapUserService({
    url: 'ldaps://ldap.example.org:636',
    bindDN: 'uid=myadminusername,ou=users,dc=example,dc=org',
    bindCredentials: 'mypassword',
    searchBase: 'ou=users,dc=example,dc=org',
    searchFilter: '(uid={{username}})',
    reconnect: true
  }, (ldapUser) => {
    // TODO: return your own authorization object using `ldapUser`
    // TODO: (https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization)
    return {
      login: ldapUser.uid,
      email: ldapUser.mail,
      name: ldapUser.displayName,
      site_admin: this.admins[ldapUser.uid] === ldapUser.email
    }
  })  
};
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/kyungw00k/cnpm-ldap-user-service/issues)

## License
[MIT](https://kyungw00k.mit-license.org/)

[npm]: https://npmjs.org
[npm-url]: https://npmjs.org/package/cnpm-ldap-user-service
[npm-image]: https://img.shields.io/npm/v/cnpm-ldap-user-service.svg?style=flat-square
[npm-download]: https://img.shields.io/npm/dm/cnpm-ldap-user-service.svg?style=flat-square
[xo-image]: https://img.shields.io/badge/code_style-XO-5ed9c7.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo
[gittip-image]: https://img.shields.io/gittip/kyungw00k.svg?style=flat-square
[gittip-url]: https://gratipay.com/~kyungw00k/
