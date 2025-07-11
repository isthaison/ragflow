import api from '@/utils/api';
import registerServer from '@/utils/register-server';
import request from '@/utils/request';

const {
  getCanvas,
  getCanvasSSE,
  setCanvas,
  getListVersion,
  getVersion,
  listCanvas,
  resetCanvas,
  removeCanvas,
  runCanvas,
  listTemplates,
  testDbConnect,
  getInputElements,
  debug,
  listCanvasTeam,
  settingCanvas,
  createSchedule,
  listSchedules,
  updateSchedule,
  toggleSchedule,
  deleteSchedule,
  getFrequencyOptions,
  getScheduleHistory,
  getScheduleStats,
  uploadCanvasFile,
  trace,
} = api;

const methods = {
  getCanvas: {
    url: getCanvas,
    method: 'get',
  },
  getCanvasSSE: {
    url: getCanvasSSE,
    method: 'get',
  },
  setCanvas: {
    url: setCanvas,
    method: 'post',
  },
  getListVersion: {
    url: getListVersion,
    method: 'get',
  },
  getVersion: {
    url: getVersion,
    method: 'get',
  },
  listCanvas: {
    url: listCanvas,
    method: 'get',
  },
  resetCanvas: {
    url: resetCanvas,
    method: 'post',
  },
  removeCanvas: {
    url: removeCanvas,
    method: 'post',
  },
  runCanvas: {
    url: runCanvas,
    method: 'post',
  },
  listTemplates: {
    url: listTemplates,
    method: 'get',
  },
  testDbConnect: {
    url: testDbConnect,
    method: 'post',
  },
  getInputElements: {
    url: getInputElements,
    method: 'get',
  },
  debugSingle: {
    url: debug,
    method: 'post',
  },
  listCanvasTeam: {
    url: listCanvasTeam,
    method: 'get',
  },
  settingCanvas: {
    url: settingCanvas,
    method: 'post',
  },
  createSchedule: {
    url: createSchedule,
    method: 'post',
  },
  listSchedules: {
    url: listSchedules,
    method: 'get',
  },
  updateSchedule: {
    url: updateSchedule,
    method: 'put',
  },
  toggleSchedule: {
    url: toggleSchedule,
    method: 'post',
  },
  deleteSchedule: {
    url: deleteSchedule,
    method: 'delete',
  },
  getFrequencyOptions: {
    url: getFrequencyOptions,
    method: 'get',
  },
  getScheduleHistory: {
    url: getScheduleHistory,
    method: 'get',
  },
  getScheduleStats: {
    url: getScheduleStats,
    method: 'get',
  },
  uploadCanvasFile: {
    url: uploadCanvasFile,
    method: 'post',
  },
  trace: {
    url: trace,
    method: 'get',
  },
} as const;

const flowService = registerServer<keyof typeof methods>(methods, request);

export default flowService;
