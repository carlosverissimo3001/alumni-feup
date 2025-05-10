"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Loader2 } from "lucide-react";

type InputData = {
  id: string;
  name: string;
  companyCount?: number;
  alumniCount: number;
}

type IndustryChartViewProps = {
  data: InputData[];
  isLoading: boolean;
  dataKey: "alumniCount" | "companyCount";
};

type TooltipData = {
  x: number;
  y: number;
  name: string;
  value: number;
  percentage?: string;
  color?: string;
  id?: string;
};

export default function ChartView({
  data,
  isLoading,
  dataKey,
}: IndustryChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });


  // Update dimensions when window is resized
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Remove existing chart when dimensions change
  useEffect(() => {
    if (chartRef.current) {
      d3.select(chartRef.current).selectAll("svg").remove();
    }
  }, [ dimensions]);

  useEffect(() => {
    if (isLoading || !chartRef.current || !data.length || dimensions.width === 0) return;

    const topData = [...data]
      .sort((a, b) => (b[dataKey] ?? 0) - (a[dataKey] ?? 0))
      .slice(0, 10);

    drawPieChart(topData, dimensions.width, dimensions.height, dataKey);

    setTooltip(null);
  }, [data, isLoading, dataKey, dimensions]);

  const drawPieChart = (
    data: InputData[],
    width: number,
    height: number,
    dataKey: "alumniCount" | "companyCount"
  ) => {
    const radius = Math.min(width, height) / 2 - 55;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;")
      .attr("class", "pie-chart");

    const title = svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 1.25)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .style("opacity", 0)
      .text(`Distribution by ${dataKey === "alumniCount" ? "Alumni" : "Companies"}`);
      
    title.transition()
      .duration(700)
      .style("opacity", 1);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 3.5},${height / 2 - 49})`)
      .style("opacity", 0);
      
    g.transition()
      .duration(500)
      .style("opacity", 1);

    const colorScheme = [
      "#8C2D19", "#D35400", "#E67E22", "#F39C12", "#F1C40F",
      "#27AE60", "#2ECC71", "#3498DB", "#9B59B6", "#34495E",
      "#16A085", "#2980B9", "#8E44AD", "#2C3E50", "#F39C12"
    ];

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.name))
      .range(colorScheme);

    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "#f9f9f9")
      .attr("stroke", "#eee")
      .attr("stroke-width", 1);

    const total = d3.sum(data, (d: InputData) => d[dataKey]);

    const pie = d3.pie<InputData>()
      .value((d: InputData) => d[dataKey] ?? 0)
      .sort(null);
      
    const arcTween = (d: d3.PieArcDatum<InputData>) => {
      const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
      return (t: number) => arc(interpolate(t)) || "";
    };

    const arc = d3
      .arc<d3.PieArcDatum<InputData>>()
      .innerRadius(radius * 0.3)
      .outerRadius(radius);

    const hoverArc = d3
      .arc<d3.PieArcDatum<InputData>>()
      .innerRadius(radius * 0.3)
      .outerRadius(radius + 15);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer");

    arcs
      .append("path")
      .attr("d", d => arc(d))
      .attr("fill", (d: d3.PieArcDatum<InputData>) => color(d.data.name))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("transition", "opacity 0.3s")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 50)
      .style("opacity", 1)
      .attrTween("d", arcTween as any);

    arcs.selectAll("path")
      .on("mouseenter", function(this: any, event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc as any);
        
        d3.selectAll(".arc path")
          .filter(function() { return this !== event.currentTarget; })
          .transition()
          .duration(200)
          .style("opacity", 0.7);
        
        const percentage = ((d.data[dataKey ?? 'alumniCount'] / total) * 100).toFixed(1);
        
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          name: d.data.name,
          value: d.data[dataKey ?? 'alumniCount'],
          percentage,
          color: color(d.data.name),
          id: d.data.id
        });
      })
      .on("mousemove", function(event: MouseEvent) {
        setTooltip(prev => prev ? {
          ...prev,
          x: event.clientX,
          y: event.clientY
        } : null);
      })
      .on("mouseleave", function(this: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc as any);
        
        d3.selectAll(".arc path")
          .transition()
          .duration(200)
          .style("opacity", 1);
        
        setTooltip(null);
      })


    arcs
      .append("text")
      .attr("transform", (d: d3.PieArcDatum<InputData>) => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr("dy", ".0em")
      .attr("text-anchor", "middle")
      .style("font-size", "0px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d: d3.PieArcDatum<InputData>) => {
        const percent = ((d.data[dataKey ?? 'alumniCount'] / total) * 100).toFixed(1);
        return parseFloat(percent) > 4 ? `${percent}%` : "";
      })
      .transition()
      .duration(800)
      .delay((d, i) => 500 + i * 50)
      .style("font-size", "12px")
      .style("font-weight", "900");

    arcs
      .filter((d: d3.PieArcDatum<InputData>) => {
        const percent = (d.data[dataKey ?? 'alumniCount'] / total) * 100;
        return percent > 7 ;
      })
      .append("text")
      .attr("transform", (d: d3.PieArcDatum<InputData>) => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]},${centroid[1] + 12})`;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "0px")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d: d3.PieArcDatum<InputData>) => {
        return d.data.name.length > 12 ? d.data.name.substring(0, 12) + "..." : d.data.name;
      })
      .transition()
      .duration(800)
      .delay((d, i) => 800 + i * 50)
      .style("font-size", "9px")
      .style("font-weight", "700");

    const legendWrapper = svg
      .append("g")
      .attr("class", "legend-wrapper")
      .attr("transform", `translate(${width / 2 + 80}, 40)`);

      
    legendWrapper
      .append("rect")
      .attr("width", 180)
      .attr("height", 235)
      .attr("rx", 5)
      .attr("fill", "#f9f9f9")
      .attr("stroke", "#eee")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 1);
      
    
    const legendG = legendWrapper
      .append("g")
      .attr("transform", "translate(10, 10)");
      
    legendG
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (_: unknown, i: number) => `translate(0, ${i * 22})`)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((_, i) => 300 + i * 30)
      .style("opacity", 1);


    legendG
      .selectAll(".legend-item")
      .on("mouseenter", function(this: any, event: MouseEvent, d: any) {
        d3.selectAll(".arc path")
          .filter(function(datum: any) {
            return datum.data && datum.data.id === d.id;
          })
          .transition()
          .duration(200)
          .attr("d", hoverArc as any)
          .style("opacity", 1);
          
        d3.selectAll(".arc path")
          .filter(function(datum: any) {
            return datum.data && datum.data.id !== d.id;
          })
          .transition()
          .duration(200)
          .style("opacity", 0.5);
          
        d3.select(this)
          .transition()
          .duration(200)
          .style("font-weight", "bold");
      })
      .on("mouseleave", function(this: any) {
        d3.selectAll(".arc path")
          .transition()
          .duration(200)
          .attr("d", arc as any)
          .style("opacity", 1);
          
        d3.select(this)
          .transition()
          .duration(200)
          .style("font-weight", "normal");
      })


    legendG
      .selectAll(".legend-item")
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", (d: any) => color(d.name));

    legendG
      .selectAll(".legend-item")
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .style("font-size", "11px")
      .style("fill", "#333")
      .text((d: any) => {
        const displayName = d.name.length > 27 ? d.name.substring(0, 27) + "..." : d.name;
        return `${displayName}`;
      });
  };

  const renderTooltip = () => {
    if (!tooltip) return null;
    
    const offsetX = 0;
    const offsetY = -200;
    
    return (
      <div 
        className="absolute z-50 bg-white p-2 rounded-md shadow-lg border border-gray-200 text-sm"
        style={{
          left: `${tooltip.x + offsetX}px`,
          top: `${tooltip.y + offsetY}px`,
          transform: 'translate(-50%, -100%)',
          minWidth: '180px',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -90%); }
            to { opacity: 1; transform: translate(-50%, -100%); }
          }
        `}</style>
        
        {tooltip.color && (
          <div className="w-full h-2 mb-1 rounded-sm" style={{ backgroundColor: tooltip.color }} />
        )}
        
        <div className="font-bold text-sm truncate max-w-[200px] mb-1">{tooltip.name}</div>
        
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">{dataKey === "alumniCount" ? "Alumni" : "Companies"}</span>
          <span className="font-medium text-[#8C2D19]">{tooltip.value.toLocaleString()}</span>
        </div>
        
        {tooltip.percentage && (
          <div className="flex justify-between items-center mr-0">
            <span className="text-gray-600 mr-2">Percentage</span>
            <div className="flex items-center">
              <div 
                className="w-[50px] h-3 rounded-sm mr-2 overflow-hidden"
                style={{ backgroundColor: '#eee' }}
              >
                <div 
                  className="h-full"
                  style={{ 
                    width: `${Math.min(100, parseFloat(tooltip.percentage))}%`,
                    backgroundColor: tooltip.color || '#8C2D19'
                  }}
                />
              </div>
              <span className="font-medium">{tooltip.percentage}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        ref={chartRef}
        className="w-full h-full flex items-center justify-center relative"
        style={{ minHeight: "400px", overflow: "visible" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <Loader2 className="w-8 h-8 text-[#8C2D19] animate-spin" />
        </div>
      )}
      {renderTooltip()}
    </div>
  );
} 
