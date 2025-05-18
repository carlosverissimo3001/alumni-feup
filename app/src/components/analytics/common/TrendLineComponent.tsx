import { DataPointDto } from "@/sdk/models/DataPointDto";
import * as d3 from "d3";
import { TrendFrequency } from "@/types/entityTypes";

enum TrendLineType {
  UP = "up",
  DOWN = "down",
  NEUTRAL = "neutral",
}

type TrendLineComponentProps = {
  dataPoints: DataPointDto[];
  trendFrequency: TrendFrequency;
};

const spliceData = (
  data: DataPointDto[],
  trendFrequency: TrendFrequency
): DataPointDto[] => {
  if (data.length === 0) return data;

  // Data will come sorted in the BE, but we're making sure to sort it again
  // to avoid any potential issues
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.label);
    const dateB = new Date(b.label);
    return dateB.getTime() + dateA.getTime();
  });

  const now = new Date();
  let cutoffDate: Date;

  // Determine the cutoff date based on the trend frequency
  switch (trendFrequency) {
    case TrendFrequency.MAX:
      cutoffDate = new Date(now.getFullYear() - 30, now.getMonth(), 1);
      break;
    case TrendFrequency.Y20:
      cutoffDate = new Date(now.getFullYear() - 20, now.getMonth(), 1);
      break;
    case TrendFrequency.Y10:
      cutoffDate = new Date(now.getFullYear() - 10, now.getMonth(), 1);
      break;
    case TrendFrequency.Y5:
      cutoffDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
      break;
    case TrendFrequency.Y3:
      cutoffDate = new Date(now.getFullYear() - 3, now.getMonth(), 1);
      break;
    case TrendFrequency.YTD:
      cutoffDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return data;
  }

  // Filter data points within the date range
  const filteredData = sortedData.filter((point) => {
    const pointDate = new Date(point.label);
    return pointDate >= cutoffDate && pointDate <= now;
  });

  if (trendFrequency === TrendFrequency.YTD) {
    return filteredData;
  }

  const quarterlyData: { [key: string]: { sum: number; count: number } } = {};

  filteredData.forEach((point) => {
    const date = new Date(point.label);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const key = `${year}-Q${quarter}`;

    if (!quarterlyData[key]) {
      quarterlyData[key] = { sum: 0, count: 0 };
    }
    quarterlyData[key].sum += point.value;
    quarterlyData[key].count += 1;
  });

  return Object.entries(quarterlyData)
    .map(([label, { sum, count }]) => ({
      label,
      value: Math.round(sum / count),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.label);
      const dateB = new Date(b.label);
      return dateA.getTime() - dateB.getTime();
    });
};

const getTrend = (data: number[]): TrendLineType => {
  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];

  if (lastPoint > firstPoint) {
    return TrendLineType.UP;
  } else if (lastPoint < firstPoint) {
    return TrendLineType.DOWN;
  } else {
    return TrendLineType.NEUTRAL;
  }
};

const getTrendColor = (trend: TrendLineType) => {
  switch (trend) {
    case TrendLineType.UP:
      return "#22c55e";
    case TrendLineType.DOWN:
      return "#ef4444";
    case TrendLineType.NEUTRAL:
      return "#6b7280";
  }
};

const TrendLineComponent = (props: TrendLineComponentProps) => {
  const raw = spliceData(props.dataPoints, props.trendFrequency);
  const data = raw.map((point) => point.value);

  const trend = getTrend(data);
  const trendColor = getTrendColor(trend);

  const svgRef = (node: SVGSVGElement) => {
    if (!node) return;

    const width = 65;
    const height = 30;
    const padding = 2;

    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }

    const svg = d3.select(node);

    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleLinear()
      .domain([(d3.min(data) ?? 0) * 0.9, (d3.max(data) ?? 0) * 1.1])
      .range([height - padding, padding]);

    const line = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", trendColor)
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("circle")
      .attr("cx", xScale(data.length - 1))
      .attr("cy", yScale(data[data.length - 1]))
      .attr("r", 3)
      .attr("fill", trendColor);
  };

  return (
    <div className="flex items-center justify-start w-full">
      <svg ref={svgRef} width="70" height="30" className="inline-block" />
    </div>
  );
};

export default TrendLineComponent;
