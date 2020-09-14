import * as express from 'express'
import * as request from 'supertest'
import resty, { DataAdapter, RequestDataSource } from '../src'

interface User {
  name: string
}
let database: User[] = []

beforeAll(() => {
  database = []
})

const dataAdapter: DataAdapter = {
  createOne: (resource: User): Promise<User> =>
    new Promise((resolve) => {
      database.push(resource)
      resolve(resource)
    }),
}

const users = resty({
  version: 'v1',
  resource: 'users',
  dataAdapter,
})

const app = express()
app.use(users)

test('CREATE ONE', function (done) {
  const payload = { user: 'marco' }
  request(app)
    .post('/v1/users')
    .send(payload)
    .set('Accept', 'application/json')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      expect(res.body).toMatchObject(payload)
      expect(database.length).toBe(1)
      done()
    })
})
