![resty](https://user-images.githubusercontent.com/11739105/93143699-a8c8f380-f6a5-11ea-9cb2-bf1a7333f788.png)

![npm](https://img.shields.io/npm/v/@kedoska/resty?style=flat-square) ![NPM](https://img.shields.io/npm/l/@kedoska/resty?style=flat-square) <br/>

An NPM package for providing quick and dirty JSON CRUD REST API into your existing ExpressJS application servers.<br/>

```bash
npm install @kedoska/resty
```

### Key concept

 - Define CRUD operations on the data-adapter.
 - Built-in extractors for _pagination_ and _query_.

#### Define your resources
> Example: './resources/users'

```typescript
import resty, { Pagination, Query } from '@kedoska/resty'

export interface User {
  email: string
  username: string
}

const selectMany = (pagination: Pagination, query?: Query): Promise<User[]> =>
  new Promise((resolve, reject) => {
    try {
      resolve([])
    } catch ({message}) {
      reject(Error(`could not "select" the resources, ${message}`))
    }
  })

export default () => {
  return resty({
    version: 'v1',
    resource: 'users',
    dataAdapter: {
      // createOne,
      selectMany, 
      // selectOne, 
      // updateOne, 
      // deleteOne, 
      // deleteAll, 
    },
  })
}
```

#### Consume the resource
> Example: '.server.ts'

```typescript
// in your server
import express from 'express'
import users from './resources/users'

const app = express()
app.use(users())
app.listen(8080)

```

#### The Data Adapter

:warning: Everything is a `Promise`<br/>

Defines the data functions to mount the endpoints.<br/>
The following functions can be defined into the data-adapter and passed as argument.

 - createOne _(optional promise)_: creates the `post` endpoint.
 - selectMany _(optional promise)_: creates the `get` endpoint.
 - selectOne _(optional promise)_: creates the `get ID` endpoint.
 - updateOne _(optional promise)_: creates the `put ID` endpoint.
 - deleteOne _(optional promise)_: creates the `delete ID` endpoint.
 - deleteAll _(optional promise)_: creates the `delete` endpoint.

### selectMany

```typescript
  const users = resty({
    version: 'v1',
    resource: 'users',
    dataAdapter: {
      selectMany: () => new Promise((resolve) => resolve([]))
    },
  })

  const app = express()
  app.use(users)
```

The above server exposes the `GET` endpoint for the _Users_ resource, mounting the path `/v1/users`.<br/>
The data returned by the promise `selectMany`, an empty array in the example, is sent back as JSON response body.

### selectMany with default pagination

```typescript
  const users = resty({
    version: 'v1',
    resource: 'users',
    dataAdapter: {
      selectMany: (pagination) => new Promise((resolve) => {
        const {page, limit} = pagination
        // limit your data...
        resolve([])
      }
    },
  })

  const app = express()
  app.use(users)
```

`selectMany` receives the pagination data as the first parameter. `Limit` and `Page` are parsed from the Querystring.<br/>
Consider the below examples, the default pagination is very straightforward, the data coming from the query string is parsed and passed directly to the selectMany Function.

 * `curl https://localhost:8080?` becomes `{ limit: 0 page: 0 }`
 * `curl https://localhost:8080?limit=10&page=2` becomes `{ limit: 10 page: 2 }`
 * ...

### Examples
 - **(TS)** Copy/Paste Data Adapter Skeleton [gits](https://gist.github.com/kedoska/eab2179c0532df77892a59a158da77ef)
 - **(JS)** How to build a CRUD REST API using Express, resty and Sqlite3 [examples/sqllite3](https://github.com/kedoska/resty/tree/master/examples/sqlite3)

## Error Handling

The below example implements the `errorHandler` middleware from `'@kedoska/resty'` to catch the error sent by the `createOne` function.<br/>
The function handles eventual rejections coming from the data-adapter.<br/>

```typescript
// in your server
import express from 'express'
import resty, { errorHandler } from '@kedoska/resty'

const app = express()
app.use(
  resty({
    version: 'v1',
    resource: 'users',
    dataAdapter: {
      createOne: (resource: any) => new Promise((resolve, reject) => {
        reject(Error('Not Yet Implemented'))
      }),
    },
  })
)

app.use(errorHandler)
app.listen(8080)
```

The `post` endpoint created by `createOne` is `/v1/users/`.<br/>
It will fail, returning status `200 OK`, having the following body:<br/>

```json
{
  "message": "createOne not yet implemented"
}
```
