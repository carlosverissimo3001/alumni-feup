import * as d3 from "d3";

type TrendLineComponentProps = {
    dataPoints: number[];
}

export const trendLineComponent = (props: TrendLineComponentProps) => {
    // Mock data for the past 5 years
    const data = props.dataPoints;
    
    const trendUp = data[data.length - 1] > data[0];
    const trendColor = trendUp ? "#22c55e" : "#ef4444";
    
    const svgRef = (node: SVGSVGElement) => {
      if (!node) return;
      
      const width = 65;
      const height = 30;
      const padding = 2;
      
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
      
      const svg = d3.select(node);
      
      const xScale = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([padding, width - padding]);
        
      const yScale = d3.scaleLinear()
        .domain([(d3.min(data) ?? 0) * 0.9, (d3.max(data) ?? 0) * 1.1])
        .range([height - padding, padding]);
      
      const line = d3.line<number>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d))
        .curve(d3.curveMonotoneX);
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", trendColor)
        .attr("stroke-width", 2)
        .attr("d", line);
        
      svg.append("circle")
        .attr("cx", xScale(data.length - 1))
        .attr("cy", yScale(data[data.length - 1]))
        .attr("r", 3)
        .attr("fill", trendColor);
      };
    
    return (
      <div className="flex items-center justify-start w-full">
        <svg 
          ref={svgRef} 
          width="70" 
          height="35" 
          className="inline-block"
        />
      </div>
    );
  };
