import { Pagination, Query } from '../../src'

declare global {
  namespace Express {
    interface Request {
      dbPagination: Pagination
      dbQuery?: Query
      parsedResource: any
    }
  }
}
