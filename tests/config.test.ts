import * as express from 'express'
import * as request from 'supertest'
import resty, { DataAdapter } from '../src'

const dataAdapter: DataAdapter = {}

const emptyRouter = resty({
  version: 'v1',
  resource: 'users',
  dataAdapter,
})

const app = express()
app.use(emptyRouter)

test('createOneHandler - error', function (done) {
  request(app).get('/v1/users').expect(404).end(done)
})

test('selectManyHandler - error', function (done) {
  request(app).post('/v1/users').expect(404).end(done)
})

test('selectOneHandler - error', function (done) {
  request(app).get('/v1/users/1').expect(404).end(done)
})

test('updateOneHandler - error', function (done) {
  request(app).put('/v1/users/1').expect(404).end(done)
})

test('deleteOneHandler - error', function (done) {
  request(app).delete('/v1/users/1').expect(404).end(done)
})

test('deleteAllHandler - error', function (done) {
  request(app).delete('/v1/users').expect(404).end(done)
})