import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";


type TimeLineBarProps = {
    selectedYear?: number;
    setSelectedYear: (year?: number) => void;
    showTimeLine: boolean;
    compareYear?: number;
    setCompareYear: (year?: number) => void;
    showCompareYear: boolean;
    isCollapsed: boolean;
    startYear?: number
    endYear?: number
    onChange?: (range: { start: number; end: number }) => void
}

const TimeLineBar = ( {
  selectedYear, 
  setSelectedYear, 
  showTimeLine, 
  compareYear, 
  setCompareYear,
  showCompareYear,
  isCollapsed,
  onChange
  } : TimeLineBarProps)  => {

  const startYear = 1994;
  const endYear = new Date().getFullYear();
  const accentColor = "#ffffff";
  const handleColor = "#ffffff";
  const trackColor = "#333333";
  const selectedRangeColor = "#991b1b";
  const barHeight = 8;

  const [selectedStart, setSelectedStart] = useState(2000)
  const [selectedEnd, setSelectedEnd] = useState(2010)
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null) //Update to treu false
  const timelineRef = useRef<HTMLDivElement>(null)
  const startHandleRef = useRef<HTMLDivElement>(null)
  const endHandleRef = useRef<HTMLDivElement>(null)
  const selectedRangeRef = useRef<HTMLDivElement>(null)
  const startLabelRef = useRef<HTMLDivElement>(null)
  const endLabelRef = useRef<HTMLDivElement>(null)
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  const getYearPosition = (year: number) => {
    return ((year - startYear) / (endYear - startYear)) * 100
  }

  const startPosition = getYearPosition(selectedStart)
  const endPosition = getYearPosition(selectedEnd)

  const getYearFromPosition = (position: number) => {
    const percent = Math.max(0, Math.min(100, position))
    const year = Math.round(startYear + (percent / 100) * (endYear - startYear))
    return year
  }

  const handleMouseDown = (handle: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleTouchStart = (handle: "start" | "end") => (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return

    requestAnimationFrame(() => {
      const rect = timelineRef.current!.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width) * 100
      const year = getYearFromPosition(position)

      if (isDragging === "start") {
        if (showCompareYear) {
          setSelectedStart(year)
          setSelectedEnd(year)
        } else {
          setSelectedStart(year)
        }
      } else {
        if (showCompareYear) {
          setSelectedStart(year)
          setSelectedEnd(year)
        } else {
          setSelectedEnd(year)
        }
      }
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !timelineRef.current) return

    requestAnimationFrame(() => {
      const rect = timelineRef.current!.getBoundingClientRect()
      const touch = e.touches[0]
      const position = ((touch.clientX - rect.left) / rect.width) * 100
      const year = getYearFromPosition(position)

      if (isDragging === "start") {
        if (showCompareYear) {
          setSelectedStart(year)
          setSelectedEnd(year)
        } else {
          setSelectedStart(year)
        }
      } else {
        if (showCompareYear) {
          setSelectedStart(year)
          setSelectedEnd(year)
        } else {
          setSelectedEnd(year)
        }
      }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(null);
  }

  useEffect(() => {
    onChange?.({
      start: Math.min(selectedStart, selectedEnd),
      end: Math.max(selectedStart, selectedEnd),
    })
  }, [selectedStart, selectedEnd, onChange])

  // Set the Selected and Compare Year after 1 second of a user change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if(selectedYear !== selectedStart && showTimeLine){
        setSelectedYear(selectedStart);
      }
      if(!showCompareYear && showTimeLine){
        if(selectedEnd !== compareYear){
          setCompareYear(selectedEnd);
        }
      }else{
        setCompareYear(undefined);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [selectedStart, selectedEnd]);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging])

  // Handle single year mode toggle
  useEffect(() => {
    if (showCompareYear) {
      setSelectedEnd(selectedStart)
    }
  }, [showCompareYear])

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return

    const updateHandlePosition = (e: MouseEvent) => {
      if (!timelineRef.current || !startHandleRef.current || !endHandleRef.current || !selectedRangeRef.current) return

      const rect = timelineRef.current.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width) * 100
      const clampedPosition = Math.max(0, Math.min(100, position))
      const year = getYearFromPosition(clampedPosition)

      if (isDragging === "start") {
        startHandleRef.current.style.left = `${clampedPosition}%`
        if (startLabelRef.current) {
          startLabelRef.current.textContent = year.toString()
          startLabelRef.current.style.left = `${clampedPosition}%`
        }

        const endPosition = Number.parseFloat(endHandleRef.current.style.left || "0")
        const minPos = Math.min(clampedPosition, endPosition)
        const width = Math.abs(clampedPosition - endPosition)

        selectedRangeRef.current.style.left = `${minPos}%`
        selectedRangeRef.current.style.width = `${width}%`
      } else {
        endHandleRef.current.style.left = `${clampedPosition}%`
        if (endLabelRef.current) {
          endLabelRef.current.textContent = year.toString()
          endLabelRef.current.style.left = `${clampedPosition}%`
        }

        const startPosition = Number.parseFloat(startHandleRef.current.style.left || "0")
        const minPos = Math.min(startPosition, clampedPosition)
        const width = Math.abs(startPosition - clampedPosition)

        selectedRangeRef.current.style.left = `${minPos}%`
        selectedRangeRef.current.style.width = `${width}%`
      }
    }

    const updateHandlePositionTouch = (e: TouchEvent) => {
      if (!timelineRef.current || !startHandleRef.current || !endHandleRef.current || !selectedRangeRef.current) return

      const rect = timelineRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const position = ((touch.clientX - rect.left) / rect.width) * 100
      const clampedPosition = Math.max(0, Math.min(100, position))
      const year = getYearFromPosition(clampedPosition)

      if (isDragging === "start") {
        startHandleRef.current.style.left = `${clampedPosition}%`
        if (startLabelRef.current) {
          startLabelRef.current.textContent = year.toString()
          startLabelRef.current.style.left = `${clampedPosition}%`
        }

        const endPosition = Number.parseFloat(endHandleRef.current.style.left || "0")
        const minPos = Math.min(clampedPosition, endPosition)
        const width = Math.abs(clampedPosition - endPosition)

        selectedRangeRef.current.style.left = `${minPos}%`
        selectedRangeRef.current.style.width = `${width}%`
      } else {
        endHandleRef.current.style.left = `${clampedPosition}%`
        if (endLabelRef.current) {
          endLabelRef.current.textContent = year.toString()
          endLabelRef.current.style.left = `${clampedPosition}%`
        }

        const startPosition = Number.parseFloat(startHandleRef.current.style.left || "0")
        const minPos = Math.min(startPosition, clampedPosition)
        const width = Math.abs(startPosition - clampedPosition)

        selectedRangeRef.current.style.left = `${minPos}%`
        selectedRangeRef.current.style.width = `${width}%`
      }
    }

    window.addEventListener("mousemove", updateHandlePosition)
    window.addEventListener("touchmove", updateHandlePositionTouch)

    return () => {
      window.removeEventListener("mousemove", updateHandlePosition)
      window.removeEventListener("touchmove", updateHandlePositionTouch)
    }
  }, [isDragging])

  // Handle click on timeline to move
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    if (isDragging) return

    const rect = timelineRef.current.getBoundingClientRect()
    const position = ((e.clientX - rect.left) / rect.width) * 100
    const year = getYearFromPosition(position)

    if (showCompareYear) {
      setSelectedStart(year)
      setSelectedEnd(year)
    } else {
      const distanceToStart = Math.abs(position - startPosition)
      const distanceToEnd = Math.abs(position - endPosition)
      if (distanceToStart <= distanceToEnd) {
        setSelectedStart(year)
      } else {
        setSelectedEnd(year)
      }
    }
  }

  return (
    <div className={`fixed bottom-0 h-20 bg-transparent text-white py-2 timeline-width-collap ${isCollapsed ? 'left-28' : 'left-64'} ${showTimeLine ? '' : 'hidden'}`}>
          <div
            ref={timelineRef}
            className="relative h-12 w-full bg-zinc-900 rounded-md transition-all duration-200 cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Timeline track */}
            <div
              className={cn(
                "absolute top-1/2 left-0 right-0 -translate-y-1/2 transition-all duration-200 rounded-full shadow-sm"
              )}
              style={{
                height: `${barHeight}px`,
                backgroundColor: trackColor,
              }}
            />

            {/* Selected range */}
            <div
              ref={selectedRangeRef}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm",
                !isDragging && "transition-all duration-200",
              )}
              style={{
                left: `${Math.min(startPosition, endPosition)}%`,
                width: `${Math.abs(endPosition - startPosition)}%`,
                height: `${barHeight}px`,
                background: !showCompareYear
                  ? `linear-gradient(90deg, ${selectedRangeColor}aa, ${selectedRangeColor})`
                  : trackColor,
              }}
            />

            {/* Year markers */}
            {years
              .filter((year) => year % 5 === 0)
              .map((year) => (
                <div
                  key={year}
                  className="absolute top-0 h-full transition-all duration-200"
                  style={{ left: `${getYearPosition(year)}%` }}
                >
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-opacity duration-200"
                    style={{
                      backgroundColor: `${accentColor}70`,
                      height: `${barHeight * 2}px`,
                      width: "1px",
                    }}
                  />
                  <div
                    className="absolute top-full mt-1 text-xs -translate-x-1/2 transition-opacity duration-200 font-bold"
                    style={{ color: accentColor }}
                  >
                    {year}
                  </div>
                </div>
              ))}

            {/* Year labels above handles */}
            <div
              ref={startLabelRef}
              className="absolute top-0 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full border-2 z-10"
              style={{
                left: `${startPosition}%`,
                borderColor: selectedRangeColor,
                transform: "translate(-50%, -120%)",
              }}
            >
              {selectedStart}
            </div>

            {!showCompareYear && (
              <div
                ref={endLabelRef}
                className="absolute top-0 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full border-2 z-10"
                style={{
                  left: `${endPosition}%`,
                  borderColor: selectedRangeColor,
                  transform: "translate(-50%, -120%)",
                }}
              >
                {selectedEnd}
              </div>
            )}

            {/* Start handle */}
            <div
              ref={startHandleRef}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full cursor-grab shadow-md hover:scale-110 z-20",
                isDragging === "start" && "cursor-grabbing scale-110",
                !isDragging && "transition-all duration-200",
              )}
              style={{
                left: `${startPosition}%`,
                backgroundColor: handleColor,
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: selectedRangeColor,
              }}
              onMouseDown={handleMouseDown("start")}
              onTouchStart={handleTouchStart("start")}
              role="slider"
              aria-valuemin={startYear}
              aria-valuemax={endYear}
              aria-valuenow={selectedStart}
              aria-label="Start year"
              tabIndex={0}
            />

            {/* End handle */}
            <div
              ref={endHandleRef}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full cursor-grab shadow-md hover:scale-110 z-20",
                isDragging === "end" && "cursor-grabbing scale-110",
                showCompareYear && "hidden",
                !isDragging && "transition-all duration-200",
              )}
              style={{
                left: `${endPosition}%`,
                backgroundColor: handleColor,
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: selectedRangeColor,
              }}
              onMouseDown={handleMouseDown("end")}
              onTouchStart={handleTouchStart("end")}
              role="slider"
              aria-valuemin={startYear}
              aria-valuemax={endYear}
              aria-valuenow={selectedEnd}
              aria-label="End year"
              tabIndex={0}
            />
          </div>
        </div>
  );
};

export default TimeLineBar;
