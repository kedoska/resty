import * as express from 'express'
import * as request from 'supertest'
import { createOneHandler, errorHandler, RestOptions } from '../src'

const options: RestOptions = {
  version: 'v1',
  resource: 'test',
  dataAdapter: {},
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


test('GET ALL', function (done) {

  app.get('/', createOneHandler(options))
  app.use(errorHandler)

  request(app)
    .get('/')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err)
      expect(res.body.message).toBe('createOne not yet implemented')
      done()
    })
    
})
