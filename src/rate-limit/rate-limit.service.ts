// rate-limit.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private readonly DAILY_LIMIT = 10000;
  private readonly MINUTE_LIMIT = 10;

  private readonly dailyCounts: Record<string, number> = {};
  private readonly minuteCounts: Record<string, number> = {};

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10); // e.g. '2025-07-27'
  }

  private getMinuteKey(): string {
    const now = new Date();
    return `${now.toISOString().slice(0, 10)}-${now.getHours()}-${now.getMinutes()}`; // e.g. '2025-07-27-19-30'
  }

  isUnderLimit(): boolean {
    const todayKey = this.getTodayKey();
    const minuteKey = this.getMinuteKey();

    // increment both counters
    this.dailyCounts[todayKey] = (this.dailyCounts[todayKey] || 0) + 1;
    this.minuteCounts[minuteKey] = (this.minuteCounts[minuteKey] || 0) + 1;

    return (
      this.dailyCounts[todayKey] <= this.DAILY_LIMIT &&
      this.minuteCounts[minuteKey] <= this.MINUTE_LIMIT
    );
  }

  getUsageStats(): { dailyRemaining: number; minuteRemaining: number } {
    const todayKey = this.getTodayKey();
    const minuteKey = this.getMinuteKey();

    return {
      dailyRemaining: Math.max(
        this.DAILY_LIMIT - (this.dailyCounts[todayKey] || 0),
        0
      ),
      minuteRemaining: Math.max(
        this.MINUTE_LIMIT - (this.minuteCounts[minuteKey] || 0),
        0
      )
    };
  }
}
