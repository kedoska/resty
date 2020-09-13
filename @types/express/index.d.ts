import { DataExtractor, Pagination, Query } from '../../src'

declare global {
  namespace Express {
    interface Request {
      dbResourceId: string
      dbPagination: Pagination
      dbQuery?: Query
      parsedResource: any
    }
  }
}
