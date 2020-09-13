Create a minimal CRUD REST API to manage users, using express, resty and Sqlite3.<br/>

### Run the example

1. Get resty with `git clone git@github.com:kedoska/resty.git`
2. Move into the examples folder, `cd ./resty/examples/sqlite3`
3. Run `npm i`
4. Start the server with `npm start`

### Once server is started

This `express` server is configured by `resty` to expose the `user` resource as REST API.<br/>
The data is stored into the `./db/main.sqlite`, which is created at the first start.
The database schema is created once and it is so difined:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name text, 
  email text UNIQUE, 
  password text, 
  CONSTRAINT email_unique UNIQUE (email) 
)
```

### The CRUD API

* **C**reate a new user
```bash
curl -d \
'{"name":"Demo", "email":"demo@test.local", "password":"secret"}' \
-H "Content-Type: application/json" \
-X POST http://localhost:8080/v1/users
```

* **R**ead all the users
```bash
curl 'http://localhost:8080/v1/users'
```


* **U**pdate an user
```bash
# TODO
```

* **D**elete an user
```bash
# TODO
```
