"use client"

import { Alumni } from "@/types/alumni";
import AlumniRow from "./alumniRow";

const AlumniTable = ({ alumni }: { alumni: Alumni[] }) => {
  return (
    <div>
      {alumni.map((alumni) => (
        <div key={alumni.id}>
          <AlumniRow {...alumni} />
        </div>
      ))}
    </div>
  );
}

export default AlumniTable;