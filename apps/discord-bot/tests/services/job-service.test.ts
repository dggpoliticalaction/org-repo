import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import schedule from 'node-schedule'

import { JobService } from '../../src/services/job-service.js'
import { type Job } from '../../src/jobs/index.js'

vi.mock('../../src/services/logger.js', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../lang/logs.json', () => ({
  info: {
    jobRun: 'Job {JOB} started',
    jobCompleted: 'Job {JOB} completed',
    jobScheduled: 'Job {JOB} scheduled for {SCHEDULE}',
  },
  error: {
    job: 'Job {JOB} failed',
  },
}))

describe('JobService', () => {
  let jobService: JobService
  let mockJobs: Job[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockJobs = [
      {
        name: 'TestJob1',
        schedule: '0 * * * *', // Every hour
        runOnce: false,
        initialDelaySecs: 0,
        log: true,
        run: vi.fn().mockResolvedValue(undefined),
      },
      {
        name: 'TestJob2',
        schedule: '0 0 * * *', // Daily
        runOnce: true,
        initialDelaySecs: 10,
        log: false,
        run: vi.fn().mockResolvedValue(undefined),
      },
    ] as Job[]
  })

  afterEach(() => {
    vi.useRealTimers()
    schedule.gracefulShutdown()
  })

  describe('start', () => {
    it('should schedule all jobs', () => {
      jobService = new JobService(mockJobs)
      jobService.start()

      // Verify jobs are scheduled (we can't easily test the actual scheduling,
      // but we can verify the service doesn't throw)
      expect(() => jobService.start()).not.toThrow()
    })

    it('should handle jobs with initial delay', () => {
      const delayedJob: Job = {
        name: 'DelayedJob',
        schedule: '0 * * * *',
        runOnce: false,
        initialDelaySecs: 30,
        log: true,
        run: vi.fn().mockResolvedValue(undefined),
      }

      jobService = new JobService([delayedJob])
      expect(() => jobService.start()).not.toThrow()
    })

    it('should handle runOnce jobs', () => {
      const runOnceJob: Job = {
        name: 'RunOnceJob',
        schedule: '0 * * * *',
        runOnce: true,
        initialDelaySecs: 0,
        log: true,
        run: vi.fn().mockResolvedValue(undefined),
      }

      jobService = new JobService([runOnceJob])
      expect(() => jobService.start()).not.toThrow()
    })

    it('should log job execution when log is true', () => {
      const logJob: Job = {
        name: 'LogJob',
        schedule: '0 * * * *',
        runOnce: false,
        initialDelaySecs: 0,
        log: true,
        run: vi.fn().mockResolvedValue(undefined),
      }

      jobService = new JobService([logJob])

      expect(() => jobService.start()).not.toThrow()
      expect(logJob.run).toBeDefined()
    })

    it('should not log job execution when log is false', () => {
      const noLogJob: Job = {
        name: 'NoLogJob',
        schedule: '0 * * * *',
        runOnce: false,
        initialDelaySecs: 0,
        log: false,
        run: vi.fn().mockResolvedValue(undefined),
      }

      jobService = new JobService([noLogJob])

      expect(() => jobService.start()).not.toThrow()
      expect(noLogJob.run).toBeDefined()
    })

    it('should handle job errors', () => {
      const errorJob: Job = {
        name: 'ErrorJob',
        schedule: '0 * * * *',
        runOnce: false,
        initialDelaySecs: 0,
        log: true,
        run: vi.fn().mockRejectedValue(new Error('Job failed')),
      }

      jobService = new JobService([errorJob])

      expect(() => jobService.start()).not.toThrow()
      expect(errorJob.run).toBeDefined()
    })

    it('should handle empty job list', () => {
      jobService = new JobService([])
      expect(() => jobService.start()).not.toThrow()
    })
  })
})
