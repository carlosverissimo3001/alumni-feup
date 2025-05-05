from datetime import datetime
from typing import Optional

from app.db.models import CompanySize, CompanyType
from app.schemas.linkedin import ExperienceDate


def convert_company_type_to_enum(company_type: str) -> CompanyType | None:
    if company_type == 'Public Company':
        return CompanyType.PUBLIC_COMPANY
    elif company_type == 'Privately Held':
        return CompanyType.PRIVATELY_HELD
    elif company_type == 'Self-Owned':
        return CompanyType.SELF_OWNED
    elif company_type == 'Self-Employed':
        return CompanyType.SELF_EMPLOYED
    elif company_type == 'Partnership':
        return CompanyType.PARTNERSHIP
    elif company_type == 'Government Agency':
        return CompanyType.GOVERNMENT_AGENCY
    elif company_type == 'Nonprofit':
        return CompanyType.NON_PROFIT
    elif company_type == 'Educational':
        return CompanyType.EDUCATIONAL
    else:
        return None


def convert_company_size_to_enum(company_size: str) -> CompanySize:    
    if company_size == '1-10 employees':
        return CompanySize.B
    elif company_size == '11-50 employees':
        return CompanySize.C
    elif company_size == '51-200 employees':
        return CompanySize.D
    elif company_size == '201-500 employees':
        return CompanySize.E
    elif company_size == '501-1000 employees':
        return CompanySize.F
    elif company_size == '1,001-5,000 employees':
        return CompanySize.G
    elif company_size == '5,001-10,000 employees':
        return CompanySize.H
    elif company_size == '10,001+ employees':
        return CompanySize.I
    else:
        return CompanySize.A

def linkedin_date_to_timestamp(date_obj: ExperienceDate) -> Optional[datetime]:
    """
    Converts a LinkedIn date object to a Python datetime object.
    
    Args:
        date_obj: LinkedIn date format with day, month, year fields
        
    Returns:
        Datetime object or None if input was None
    """
    if not date_obj:
        return None
        
    year = date_obj.year
    if not year:
        return None
        
    month = date_obj.month
    day = date_obj.day
    
    try:
        return datetime(year, month, day)
    except (ValueError, TypeError):
        # Handle invalid dates
        return None
