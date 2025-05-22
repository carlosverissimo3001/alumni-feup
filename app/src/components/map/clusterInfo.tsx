/**
 * This class is responsible for listing the alumnis in a certain cluster. It also handles with Pagination
 */
import React, { use, useEffect, useState } from "react";
import { AlumniData } from "@/types/alumni";
import ImageWithFallback from "../ui/image-with-fallback";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Hash, Percent } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type props = {
  hoveredCluster: boolean;
  listAlumniNames: string[];
  listLinkedinLinks: string[];
  listPlaceName: string[];
  compareYearStudents: number | undefined;
  students: number;
  totalAlumni: number;
  totalAlumniPrev: number;
  hoveredMouseCoords: number[];
  alumniData: AlumniData[];
  selectedYear: number | undefined;
  compareYear: number | undefined;
};
const ClusterInfo = ({
  hoveredCluster,
  listAlumniNames,
  listLinkedinLinks,
  listPlaceName,
  compareYearStudents,
  students,
  totalAlumni,
  totalAlumniPrev,
  hoveredMouseCoords,
  alumniData,
  selectedYear,
  compareYear
}: props) => {
  const nAlumniToShow = 10; // Defines the nº of alumnis to show when a hoover is preformed
  const [startPosition, setStartPosition] = useState(0); // Position in the array to start to read from
  const [endPosition, setEndPosition] = useState(nAlumniToShow - 1); // Position in the array to stop reading from. 0 is also a number therefore the -1
  const [showPrev, setShowPrev] = useState(false); // Defines if it is to show the "...Prev"
  const [showMore, setShowMore] = useState(false); // Defines if it is to show the "More..."
  const [showCompare, setShowCompare] = useState(false);
  const [displayMode, setDisplayMode] = useState<"numbers" | "percentages">("numbers")

  useEffect(() => {
    if (!hoveredCluster) {
      setStartPosition(0);
      setEndPosition(nAlumniToShow - 1);
    }
  }, [hoveredCluster]);

  // Defines the previous button of the listing when hoovering according to the startPosition value
  useEffect(() => {
    if (startPosition <= 0) {
      setShowPrev(false);
    } else {
      setShowPrev(true);
    }
  }, [startPosition]);

  // Defines the more button of the listing when hoovering according to the endPosition value
  useEffect(() => {
    if (endPosition >= alumniData.length - 1) {
      // endposition assumes a value bigger than the last arrays' position
      setShowMore(false);
    } else {
      setShowMore(true);
    }
  }, [alumniData.length, endPosition]);

  // Controls what should be done when the more button is pressed
  const handleShowMore = () => {
    setStartPosition(endPosition + 1);
    if (endPosition + nAlumniToShow > alumniData.length - 1) {
      setEndPosition(alumniData.length - 1); // Defaults to the array's last position
    } else {
      setEndPosition(endPosition + nAlumniToShow);
    }
    setShowPrev(true);
  };

  // Controls what should be done when the previous button is pressed
  const handleShowPrev = () => {
    setEndPosition(startPosition - 1);
    if (startPosition - nAlumniToShow < 0) {
      setStartPosition(0); // defaults to the first position of the array
    } else {
      setStartPosition(startPosition - nAlumniToShow);
    }
    setShowMore(true);
  };

  useEffect(() => {
    showCompare
  });


  return (
    <AnimatePresence>
      {hoveredCluster &&
        // listAlumniNames.length > 0 &&
        // listLinkedinLinks.length > 0 &&
        listPlaceName.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50 w-[500px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4"
          style={{
            top: `${hoveredMouseCoords[1]}px`,
            left: `${hoveredMouseCoords[0]}px`,
          }}
        >
          {compareYearStudents == undefined ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-red-700 uppercase mb-2">
                Location
              </h3>
              <div className="flex flex-wrap gap-1">
                {listPlaceName.map((place, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {place}
                  </Badge>
                ))}
              </div>
            </div>
            <ScrollArea className="h-[350px] w-full rounded-md">
              <Table>
                <TableHeader className="bg-white/95 backdrop-blur-sm sticky top-0">
                  <TableRow>
                    <TableHead className="w-[250px] text-red-700 font-semibold">Alumni</TableHead>
                    <TableHead className="text-red-700 font-semibold">Role</TableHead>
                    <TableHead className="text-red-700 font-semibold">Company</TableHead>
                    <TableHead className="text-red-700 font-semibold">Degree</TableHead>
                    <TableHead className="text-red-700 font-semibold">Conclusion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumniData
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(startPosition, endPosition + 1)
                    .map((alumni, index) => (
                      <TableRow key={index} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                              <ImageWithFallback
                                className="object-cover"
                                src={alumni.profile_pic_url || null}
                                alt={alumni.name}
                              />
                            </div>
                            <a
                              className="text-sm font-bold text-gray-900 hover:text-red-700 transition-colors"
                              href={alumni.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {alumni.name}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 font-bold">
                          {alumni.jobTitle}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 font-bold">
                          {alumni.companyName}
                        </TableCell>
                        {/* Note, this is a hotfix since we cannot store dots in the database, please solve this in the future */}
                        <TableCell className="text-sm text-gray-600 font-bold">{alumni.courses?.replace(/_/g, ".")}</TableCell>
                        <TableCell className="text-sm text-gray-600 font-bold">
                          {alumni.yearConclusions}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-between pt-2">
              {showPrev && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowPrev}
                  className="text-xs"
                >
                  ← Previous
                </Button>
              )}
              {showMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowMore}
                  className="text-xs ml-auto"
                >
                  More →
                </Button>
              )}
            </div>
          </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between">
            <div>
                {listPlaceName.map((place, index) => (
                  <Badge key={index} variant="secondary" className="text-xl">
                    {place}
                  </Badge>
                ))}
            </div>
              <ToggleGroup
                type="single"
                value={displayMode}
                onValueChange={(value) => value && setDisplayMode(value as "numbers" | "percentages")}
              >
                <ToggleGroupItem value="numbers" aria-label="Show raw numbers" 
                className="bg-gray-700
                  hover:bg-gray-900
                  data-[state=on]:bg-gray-700
                  data-[state=on]:hover:bg-gray-900">
                  <Hash className="h-4 w-4 text-white" />
                </ToggleGroupItem>
                <ToggleGroupItem value="percentages" aria-label="Show percentages" 
                className="bg-gray-700
                  hover:bg-gray-900
                  data-[state=on]:bg-gray-700
                  data-[state=on]:hover:bg-gray-900">
                  <Percent className="h-4 w-4 text-white" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            {displayMode === "numbers" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="text-center">
                  <p className="text-xl font-medium text-muted-foreground mb-1">{selectedYear! < compareYear! ? selectedYear : compareYear}</p>
                  <p className="text-5xl font-bold">{(students - compareYearStudents)}</p>
                </div>

                <ArrowRight className="text-muted-foreground h-8 w-10 mt-10" />
      
                <div className="text-center">
                  <p className="text-xl font-medium text-muted-foreground mb-1">{selectedYear! > compareYear! ? selectedYear : compareYear}</p>
                  <p className="text-5xl font-bold">{students}</p>
                </div>
      
                <div
                  className={`text-center px-3 py-1 rounded-full ${(students - compareYearStudents) < students ? "bg-green-100 text-green-800" : (compareYearStudents != 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800")}`}
                >
                  <p className="text-lg font-medium">
                    {(students - compareYearStudents) < students ? "+" : (compareYearStudents != 0 ? "-" : "")}
                    {(students - compareYearStudents) !== 0 ? Math.abs(compareYearStudents / (students - compareYearStudents) * 100).toFixed(2) : "N/A"}%
                  </p>
                </div>
              </div>
            </div>) : (
              <div className="space-y-2">
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="text-center">
                  <p className="text-xl font-medium text-muted-foreground mb-1">{selectedYear! < compareYear! ? selectedYear : compareYear}</p>
                  {((students - compareYearStudents) / totalAlumniPrev) === 1 ?
                  <p className="text-5xl font-bold">100%</p>
                  :  <p className="text-5xl font-bold">{((students - compareYearStudents) / totalAlumniPrev * 100).toFixed(1)}%</p>}
                </div>

                <ArrowRight className="text-muted-foreground h-8 w-10 mt-10" />
      
                <div className="text-center">
                  <p className="text-xl font-medium text-muted-foreground mb-1">{selectedYear! > compareYear! ? selectedYear : compareYear}</p>
                  <p className="text-5xl font-bold">{(students / totalAlumni * 100).toFixed(1)}%</p>
                </div>
      
                <div
                  className={`text-center px-3 py-1 rounded-full ${((students - compareYearStudents)/totalAlumniPrev) < (students / totalAlumni) ? "bg-green-100 text-green-800" : (((students - compareYearStudents)/totalAlumniPrev) != (students / totalAlumni) ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800")}`}
                >
                  <p className="text-lg font-medium">
                    {(((students - compareYearStudents) / totalAlumniPrev) < (students / totalAlumni)) ? "+" : (((students - compareYearStudents) / totalAlumniPrev) == (students / totalAlumni) ? "" : "-")}
                    {Math.abs(((((students - compareYearStudents) / totalAlumniPrev) - students / totalAlumni) * 100)).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ClusterInfo;
