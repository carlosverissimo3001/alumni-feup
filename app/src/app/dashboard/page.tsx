"use client"

import AlumniTable from "./alumni/alumniTable";
import { useState, useEffect } from "react";
import { Alumni } from "@/types/alumni";
import { Skeleton } from "@/components/ui/skeleton"
import AlumniApi from "@/api";


export default function Dashboard() {
  // TEST:
  /* const [alumni, setAlumni] = useState<Alumni[]>([])
  
  useEffect(() => {
    AlumniApi.alumniControllerFindAll()
  }, [])

  console.log(alumni)


  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {alumni.length > 0 ? (
        <AlumniTable alumni={alumni} />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  ); */
  return (
    <div>
      <h1>Welcome to the dashboard</h1>
      <p>This page is still under construction :)</p>
    </div>
  );
}