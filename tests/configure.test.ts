import * as express from 'express'
import * as request from 'supertest'
import resty, { DataAdapter } from '../src'

let numbersInDatabase: number[] = []

beforeAll(() => {
  numbersInDatabase = []
})

const dataAdapter: DataAdapter = {
  selectMany: (resourceName: string): Promise<number[]> =>
    new Promise((resolve) => {
      resolve(numbersInDatabase)
    }),
}

describe('minimal configuration (numbers example)', () => {
  const numbers = resty({
    version: 'v1',
    resourceName: 'numbers',
    dataAdapter,
  })

  const app = express()
  app.use(numbers)

  it('GET ALL should be accessible', function (done) {
    request(app)
      .get('/v1/numbers')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject(numbersInDatabase)
        done()
      })
  })
})
