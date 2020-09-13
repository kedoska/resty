import { normalize } from 'path'
import { Router, Request, Response, NextFunction, json, urlencoded } from 'express'

export interface Pagination {
  limit: number
  itemPerPage: number
  page: number
}

export const pagination = (payload: any = { pagination: {} }): Pagination => {
  const { limit = 1, itemPerPage = 10, page = 0 } = payload || {}
  return {
    limit,
    itemPerPage,
    page,
  }
}

export enum Filter {
  '(String) Contains' = 'stringContains',
  '(String) Does not contain' = 'stringDoesNotContain',
  '(String) Exactly matches' = 'stringExactlyMatches',
  '(String) Does not exactly match' = 'stringDoesNotExactlyMatch',
  '(String) Starts with' = 'stringStartsWith',
  '(String) Does not start with' = 'stringDoesNotStartWith',
  '(String) Ends with' = 'stringEndsWith',
  '(String) Does not end with' = 'stringDoesNotEndWith',
  '(Number) Greater than' = 'numberGreaterThan',
  '(Number) Less than' = 'numberLessThan',
  '(Number) Equals' = 'numberEquals',
  '(Number) Does not equal' = 'numberDoesNotEqual',
  '(Date/time) After' = 'dateTimeAfter',
  '(Date/time) Before' = 'dateTimeBefore',
  '(Date/time) Equals' = 'dateTimeEquals',
  '(Boolean) Is true' = 'booleanTrue',
  '(Boolean) Is false' = 'booleanFalse',
  'Exists' = 'exists',
  'Does not exist' = 'doesNotExist',
}

export interface Condition {
  field: string
  value: any
  condition: Condition
}

export interface Query {
  conditions?: Condition[]
}

export type DataExtractor = (payload: any) => any

export type QueryExtractor = (payload: any) => Query

export type PaginationExtractor = (payload: any) => Pagination

export type CreateOneFn = (resourceName: string, resource: any) => Promise<any>
export type SelectOneFn = (resourceName: string, id: string) => Promise<any>
export type UpdateOneFn = (resourceName: string, id: string, resource: any) => Promise<any>
export type DeleteOneFn = (resourceName: string, id: string) => Promise<any>
export type deleteAllFn = (resourceName: string) => Promise<any[]>

export type selectAll = (resourceName: string) => Promise<any[]>
export type selectWithQuery = (resourceName: string, query?: Query) => Promise<any[]>
export type selectWithQueryAndPagination = (
  resourceName: string,
  pagination: Pagination,
  query?: Query,
) => Promise<any[]>

export type selectManyFn = selectAll | selectWithQuery | selectWithQueryAndPagination

export interface DataAdapter {
  createOne?: CreateOneFn
  selectOne?: SelectOneFn
  updateOne?: UpdateOneFn
  deleteOne?: DeleteOneFn
  deleteAll?: deleteAllFn
  selectMany?: selectManyFn
}

export enum RequestDataSource {
  Body = 'body',
  Params = 'params',
  Query = 'query',
  Headers = 'headers',
}

export interface RestOptions {
  version: string
  parent?: string
  resourceName: string
  parser?: {
    extractor: DataExtractor
    source: RequestDataSource
  }
  pagination?: {
    extractor: PaginationExtractor
    source: RequestDataSource
  }
  query?: {
    extractor: QueryExtractor
    source: RequestDataSource
  }
  dataAdapter: DataAdapter
}

export default (options: RestOptions): Router => {
  const router = Router()
  router.use(json())
  router.use(urlencoded({ extended: false }))

  const parent = !options.parent ? '/' : options.parent
  const path = normalize(`${parent}/${options.version}/${options.resourceName}`)

  router.use((req, res, next) => {
    try {
      let paginationExtractorSource: RequestDataSource = RequestDataSource.Query
      let paginationExtractor: PaginationExtractor = pagination
      if (options.pagination) {
        paginationExtractorSource = options.pagination.source
        paginationExtractor = options.pagination.extractor
      }
      req.dbPagination = paginationExtractor(req[paginationExtractorSource])

      if (options.query) {
        const queryExtractorSource = options.query.source || RequestDataSource.Query
        req.dbQuery = options.query.extractor(req[queryExtractorSource])
      }

      if (req.method === 'POST' && options.parser) {
        req.parsedResource = options.parser.extractor(req[options.parser.source])
      }

      req.dbResourceId = req.params.id || ''
      next()
    } catch (error) {
      next(error)
    }
  })

  router.get(`${path}`, async (req, res, next) => {
    if (!options.dataAdapter.selectMany) {
      next(new Error(`selectMany not yet implemented`))
      return
    }

    try {
      res.send(await options.dataAdapter.selectMany(options.resourceName, req.dbPagination, req.dbQuery))
    } catch ({ message }) {
      next(new Error(`could not get the resources, ${message}`))
    }
  })

  router.delete(`${path}`, async (req, res, next) => {
    if (!options.dataAdapter.deleteAll) {
      next(new Error(`deleteAll not yet implemented`))
      return
    }

    try {
      res.send(await options.dataAdapter.deleteAll(options.resourceName))
    } catch ({ message }) {
      next(new Error(`could not get the resources, ${message}`))
    }
  })

  router.get(`${path}/:id`, async (req, res, next) => {
    if (!options.dataAdapter.selectOne) {
      next(new Error(`selectOne not yet implemented`))
      return
    }
    try {
      res.send(res.send(await options.dataAdapter.selectOne(options.resourceName, req.dbResourceId)))
    } catch ({ message }) {
      next(new Error(`could not get the resources, ${message}`))
    }
  })

  router.post(`${path}`, async (req, res, next) => {
    if (!options.dataAdapter.createOne) {
      next(new Error(`createOne not yet implemented`))
      return
    }

    try {
      res.send(await options.dataAdapter.createOne(options.resourceName, req.parsedResource || req.body))
    } catch ({ message }) {
      next(new Error(`could not create the new resource, ${message}`))
    }
  })

  router.delete(`${path}/:id`, async (req, res, next) => {
    if (!options.dataAdapter.deleteOne) {
      next(new Error(`deleteOne not yet implemented`))
      return
    }
    try {
      res.send(res.send(await options.dataAdapter.deleteOne(options.resourceName, req.dbResourceId)))
    } catch ({ message }) {
      next(new Error(`could not delete the resource "${req.dbResourceId}", ${message}`))
    }
  })

  router.put(`${path}/:id`, async (req, res, next) => {
    if (!options.dataAdapter.updateOne) {
      next(new Error(`updateOne not yet implemented`))
      return
    }
    try {
      res.send(
        await options.dataAdapter.updateOne(options.resourceName, req.dbResourceId, req.parsedResource || req.body),
      )
    } catch ({ message }) {
      next(new Error(`could not update the resource "${req.dbResourceId}", ${message}`))
    }
  })

  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      })
      return
    }
    next()
  })

  return router
}
