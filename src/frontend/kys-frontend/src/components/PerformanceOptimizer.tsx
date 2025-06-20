import React, { memo, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';

// Optimize edilmiş KPI Card Component
interface KPICardProps {
    title: string;
    value: number;
    unit: string;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
}

export const OptimizedKPICard = memo<KPICardProps>(({ 
    title, 
    value, 
    unit, 
    status, 
    trend, 
    trendValue 
}) => {
    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'excellent': return '#4caf50';
            case 'good': return '#2196f3';
            case 'warning': return '#ff9800';
            case 'critical': return '#f44336';
            default: return '#9e9e9e';
        }
    }, []);

    const statusColor = useMemo(() => getStatusColor(status), [status, getStatusColor]);

    return (
        <Card sx={{ 
            height: '100%',
            borderLeft: `4px solid ${statusColor}`,
            '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                    {value.toLocaleString()} {unit}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography 
                        variant="body2" 
                        color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                    >
                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}%
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (value / 100) * 100)} 
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
            </CardContent>
        </Card>
    );
});

OptimizedKPICard.displayName = 'OptimizedKPICard';

// Optimize edilmiş Chart Wrapper
interface ChartWrapperProps {
    children: React.ReactNode;
    title: string;
    height?: number;
}

export const OptimizedChartWrapper = memo<ChartWrapperProps>(({ 
    children, 
    title, 
    height = 400 
}) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Box sx={{ height, width: '100%' }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
});

OptimizedChartWrapper.displayName = 'OptimizedChartWrapper';

// Virtual List Component (büyük listeler için)
interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    height: number;
    itemHeight: number;
    windowSize?: number;
}

export function OptimizedVirtualList<T>({ 
    items, 
    renderItem, 
    height, 
    itemHeight, 
    windowSize = 10 
}: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = React.useState(0);

    const visibleItems = useMemo(() => {
        const containerHeight = height;
        const totalItems = Math.ceil(containerHeight / itemHeight) + windowSize;
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - windowSize);
        const endIndex = Math.min(items.length, startIndex + totalItems);

        return items.slice(startIndex, endIndex).map((item, index) => ({
            item,
            index: startIndex + index
        }));
    }, [items, scrollTop, height, itemHeight, windowSize]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return (
        <Box
            sx={{ height, overflow: 'auto' }}
            onScroll={handleScroll}
        >
            <Box sx={{ height: items.length * itemHeight, position: 'relative' }}>
                {visibleItems.map(({ item, index }) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            top: index * itemHeight,
                            width: '100%',
                            height: itemHeight
                        }}
                    >
                        {renderItem(item, index)}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

// Debounced Search Hook
export const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Memory Usage Monitor
export const MemoryMonitor = memo(() => {
    const [memoryUsage, setMemoryUsage] = React.useState<any>(null);

    React.useEffect(() => {
        const checkMemory = () => {
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                setMemoryUsage({
                    used: Math.round(memory.usedJSHeapSize / 1048576),
                    total: Math.round(memory.totalJSHeapSize / 1048576),
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576)
                });
            }
        };

        checkMemory();
        const interval = setInterval(checkMemory, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!memoryUsage) return null;

    return (
        <Box sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            p: 1, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            fontSize: '0.75rem'
        }}>
            <Typography variant="caption">
                Memory: {memoryUsage.used}MB / {memoryUsage.total}MB
            </Typography>
        </Box>
    );
});

MemoryMonitor.displayName = 'MemoryMonitor';

export default { 
    OptimizedKPICard, 
    OptimizedChartWrapper, 
    OptimizedVirtualList,
    MemoryMonitor,
    useDebounce 
}; 