/**
* This class is responsible for listing the alumnis in a certain cluster. It also handles with Pagination 
*/
import React, {useEffect, useState} from 'react';

const ClusterInfo = ({
  hoveredCluster,
  listAlumniNames,
  listLinkedinLinks,
  listPlaceName,
  hoveredMouseCoords,
  alumniData,
  handleImageError
}) => {
    const nAlumniToShow = 10;                                                // Defines the nº of alumnis to show when a hoover is preformed
    const nAlumniToShowScrollBar = 5;                                        // Defines the nº of alumnis in which the scroll bar is going to show
    var   [startPosition, setStartPosition] = useState(0);                   // Position in the array to start to read from
    var   [endPosition, setEndPosition] = useState(nAlumniToShow-1);         // Position in the array to stop reading from. 0 is also a number therefore the -1
    var   [showPrev, setShowPrev] = useState(false);                        // Defines if it is to show the "...Prev"
    var   [showMore, setShowMore] = useState(false);                        // Defines if it is to show the "More..."

    useEffect(() => {
        if (!hoveredCluster) {
            setStartPosition(0);
            setEndPosition(nAlumniToShow-1);
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
        if (endPosition >= (alumniData.length-1)) { // endposition assumes a value bigger than the last arrays' position
          setShowMore(false);
        } else {
          setShowMore(true);
        }
    }, [alumniData.length, endPosition]);

    // Controls what should be done when the more button is pressed
    const handleShowMore = () => {
        setStartPosition(endPosition+1);
        if (endPosition+(nAlumniToShow) > (alumniData.length -1)) {
            setEndPosition(alumniData.length -1); // Defaults to the array's last position
        } else {
            setEndPosition(endPosition+(nAlumniToShow)); 
        }
        setShowPrev(true);
    }

    // Controls what should be done when the previous button is pressed
    const handleShowPrev = () => {
        setEndPosition(startPosition-1); 
        if (startPosition-(nAlumniToShow) < 0) {
            setStartPosition(0); // defaults to the first position of the array
        } else {
            setStartPosition(startPosition-(nAlumniToShow));
        }
        setShowMore(true);
    }


    return (
    <>
        {hoveredCluster && listAlumniNames.length > 0 && listLinkedinLinks.length > 0 && listPlaceName.length > 0 && (
        <div
            className="clusterRectangle"
            style={{
            position: 'absolute',
            top: `${hoveredMouseCoords[1]}px`,
            left: `${hoveredMouseCoords[0]}px`,
            }}
        >
            <span><b>Place:</b></span>
            <div style={{ maxHeight: listPlaceName.length > 10 ? '100px' : 'auto', overflow: 'auto' }}>
            {listPlaceName.map((place, index) => (
                <span key={index}>{place}{index !== listPlaceName.length - 1 && ', '}</span>
            ))}
            </div>
            <p></p>
            <ul className={`list-alumni${listAlumniNames.length > nAlumniToShowScrollBar ? ' scrollable' : ''}`}>
            <table className="alumni-table">
                <thead>
                <tr>
                    <th className="table-titles">Alumni</th>
                    <th className="table-titles">Course</th>
                    <th className="table-titles">Conclusion</th>
                </tr>
                </thead>
                <tbody>
                {alumniData
                    .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
                    .slice(startPosition, endPosition + 1) // endPosition+1 because slice() doesn't include the end
                    .map((alumni, index) => (
                    <tr key={index}>
                        <td>
                        <div className='alumni-cell'>
                            <img
                            className="profile-picture"
                            src={alumni.profilePics}
                            alt=""
                            onError={handleImageError}
                            />
                            <a
                            className="link"
                            href={alumni.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            {alumni.name}
                            </a>
                        </div>
                        </td>
                        <td>{alumni.courses}</td>
                        <td>{alumni.yearConclusions}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <div>
                {showPrev && <button className="my-button my-button-pagination-prev" onClick={handleShowPrev}>Prev</button>}
                {showMore && <button className="my-button my-button-pagination-more" onClick={handleShowMore}>More</button>}
            </div>
            </ul>
        </div>
        )}
    </>
    );
};

export default ClusterInfo;
