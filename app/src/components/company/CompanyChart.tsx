import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataPointDto } from '@/sdk';

interface CompanyChartProps {
  alumniTrend?: DataPointDto[] | null;
  averageTrend?: DataPointDto[] | null;
  industryTrend?: DataPointDto[] | null;
  isLoading?: boolean;
}

export default function CompanyChart({ alumniTrend, averageTrend, industryTrend, isLoading }: CompanyChartProps) {
  // If there's no data for any of the trends, return a message
  if ((!alumniTrend || alumniTrend.length === 0) && 
      (!averageTrend || averageTrend.length === 0) && 
      (!industryTrend || industryTrend.length === 0)) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Employee Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-muted-foreground">No trend data available</p>
        </CardContent>
      </Card>
    );
  }

  // Combine all available data for the chart
  const chartData = React.useMemo(() => {
    // Find all unique dates across all trends
    const allDates = new Set<string>();
    
    if (alumniTrend) alumniTrend.forEach(point => allDates.add(point.date));
    if (averageTrend) averageTrend.forEach(point => allDates.add(point.date));
    if (industryTrend) industryTrend.forEach(point => allDates.add(point.date));
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create data points for each date
    return sortedDates.map(date => {
      const dataPoint: any = { date };
      
      const companyPoint = alumniTrend?.find(p => p.date === date);
      const averagePoint = averageTrend?.find(p => p.date === date);
      const industryPoint = industryTrend?.find(p => p.date === date);
      
      if (companyPoint) dataPoint.company = companyPoint.value;
      if (averagePoint) dataPoint.average = averagePoint.value;
      if (industryPoint) dataPoint.industry = industryPoint.value;
      
      return dataPoint;
    });
  }, [alumniTrend, averageTrend, industryTrend]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {alumniTrend && alumniTrend.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="company" 
                  name="This Company" 
                  stroke="#8C2D19" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2} 
                />
              )}
              {averageTrend && averageTrend.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  name="Average Company" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                />
              )}
              {industryTrend && industryTrend.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="industry" 
                  name="Industry Average" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
