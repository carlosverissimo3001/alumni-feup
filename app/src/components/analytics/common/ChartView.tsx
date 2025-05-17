/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Loader2 } from "lucide-react";
import { EntityType } from "@/types/entityTypes";

const getTitle = (entity: EntityType, items: number) => {
  let title = `Top ${items} `;

  switch (entity) {
    case EntityType.COMPANY:
      title += "Companies";
      break;
    case EntityType.ROLE:
      title += "Roles";
      break;
    case EntityType.INDUSTRY:
      title += "Industries";
      break;
    case EntityType.COUNTRY:
      title += "Countries";
      break;
    case EntityType.CITY:
      title += "Cities";
      break;
    case EntityType.FACULTY:
      title += "Faculties";
      break;
    case EntityType.MAJOR:
      title += "Courses";
      break;
    case EntityType.YEAR:
      title += "Graduation Years";
      break;
    default:
      return title;
  }

  return title;
};

const getDistributionKey = (entity: EntityType) => {
  return entity === EntityType.ROLE ? "Roles" : "Alumni";
};

type InputData = {
  id: string;
  name: string;
  count: number;
  acronym?: string;
  year?: number;
};

type ChartViewProps = {
  data: InputData[];
  isLoading: boolean;
  entityType: EntityType;
};

type TooltipData = {
  x: number;
  y: number;
  name: string;
  value: number;
  acronym?: string;
  percentage?: string;
  color?: string;
  id?: string;
  year?: number;
};

export default function ChartView({
  data,
  isLoading,
  entityType,
}: ChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showNames, setShowNames] = useState(false);

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
  }, [dimensions]);

  useEffect(() => {
    if (
      isLoading ||
      !chartRef.current ||
      !data.length ||
      dimensions.width === 0
    )
      return;

    d3.select(chartRef.current).selectAll("svg").remove();

    const topData = [...data]
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 10);

    drawPieChart(topData, dimensions.width, dimensions.height);

    setTooltip(null);
  }, [data, isLoading, dimensions, showNames]);

  const drawPieChart = (data: InputData[], width: number, height: number) => {
    // Raidus of the pie chart
    const radius = Math.min(width, height) / 2 - 55;

    // The main svg element
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
      .attr("y", 27)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .style("opacity", 0)
      .text(`${getTitle(entityType, data.length)}`);

    title.transition().duration(700).style("opacity", 1);

    // The graph container
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 3.5},${height / 2 - 49})`)
      .style("opacity", 0);

    g.transition().duration(500).style("opacity", 1);

    const colorScheme = [
      "#8C2D19", // Deep red
      "#2ECC71", // Green
      "#3498DB", // Blue
      "#9B59B6", // Purple
      "#F1C40F", // Yellow
      "#E67E22", // Orange
      "#16A085", // Teal
      "#8E44AD", // Deep Purple
      "#2980B9", // Deep Blue
      "#D35400", // Deep Orange
      "#27AE60", // Deep Green
      "#34495E", // Navy
      "#C0392B", // Red
      "#7F8C8D", // Gray
      "#1ABC9C", // Light Teal
    ];

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.name))
      .range(colorScheme);

    // The circle element
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "#f9f9f9")
      .attr("stroke", "#eee")
      .attr("stroke-width", 1);

    // The total value of the pie chart
    const total = d3.sum(data, (d: InputData) => d.count);

    const pie = d3
      .pie<InputData>()
      .value((d: InputData) => d.count)
      .sort(null);

    const arcTween = (d: d3.PieArcDatum<InputData>) => {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
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
      .attr("d", (d) => arc(d))
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

    arcs
      .selectAll("path")
      .on("mouseenter", function (this: any, event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc as any);

        d3.selectAll(".arc path")
          .filter(function () {
            return this !== event.currentTarget;
          })
          .transition()
          .duration(200)
          .style("opacity", 0.7);

        const percentage = ((d.data.count / total) * 100).toFixed(1);
        const rect = chartRef.current?.getBoundingClientRect();
        const x = event.clientX - (rect?.left || 0);
        const y = event.clientY - (rect?.top || 0);

        setTooltip({
          x,
          y,
          name: d.data.name,
          value: d.data.count,
          acronym: d.data.acronym ?? undefined,
          percentage,
          color: color(d.data.name),
          id: d.data.id,
          year: d.data.year,
        });
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = chartRef.current?.getBoundingClientRect();
        const x = event.clientX - (rect?.left || 0);
        const y = event.clientY - (rect?.top || 0);

        setTooltip((prev) =>
          prev
            ? {
                ...prev,
                x,
                y,
              }
            : null
        );
      })
      .on("mouseleave", function (this: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc as any);

        d3.selectAll(".arc path")
          .transition()
          .duration(200)
          .style("opacity", 1);

        setTooltip(null);
      });

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
        const percent = ((d.data.count / total) * 100).toFixed(1);
        return parseFloat(percent) > 4 ? `${percent}%` : "";
      })
      .transition()
      .duration(800)
      .delay((d, i) => 500 + i * 50)
      .style("font-size", "12px")
      .style("font-weight", "900");

    arcs
      .filter((d: d3.PieArcDatum<InputData>) => {
        const percent = (d.data.count / total) * 100;
        return percent > 7 && showNames;
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
        if (
          (entityType === EntityType.FACULTY ||
            entityType === EntityType.MAJOR ||
            entityType === EntityType.YEAR) &&
          d.data.acronym
        ) {
          if (entityType === EntityType.YEAR) {
            return `${d.data.acronym} ${d.data.year}`;
          }
          return `${d.data.acronym}`;
        }

        // For entities without acronyms or other types
        return d.data.name.length > 12
          ? d.data.name.substring(0, 12) + "..."
          : d.data.name;
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

    const legendPadding = 6;
    const elements = data.length;
    const legendElementHeight = 21.5;
    const legendContainerHeight =
      legendPadding * 2 + legendElementHeight * elements;

    legendWrapper
      .append("rect")
      .attr("width", 180)
      .attr("height", legendContainerHeight)
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

    const legendItems = legendG
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (_: unknown, i: number) => `translate(0, ${i * legendElementHeight})`
      )
      .style("cursor", "pointer")
      .style("opacity", 0);

    legendItems
      .on("mouseenter", function (this: any, event: MouseEvent, d: any) {
        d3.selectAll(".arc path")
          .filter(function (datum: any) {
            return datum.data && datum.data.id === d.id;
          })
          .transition()
          .duration(200)
          .attr("d", hoverArc as any)
          .style("opacity", 1);

        d3.selectAll(".arc path")
          .filter(function (datum: any) {
            return datum.data && datum.data.id !== d.id;
          })
          .transition()
          .duration(200)
          .style("opacity", 0.5);

        d3.select(this).transition().duration(200).style("font-weight", "bold");

        const percentage = ((d.count / total) * 100).toFixed(1);
        const rect = chartRef.current?.getBoundingClientRect();
        const x = event.clientX - (rect?.left || 0);
        const y = event.clientY - (rect?.top || 0);

        setTooltip({
          x,
          y,
          name: d.name,
          value: d.count,
          percentage,
          color: color(d.name),
          id: d.id,
          year: d.year,
          acronym: d.acronym ?? undefined,
        });
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = chartRef.current?.getBoundingClientRect();
        const x = event.clientX - (rect?.left || 0);
        const y = event.clientY - (rect?.top || 0);

        setTooltip((prev) =>
          prev
            ? {
                ...prev,
                x,
                y,
              }
            : null
        );
      })
      .on("mouseleave", function (this: any) {
        d3.selectAll(".arc path")
          .transition()
          .duration(200)
          .attr("d", arc as any)
          .style("opacity", 1);

        d3.select(this)
          .transition()
          .duration(200)
          .style("font-weight", "normal");

        setTooltip(null);
      });

    legendItems
      .transition()
      .duration(500)
      .delay((_, i) => 300 + i * 30)
      .style("opacity", 1);

    legendItems
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("y", 2)
      .attr("fill", (d: any) => color(d.name));

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#333")
      .text((d: any) => {
        if (
          (entityType === EntityType.FACULTY ||
            entityType === EntityType.MAJOR ||
            entityType === EntityType.YEAR) &&
          d.acronym
        ) {
          if (entityType === EntityType.YEAR) {
            return `${d.acronym} ${d.year}`;
          }
          return `${d.acronym}`;
        } else {
          const displayName =
            d.name.length > 27 ? d.name.substring(0, 25) + "..." : d.name;
          return displayName;
        }
      });

    const checkboxGroup = legendWrapper
      .append("g")
      .attr(
        "transform",
        `translate(10, ${legendContainerHeight + legendPadding + 5})`
      )
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("click", () => {
        setShowNames(!showNames);
      });

    checkboxGroup
      .transition()
      .duration(500)
      .delay(300 + data.length * 30)
      .style("opacity", 1);

    checkboxGroup
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    if (showNames) {
      checkboxGroup
        .append("rect")
        .attr("x", 2)
        .attr("y", 2)
        .attr("width", 8)
        .attr("height", 8)
        .attr("rx", 1)
        .attr("fill", "#8C2D19");
    }

    checkboxGroup
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .style("font-size", "11px")
      .style("fill", "#333")
      .text("Show labels in chart");
  };

  const renderTooltip = () => {
    if (!tooltip) return null;

    const tooltipHeight = 100;
    const tooltipWidth = 180;
    const shouldShowBelow = tooltip.y < tooltipHeight;
    const shouldShowRight = tooltip.x < tooltipWidth / 2;

    const chartWidth = chartRef.current?.clientWidth || 0;
    const shouldShowLeft = tooltip.x > chartWidth - tooltipWidth / 2;

    let translateX = "-50%";
    if (shouldShowRight) translateX = "0";
    if (shouldShowLeft) translateX = "-100%";

    console.log(tooltip);

    return (
      <div
        className="absolute z-50 bg-white p-2 rounded-md shadow-lg border border-gray-200 text-sm"
        style={{
          left: `${tooltip.x}px`,
          top: shouldShowBelow ? `${tooltip.y + 10}px` : `${tooltip.y - 10}px`,
          transform: `translate(${translateX}, ${
            shouldShowBelow ? "0" : "-100%"
          })`,
          minWidth: "180px",
          pointerEvents: "none",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(
                ${translateX},
                ${shouldShowBelow ? "-10%" : "-90%"}
              );
            }
            to {
              opacity: 1;
              transform: translate(
                ${translateX},
                ${shouldShowBelow ? "0" : "-100%"}
              );
            }
          }
        `}</style>

        {tooltip.color && (
          <div
            className={`w-full h-2 ${
              shouldShowBelow ? "mt-1 mb-2" : "mb-1"
            } rounded-sm`}
            style={{ backgroundColor: tooltip.color }}
          />
        )}

        <div className="font-bold text-sm truncate max-w-[200px] mb-1">
          {tooltip.acronym ? tooltip.acronym : tooltip.name}
        </div>

        {/* TODO: Add the full name when we have the acronym */}
        {tooltip.acronym && (
          <div className="flex justify-between text-[12px] items-center mb-1">
            <span className="text-gray-600">{tooltip.name}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">
            {getDistributionKey(entityType)}
          </span>
          <span className="font-medium text-[#8C2D19]">
            {tooltip.value.toLocaleString()}
          </span>
        </div>

        {entityType === EntityType.YEAR && tooltip.year && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">Year</span>
            <span className="font-medium text-[#8C2D19]">{tooltip.year}</span>
          </div>
        )}

        {tooltip.percentage && (
          <div className="flex justify-between items-center mr-0">
            <span className="text-gray-600 mr-2">Percentage</span>
            <div className="flex items-center">
              <div
                className="w-[50px] h-3 rounded-sm mr-2 overflow-hidden"
                style={{ backgroundColor: "#eee" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, parseFloat(tooltip.percentage))}%`,
                    backgroundColor: tooltip.color || "#8C2D19",
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
      ></div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <Loader2 className="w-8 h-8 text-[#8C2D19] animate-spin" />
        </div>
      )}
      {renderTooltip()}
    </div>
  );
}
