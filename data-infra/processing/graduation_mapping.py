import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import DatabaseConnection
from db.models import CourseExtraction, Alumni, Graduation

class GraduationMapping:
    def __init__(self):
        self.db = DatabaseConnection()

    def list_unparsed_extractions(self) -> list[CourseExtraction]:
        with self.db.get_session() as session:
            return (
                session.query(CourseExtraction)
                .filter(CourseExtraction.parsed == False)
                .all()
            )

    def get_alumni_by_first_and_last_name(self, first_name: str, last_name: str) -> list[Alumni] | None:
        with self.db.get_session() as session:
            return (
                session.query(Alumni)
                .filter(Alumni.first_name == first_name, Alumni.last_name == last_name)
                .all()
            )
    
    def mark_extraction_as_parsed(self, id):
        with self.db.get_session() as session:
            session.query(CourseExtraction).filter(CourseExtraction.id == id).update({"parsed": True})
            session.commit()
    
    def add_graduation(self, graduation: Graduation):
        with self.db.get_session() as session:
            session.add(graduation)
            session.commit()

if __name__ == "__main__":
    mapping = GraduationMapping()

    # 0. Get extractions
    extractions = mapping.list_unparsed_extractions()
    print(f"Found {len(extractions)} extractions to parse")

    # 1. Group extractins by full name
    extractions_by_name : dict[str, list[CourseExtraction]] = {}
    for extraction in extractions:
        full_name = extraction.full_name
        if full_name not in extractions_by_name:
            extractions_by_name[full_name] = []
        extractions_by_name[full_name].append(extraction)

    print(f"Found extractions for {len(extractions_by_name)} students")

    # 2. How many matches can we find?
    multiple_matches = 0
    no_matches = 0
    matches = 0
    for full_name, extractions in extractions_by_name.items():
        name_parts = full_name.split(" ")
        alumni = mapping.get_alumni_by_first_and_last_name(name_parts[0], name_parts[-1])
        
        if len(alumni) > 1:
            multiple_matches += 1
        elif len(alumni) == 0:
            no_matches += 1
        else:
            matches += 1
            for extraction in extractions:
                graduation = Graduation(
                    alumni_id=alumni[0].id,
                    course_id=extraction.course_id,
                    conclusion_year=extraction.conclusion_year,
                )

                # Add graduation to DB
                mapping.add_graduation(graduation)

                # Mark extraction as parsed
                mapping.mark_extraction_as_parsed(extraction.id)
            
    print(f"Out of {len(extractions_by_name)} students, we found:")
    print(f"- {multiple_matches} with multiple matches")
    print(f"- {no_matches} with no matches")
    print(f"- {matches} with a single match")

