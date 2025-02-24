import { Alumni } from "@/types/alumni";

const AlumniRow = (alumni: Alumni) => {
  return (
    <div>
      <h1>{alumni.first_name} {alumni.last_name}</h1>
    </div>
  );
}

export default AlumniRow;