import React from 'react';

export interface ResourceMetrics {
    memoryUsage: number;
    componentCount: number;
    renderCount: number;
    lastUpdate: Date;
}

export class ResourceMonitor {
    private static instance: ResourceMonitor;
    private metrics: ResourceMetrics;
    private renderCallbacks: Set<() => void> = new Set();

    private constructor() {
        this.metrics = {
            memoryUsage: 0,
            componentCount: 0,
            renderCount: 0,
            lastUpdate: new Date()
        };
    }

    public static getInstance(): ResourceMonitor {
        if (!ResourceMonitor.instance) {
            ResourceMonitor.instance = new ResourceMonitor();
        }
        return ResourceMonitor.instance;
    }

    public getMetrics(): ResourceMetrics {
        return { ...this.metrics };
    }

    public incrementRenderCount(): void {
        this.metrics.renderCount++;
    }

    public updateMemoryUsage(): void {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576);
        }
        this.metrics.lastUpdate = new Date();
    }

    public getOptimizationSuggestions(): string[] {
        const suggestions: string[] = [];
        const metrics = this.getMetrics();

        if (metrics.memoryUsage > 100) {
            suggestions.push('Yüksek bellek kullanımı tespit edildi.');
        }

        if (metrics.renderCount > 1000) {
            suggestions.push('Yüksek render sayısı tespit edildi.');
        }

        return suggestions;
    }
}

export const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default {
    ResourceMonitor,
    debounce
}; 