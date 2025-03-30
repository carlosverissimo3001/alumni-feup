import json
import os
import sys
import pandas as pd
from datetime import datetime
import pytz
from dataclasses import dataclass
from typing import Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import DatabaseConnection
from db.models import Role, JobClassification, Alumni, Company, Location, RoleRaw

ALUMNI_DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "resultAPI_cleaned.csv")
NULL_ISLAND_ID='15045675-0782-458b-9bb7-02567ac246fd'

not_found_companies = []

@dataclass
class LocationArgs:
    city: Optional[str]
    country_code: Optional[str]
    country: Optional[str]

def load_alumni_data(file_path: str) -> pd.DataFrame:
    """ main_header = headers.columns.tolist()
    sub_header = headers.iloc[0].tolist()

    # Combine headers
    main_header = headers.columns.tolist()
    sub_header = headers.iloc[0].tolist()

    merged_headers = []
    current_main = None

    for main, sub in zip(main_header, sub_header):
        # If main header is unnamed, use sub header
        if "Unnamed:" in main:
            merged_headers.append(f"{current_main}-{sub}")
        else:
            current_main = main
            merged_headers.append(main)

    # Read the actual data with merged headers
    df = pd.read_csv(file_path, skiprows=2, names=merged_headers, low_memory=False)
    df.to_csv("resultAPI_cleaned.csv", index=False)"""
    return pd.read_csv(file_path)


def get_time_from_string(time_str: str) -> datetime:
    return (
        datetime.strptime(time_str, "%d/%m/%Y")
        .replace(tzinfo=pytz.utc)
        .strftime("%Y-%m-%d %H:%M:%S+00")
    )


class RoleSeeder:
    def __init__(self):
        self.db = DatabaseConnection()

    def add_role_with_classification(self, role: Role, job_classification_data: dict) -> str:
        with self.db.get_session() as session:
            try:
                # Add role
                session.add(role)
                session.flush()
                
                job_classification = JobClassification(
                    role_id=role.id,
                    **job_classification_data
                )
                session.add(job_classification)
                
                # Commit both operations
                session.commit()
                return role.id
                
            except Exception as e:
                session.rollback()  # Rollback on any error
                raise e

    def add_to_role_raw(self, role_id: str, description: str) -> str:
        with self.db.get_session() as session:
            role_raw = RoleRaw(
                role_id=role_id,
                description=description
            )
            session.add(role_raw)
            session.commit()
    
    def get_alumni_id_by_linkedin_url(self, linkedin_url: str) -> str:
        with self.db.get_session() as session:
            alumni = (
                session.query(Alumni)
                .filter(Alumni.linkedin_url == linkedin_url)
                .first()
            )
            if not alumni:
                raise ValueError(f"Alumni with linkedin url {linkedin_url} not found")
            return alumni.id

    def get_company_id_by_linkedin_url(self, linkedin_url: str) -> str:     
        if pd.isna(linkedin_url) or not linkedin_url or str(linkedin_url).lower() == 'nan':
            return None  
        with self.db.get_session() as session:
            company = (
                session.query(Company)
                .filter(Company.linkedin_url == linkedin_url)
                .first()
            )
            return company.id if company else None
    def get_company_id_by_name(self, company_name: str):
        with self.db.get_session() as session:
            company = (
                session.query(Company)
                .filter(Company.name == company_name)
                .first()
            )
            return company.id if company else None

    def get_location_id(self, location: LocationArgs) -> str | None:
        with self.db.get_session() as session:
            filters = []
            if location.country_code is not None:
                filters.append(Location.country_code == location.country_code.strip())
            if location.country is not None:
                filters.append(Location.country == location.country.strip())
            if location.city is not None:
                filters.append(Location.city == location.city.strip())

            existing_location = session.query(Location).filter(*filters).first()
            
            return existing_location.id if existing_location else None


if __name__ == "__main__":
    role_seeder = RoleSeeder()
    df = load_alumni_data(ALUMNI_DATA_FILE_PATH)
    df = df[6837:]

    alumni_id: str
    unassigned_roles: pd.DataFrame = pd.DataFrame()
    for idx, row in df.iterrows():
        # Only the first row of every alumni has the basic info
        if not pd.isna(row["Linkedin Link"]):
            alumni_id = row["Linkedin Link"]
            alumni_id = role_seeder.get_alumni_id_by_linkedin_url(alumni_id)

        # 1st col after experiences is the time
        # time=<start_date> - <end_date>
        # if current, end_date is "null/null/null"
        time = row["experiences-time"]
        if pd.isna(time):
            continue

        if "null" in time:
            unassigned_roles = pd.concat([unassigned_roles, pd.DataFrame([row])], ignore_index=True)
            continue

        start_date, end_date = time.split(" - ")

        start_date = get_time_from_string(start_date)

        if "null" in end_date:
            end_date = None
        else:
            end_date = get_time_from_string(end_date)

        company_linkedin_profile_url = row["experiences-company_linkedin_profile_url"]
        company_name = row["experiences-company"]
        company_id = role_seeder.get_company_id_by_linkedin_url(company_linkedin_profile_url)
        if not company_id:
            """ # let's try to get the company id from the name
            company_name = row["experiences-company"]
            if not company_name or pd.isna(company_name):
                raise ValueError(f"Company url and name not found for {alumni_id}")
            
            company_id = role_seeder.get_company_id_by_name(company_name)
            if not company_id:
                raise ValueError(f"Company not found: {company_name}") """
            not_found_companies.append({
                "url": company_linkedin_profile_url,
                "name": company_name
            })
            unassigned_roles = pd.concat([unassigned_roles, pd.DataFrame([row])], ignore_index=True)
            continue

        """if pd.isna(row["experiences-location"]):
            location_id = NULL_ISLAND_ID
        else:
            location = row["experiences-location"]
            location_parts = location.split(",")
            if len(location_parts) > 2:
                raise ValueError(f"Invalid location: {location}")
            
            if len(location_parts) == 2:
                country, city = location.split(",")
                state = None
            elif len(location_parts) == 1:
                country = location_parts[0]
                state = None
                city = None
            else:
                raise ValueError(f"Invalid location: {location}")

            location_id = role_seeder.get_location_id(LocationArgs(country, state, city)) """
        
        title = row["experiences-title"]
        if pd.isna(title):
            continue

        role = Role(
            alumni_id=alumni_id,
            company_id=company_id,
            start_date=start_date,
            end_date=end_date,
            # We don't have this in the data, so we'll just use ASSOCIATE
            seniority_level="ASSOCIATE",
        )

        job_classification_data = {
            "title": title,
            "level": 1,
            "confidence": 0.5,
        }

        role_id = role_seeder.add_role_with_classification(role, job_classification_data)

        # Let's now add to the role_raw table
        description = None if pd.isna(row["experiences-description"]) else row["experiences-description"]
        role_seeder.add_to_role_raw(role_id, description)
    
    with open("not_found_companies.json", "w") as f:
        json.dump(not_found_companies, f)

    unassigned_roles.to_csv("unassigned_roles.csv", index=False)
