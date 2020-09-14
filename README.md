resty
=====

An NPM package for providing quick and dirty JSON CRUD REST API into your existing ExpressJS application servers.

### Key concept

#### The Data Adapter
Defines the data functions to mount the endpoints.<br/>
The following functions can be defined into the data-adapter and passed as argument.

 - createOne _(optional promise)_: creates the `post` endpoint.
 - selectMany _(optional promise)_: creates the `get` endpoint.
 - selectOne _(optional promise)_: creates the `get ID` endpoint.
 - updateOne _(optional promise)_: creates the `put ID` endpoint.
 - deleteOne _(optional promise)_: creates the `delete ID` endpoint.
 - deleteAll _(optional promise)_: creates the `delete` endpoint.

### Examples

 - How to build a CRUD REST API using Express, resty and Sqlite3 [exmaples/sqllite3](https://)?
