const app = require('express')()
const resty = require('../../lib')
const db = require('./database.js')('./db/main.sqlite')

app.use(
  resty.default({
    version: 'v1',
    resource: 'users',
    dataAdapter: {
      /**
       * selectMany creates the GET /v1/users route.
       */
      selectMany: () =>
        new Promise((resolve, reject) => {
          const sql = 'select * from users'
          const params = []
          db.all(sql, params, (err, rows) => {
            if (err) {
              return reject(err)
            }
            resolve(rows)
          })
        }),
      /**
       * selectMany creates the POST /v1/users route.
       * resource:any, contains the JSON payload coming from the request body.
       */
      createOne: (resouce) =>
        new Promise((resolve, reject) => {
          const sql = 'INSERT INTO users (name, email, password) VALUES (?,?,?)'
          const params = [resouce.name, resouce.email, resouce.password]
          db.run(sql, params, function (err, result) {
            if (err) {
              return reject(err)
            }
            const { lastID: id } = this
            resolve({ ...resouce, id })
          })
        }),
      /**
       * updateOne creates the PUT /v1/users/:id route.
       * id: string, contains the resource id.
       * resource:any, contains the JSON payload coming from the request body.
       */
      updateOne: (id, resource) =>
        new Promise((resolve, reject) => {
          const sql = 'UPDATE users SET name = ?, password = ? WHERE id = ?'
          const params = [resource.name, resource.password, id]
          db.run(sql, params, function (err, result) {
            if (err) {
              return reject(err)
            }
            resolve(resource)
          })
        }),
      /**
       * deleteOne creates the DELETE /v1/users/:id route.
       */
      deleteOne: (id) =>
        new Promise((resolve, reject) => {
          const sql = 'DELETE FROM users WHERE id=?'
          const params = [id]
          db.run(sql, params, function (err, result) {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        }),
    },
  }),
)

app.listen(8080, () => console.log('started...'))
