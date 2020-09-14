Create a minimal CRUD REST API to manage users, using express, resty and Sqlite3.<br/>

## Run the example

### Build resty locally first

1. Get _resty_ with `git clone git@github.com:kedoska/resty.git`
2. Move in to the _resty_ folder `cd ./resty/`
3. Install _resty_ dependencies `npm i`
4. Build _resty_ locally `npm run build`

### Start the local server

5. Move in to the example folder, `cd ./examples/sqlite3`
3. Run `npm i`
4. Start the server with `npm start`

### Once server is started

This example `express` server is configured by _resty_ to expose the `user` resource as REST API.<br/>
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
curl -d \
'{"name":"Demo", "email":"demo@test.local", "password":"biggest-secret"}' \
-H "Content-Type: application/json" \
-X PUT http://localhost:8080/v1/users/1
```

* **D**elete an user
```bash
curl -X DELETE http://localhost:8080/v1/users/1
```
