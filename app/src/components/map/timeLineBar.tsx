import React, { useState, useRef } from "react";


type TimeLineBarProps = {
    selectedYear?: number;
    setSelectedYear: (year?: number) => void;
    showTimeLine: boolean;
    compareYear?: number;
    setCompareYear: (year?: number) => void;
    showCompareYear: boolean;
    isCollapsed: boolean;
}

const TimeLineBar = ( {selectedYear, setSelectedYear, showTimeLine, compareYear, setCompareYear, showCompareYear, isCollapsed} : TimeLineBarProps)  => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1994 + 1 }, (_, i) => 1994 + i);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null); 
  const [isDragging, setIsDragging] = useState(false); 
  const [startX, setStartX] = useState(0); 
  const [scrollLeft, setScrollLeft] = useState(0); 

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleYearClick = (year: number) => {

    if(showCompareYear && selectedYear !== undefined){
      if (compareYear === year) {
        setCompareYear(undefined);
      } else {
        setCompareYear(year);
      }
    } else {
      if (selectedYear === year) {
          setSelectedYear(undefined);
      } else {
          setSelectedYear(year);
      }
    }
  };

  return (
    <div className={`fixed bottom-0 bg-zinc-900 text-white py-2 ${isCollapsed ? 'left-20' : 'left-60'} ${showTimeLine ? '' : 'hidden'}`}>
      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto space-x-4 px-4 py-2 cursor-grab overscroll-contain no-scrollbar ${isCollapsed ? 'timeline-width-collap' : 'timeline-width-nocollap'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ userSelect: "none" }}
      >
        {years.map((year) => (
          <div
            key={year}
            className={`inline-block px-4 py-2 rounded-md cursor-pointer ${
              selectedYear == year ? "bg-red-800" : "bg-gray-700"} ${
              compareYear == year ? "bg-yellow-500" : "bg-gray-700"}`}
            onClick={() => handleYearClick(year)}
          >
            {currentYear == year ? "Now" : year}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeLineBar;
