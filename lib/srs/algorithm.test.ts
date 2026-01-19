import { applyRemember, applyForget, DEFAULT_SRS_CONFIG, normalizeProgress, ProgressLike } from './algorithm';

describe('SRS Algorithm', () => {
    const now = new Date('2024-01-01T00:00:00.000Z');

    const createProgress = (overrides: Partial<ProgressLike> = {}): ProgressLike => ({
        card_id: 'test-card',
        state: 'new',
        due_at: now.toISOString(),
        interval_days: 0,
        ease: DEFAULT_SRS_CONFIG.easeStart,
        reps: 0,
        lapses: 0,
        ...overrides,
    });

    describe('applyRemember', () => {
        it('should handle first remember (new -> learning)', () => {
            const input = createProgress({ state: 'new', reps: 0 });
            const result = applyRemember(input, now);

            expect(result.state).toBe('learning');
            expect(result.reps).toBe(1);
            expect(result.interval_days).toBe(DEFAULT_SRS_CONFIG.firstIntervalDays);
            expect(result.ease).toBeGreaterThan(input.ease as number);
        });

        it('should handle second remember', () => {
            const input = createProgress({ state: 'learning', reps: 1, interval_days: DEFAULT_SRS_CONFIG.firstIntervalDays });
            const result = applyRemember(input, now);

            expect(result.reps).toBe(2);
            expect(result.state).toBe('learning');
            expect(result.interval_days).toBe(DEFAULT_SRS_CONFIG.secondIntervalDays);
        });

        it('should handle third remember (graduation to review)', () => {
            const currentEase = 2.5;
            const input = createProgress({
                state: 'learning',
                reps: 2,
                interval_days: DEFAULT_SRS_CONFIG.secondIntervalDays,
                ease: currentEase
            });
            const result = applyRemember(input, now);

            expect(result.reps).toBe(3);
            expect(result.state).toBe('review');
            const expectedInterval = DEFAULT_SRS_CONFIG.secondIntervalDays * result.ease;
            expect(result.interval_days).toBeCloseTo(expectedInterval);
        });

        it('should clamp ease max', () => {
            const input = createProgress({ ease: DEFAULT_SRS_CONFIG.easeMax });
            const result = applyRemember(input, now);
            expect(result.ease).toBe(DEFAULT_SRS_CONFIG.easeMax);
        });
    });

    describe('applyForget', () => {
        it('should reset reps and reduce ease', () => {
            const input = createProgress({
                state: 'review',
                reps: 5,
                ease: 2.5,
                interval_days: 10
            });
            const result = applyForget(input, now);

            expect(result.state).toBe('learning');
            expect(result.reps).toBe(0);
            expect(result.interval_days).toBe(0);
            expect(result.lapses).toBe(input.lapses as number + 1);
            expect(result.ease).toBeLessThan(input.ease as number);

            const dueDiff = new Date(result.due_at).getTime() - now.getTime();
            expect(dueDiff).toBe(DEFAULT_SRS_CONFIG.forgetDelayMinutes * 60 * 1000);
        });

        it('should clamp ease min', () => {
            const input = createProgress({ ease: DEFAULT_SRS_CONFIG.easeMin });
            const result = applyForget(input, now);
            expect(result.ease).toBe(DEFAULT_SRS_CONFIG.easeMin);
        });
    });
});
