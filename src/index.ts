import { normalize } from 'path'
import { Router, Request, Response, NextFunction, json, urlencoded } from 'express'

export interface Pagination {
  limit: number
  page: number
}

export const pagination = (payload: any = { pagination: {} }): Pagination => {
  const { limit = '0', page = '0' } = payload || {}
  return {
    limit: Number.parseInt(limit, 0),
    page: Number.parseInt(page, 0),
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

export type CreateOneFn = (resource: any) => Promise<any>
export type SelectOneFn = (id: string) => Promise<any>
export type UpdateOneFn = (id: string, resource: any) => Promise<any>
export type DeleteOneFn = (id: string) => Promise<void>
export type deleteAllFn = () => Promise<any[]>

export type selectAll = () => Promise<any[]>
export type selectWithQuery = (query?: Query) => Promise<any[]>
export type selectWithQueryAndPagination = (pagination: Pagination, query?: Query) => Promise<any[]>

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
  resource: string
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

export const createOneHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.createOne) {
    next(new Error(`createOne not yet implemented`))
    return
  }

  try {
    res.send(await options.dataAdapter.createOne(req.parsedResource || req.body))
  } catch ({ message }) {
    next(new Error(`could not create the new resource, ${message}`))
  }
}

export const selectManyHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.selectMany) {
    next(new Error(`selectMany not yet implemented`))
    return
  }

  try {
    res.send(await options.dataAdapter.selectMany(req.dbPagination, req.dbQuery))
  } catch ({ message }) {
    next(new Error(`could not get the resources, ${message}`))
  }
}

export const selectOneHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.selectOne) {
    next(new Error(`selectOne not yet implemented`))
    return
  }
  try {
    res.send(res.send(await options.dataAdapter.selectOne(req.params.id)))
  } catch ({ message }) {
    next(new Error(`could not get the resources, ${message}`))
  }
}

export const updateOneHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.updateOne) {
    next(new Error(`updateOne not yet implemented`))
    return
  }
  try {
    res.send(await options.dataAdapter.updateOne(req.params.id, req.parsedResource || req.body))
  } catch ({ message }) {
    next(new Error(`could not update the resource "${req.params.id}", ${message}`))
  }
}

export const deleteOneHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.deleteOne) {
    next(new Error(`deleteOne not yet implemented`))
    return
  }
  try {
    await options.dataAdapter.deleteOne(req.params.id)
    res.send()
  } catch ({ message }) {
    next(new Error(`could not delete the resource "${req.params.id}", ${message}`))
  }
}

export const deleteAllHandler = (options: RestOptions) => async (req: Request, res: Response, next: NextFunction) => {
  if (!options.dataAdapter.deleteAll) {
    next(new Error(`deleteAll not yet implemented`))
    return
  }

  try {
    res.send(await options.dataAdapter.deleteAll())
  } catch ({ message }) {
    next(new Error(`could not get the resources, ${message}`))
  }
}

export default (options: RestOptions): Router => {
  const router = Router()
  router.use(json())
  router.use(urlencoded({ extended: false }))

  const parent = !options.parent ? '/' : options.parent
  const path = normalize(`${parent}/${options.version}/${options.resource}`)

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
      if ((req.method === 'POST' || req.method === 'PUT') && options.parser) {
        req.parsedResource = options.parser.extractor(req[options.parser.source])
      }
      next()
    } catch (error) {
      next(error)
    }
  })

  if (options.dataAdapter.createOne) {
    router.post(`${path}`, createOneHandler(options))
  }

  if (options.dataAdapter.selectMany) {
    router.get(`${path}`, selectManyHandler(options))
  }

  if (options.dataAdapter.selectOne) {
    router.get(`${path}/:id`, selectOneHandler(options))
  }

  if (options.dataAdapter.updateOne) {
    router.put(`${path}/:id`, updateOneHandler(options))
  }

  if (options.dataAdapter.deleteAll) {
    router.delete(`${path}`, deleteAllHandler(options))
  }

  if (options.dataAdapter.deleteOne) {
    router.delete(`${path}/:id`, deleteOneHandler(options))
  }

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
