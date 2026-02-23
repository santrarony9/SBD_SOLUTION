import { Injectable } from '@nestjs/common';

@Injectable()
export class TrafficService {
    private requests: number[] = [];
    private readonly RPM_WINDOW = 60 * 1000; // 1 minute for RPM
    private readonly ADVISORY_WINDOW = 3 * 60 * 1000; // 3 minutes for sustained load check
    private readonly CAPACITY_THRESHOLD = 400; // 80% of estimated 500 requests/min capacity

    recordRequest() {
        this.requests.push(Date.now());
        this.cleanOldRequests();
    }

    private cleanOldRequests() {
        const now = Date.now();
        // Keep only requests within the advisory window to save memory
        const cutoff = now - this.ADVISORY_WINDOW;

        // Efficiently find index to slice if array gets large
        if (this.requests.length > 1000) {
            let firstValid = 0;
            while (firstValid < this.requests.length && this.requests[firstValid] < cutoff) {
                firstValid++;
            }
            if (firstValid > 0) {
                this.requests = this.requests.slice(firstValid);
            }
        } else {
            this.requests = this.requests.filter(t => t > cutoff);
        }
    }

    getMetrics() {
        const now = Date.now();
        const rpm = this.requests.filter(t => now - t < this.RPM_WINDOW).length;

        // Check if 80% capacity is sustained
        // We check if the average RPM over the advisory window is high
        const windowMinutes = this.ADVISORY_WINDOW / 60000;
        const totalInWindow = this.requests.filter(t => now - t < this.ADVISORY_WINDOW).length;
        const avgRpm = totalInWindow / windowMinutes;

        const isUpgradeRecommended = avgRpm > this.CAPACITY_THRESHOLD;

        return {
            currentRpm: rpm,
            avgRpm: Math.round(avgRpm),
            threshold: this.CAPACITY_THRESHOLD,
            status: rpm > this.CAPACITY_THRESHOLD ? 'Critical' : (rpm > this.CAPACITY_THRESHOLD * 0.7 ? 'Warning' : 'Healthy'),
            isUpgradeRecommended,
            advice: isUpgradeRecommended
                ? "High traffic sustained. Migrate to a VPS for 10,000 traffic capability."
                : (rpm > this.CAPACITY_THRESHOLD * 0.8 ? "Approaching capacity limits. Monitor closely." : "System health optimal.")
        };
    }
}
