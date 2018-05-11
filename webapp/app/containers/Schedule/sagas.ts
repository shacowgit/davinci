import { takeLatest, takeEvery } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'

import {ADD_SCHEDULES, DELETE_SCHEDULES, LOAD_SCHEDULES, CHANGE_SCHEDULE_STATUS, UPDATE_SCHEDULES} from './constants'
import { schedulesLoaded, scheduleAdded, scheduleDeleted, currentScheduleStatusChanged, scheduleUpdated, updateScheduleFail } from './actions'
import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'

export const getSchedules = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.schedule)
    const schedules = readListAdapter(asyncData)
    yield put(schedulesLoaded(schedules))
    return schedules
  },
  function (err) {
    console.log('getSchedules', err)
  }
)

export const addSchedules = promiseSagaCreator(
  function* ({ schedule }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.schedule,
      data: writeAdapter(schedule)
    })
    const result = readObjectAdapter(asyncData)
    yield put(scheduleAdded(result))
    return result
  },
  function (err) {
    console.log('addSchedules', err)
  }
)

export const deleteSchedule = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.schedule}/${id}`
    })
    yield put(scheduleDeleted(id))
  },
  function (err) {
    console.log('deleteSchedule', err)
  }
)

export const changeScheduleStatus = promiseSagaCreator(
  function* ({ id, currentStatus }) {
    let status = ''
    switch (currentStatus) {
      case 'new':
        status = 'start'
        break
      case 'failed':
        status = 'start'
        break
      case 'started':
        status = 'stop'
        break
      case 'stopped':
        status = 'start'
        break
      default:
        break
    }
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.schedule}/${status}/${id}`
    })
    const result = readObjectAdapter(asyncData)
    yield put(currentScheduleStatusChanged(id, result))
  },
  function (err) {
    console.log('changeScheduleStatus', err)
  }
)

export const updateSchedule = promiseSagaCreator(
  function* ({ schedule }) {
    const asyncData = yield call(request, {
      method: 'put',
      url: api.schedule,
      data: writeAdapter(schedule)
    })
    const result = readObjectAdapter(asyncData)
    console.log(result)
    yield put(scheduleUpdated(result))
    return result
  },
  function (err) {
    console.log('updateSchedule', err)
  }
)

export default function* rootScheduleSaga (): IterableIterator<any> {
  yield [
    takeEvery(LOAD_SCHEDULES, getSchedules),
    takeEvery(ADD_SCHEDULES, addSchedules),
    takeEvery(DELETE_SCHEDULES, deleteSchedule),
    takeEvery(CHANGE_SCHEDULE_STATUS, changeScheduleStatus),
    takeEvery(UPDATE_SCHEDULES, updateSchedule)
  ]
}
