import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let rateLimitService: RateLimitService;

  beforeEach(() => {
    rateLimitService = new RateLimitService();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-27T19:32:00Z')); // fixed date for predictable keys
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be under daily and minute limits initially', () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimitService.isUnderLimit()).toBe(true);
    }
  });

  it('should exceed minute limit after 10 calls in the same minute', () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimitService.isUnderLimit()).toBe(true);
    }
    expect(rateLimitService.isUnderLimit()).toBe(false);
  });

  it('should reset minute limit in the next minute', () => {
    for (let i = 0; i < 10; i++) {
      rateLimitService.isUnderLimit();
    }
    expect(rateLimitService.isUnderLimit()).toBe(false);

    jest.advanceTimersByTime(60 * 1000); // move time forward 1 minute
    expect(rateLimitService.isUnderLimit()).toBe(true);
  });

  it('should exceed daily limit after 10000 calls', () => {
    for (let i = 0; i < 10000; i++) {
      rateLimitService.isUnderLimit(); // drain the daily quota
    }
    expect(rateLimitService.isUnderLimit()).toBe(false);
  });

  it('should return correct remaining usage stats', () => {
    for (let i = 0; i < 5; i++) {
      rateLimitService.isUnderLimit();
    }

    const stats = rateLimitService.getUsageStats();
    expect(stats.dailyRemaining).toBe(9995);
    expect(stats.minuteRemaining).toBe(5);
  });
});
