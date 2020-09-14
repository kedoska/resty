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

test('GET ALL', function (done) {
  const dataAdapter: DataAdapter = {
    selectMany: (): Promise<User[]> =>
      new Promise((resolve) => {
        resolve(database)
      }),
  }

  const users = resty({
    version: 'v1',
    resource: 'users',
    dataAdapter,
  })

  const app = express()
  app.use(users)

  request(app)
    .get('/v1/users')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      expect(res.body).toMatchObject(database)
      done()
    })
})
