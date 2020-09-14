import * as express from 'express'
import * as request from 'supertest'
import resty, { DataAdapter, Pagination } from '../src'

interface User {
  name: string
}
let database: User[] = []

beforeAll(() => {
  database = []
  for (let i = 0; i < 100; i++) {
    database.push({name: `demo${i}`})
  }
})

const dataAdapter: DataAdapter = {
  selectMany: (pagination: Pagination): Promise<User[]> =>
    new Promise((resolve) => {
      const page = pagination.page <=0 ? 0 : pagination.page -1
      const start = page * pagination.limit
      const end = start + pagination.limit
      const data = database.slice(start, end)
      resolve(data)
    }),
}

const users = resty({
  version: 'v1',
  resource: 'users',
  dataAdapter,
})

const app = express()
app.use(users)

test('GET With Pagination (no page)', function (done) {
  request(app)
    .get('/v1/users?limit=2')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      const data = res.body as User[]
      expect(data.length).toBe(2)
      expect(data[0]).toMatchObject(database[0])
      expect(data[1]).toMatchObject(database[1])
      done()
    })
})

test('GET With Pagination (page 1)', function (done) {
  request(app)
    .get('/v1/users?limit=2&page=1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      const data = res.body as User[]
      expect(data.length).toBe(2)
      expect(data[0]).toMatchObject(database[0])
      expect(data[1]).toMatchObject(database[1])
      done()
    })
})

test('GET With Pagination (page 2)', function (done) {
  request(app)
    .get('/v1/users?limit=2&page=2')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      const data = res.body as User[]
      expect(data.length).toBe(2)
      expect(data[0]).toMatchObject(database[2])
      expect(data[1]).toMatchObject(database[3])
      done()
    })
})
