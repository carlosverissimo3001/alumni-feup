/**
 * This class is responsible for listing the alumnis in a certain cluster. It also handles with Pagination
 */
import React, { useEffect, useState } from "react";
import { AlumniData } from "@/types/alumni";
import ImageWithFallback from "../ui/image-with-fallback";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type props = {
  hoveredCluster: boolean;
  listAlumniNames: string[];
  listLinkedinLinks: string[];
  listPlaceName: string[];
  hoveredMouseCoords: number[];
  alumniData: AlumniData[];
};
const ClusterInfo = ({
  hoveredCluster,
  listAlumniNames,
  listLinkedinLinks,
  listPlaceName,
  hoveredMouseCoords,
  alumniData,
}: props) => {
  const nAlumniToShow = 10; // Defines the nº of alumnis to show when a hoover is preformed
  const [startPosition, setStartPosition] = useState(0); // Position in the array to start to read from
  const [endPosition, setEndPosition] = useState(nAlumniToShow - 1); // Position in the array to stop reading from. 0 is also a number therefore the -1
  const [showPrev, setShowPrev] = useState(false); // Defines if it is to show the "...Prev"
  const [showMore, setShowMore] = useState(false); // Defines if it is to show the "More..."

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

  /* console.log(alumniData); */

  return (
    <AnimatePresence>
      {hoveredCluster &&
        listAlumniNames.length > 0 &&
        listLinkedinLinks.length > 0 &&
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
                                src={alumni.profile_pic_url || ""}
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
                        <TableCell className="text-sm text-gray-600 font-bold   ">{alumni.courses?.replace(/_/g, ".")}</TableCell>
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ClusterInfo;
