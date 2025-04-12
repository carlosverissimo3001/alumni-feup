import logging

from sqlalchemy.orm import Session

from app.db.models import Company

logger = logging.getLogger(__name__)
def get_company_by_linkedin_url(linkedin_url: str, db: Session) -> Company | None:
    return db.query(Company).filter(Company.linkedin_url == linkedin_url).first()


def create_company(company: Company, db: Session) -> Company:
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def insert_company(company: Company, db: Session) -> Company:
    logger.info(f"Inserting company {company.name} into the database")
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

def update_company(company: Company, db: Session) -> Company:
    """
    Update a company record with new data.
    
    Args:
        company: Company object with updated fields
        db: Database session
        
    Returns:
        Updated company record
    """
    logger.info(f"Updating company {company.name} in the database")
    
    existing_company = db.query(Company).filter(Company.id == company.id).first()
    if existing_company:
        for key, value in vars(company).items():
            if not key.startswith('_') and key != 'id' and value is not None:
                setattr(existing_company, key, value)
        
        db.commit()
        db.refresh(existing_company)
    return existing_company

def get_all_companies_with_logo_url(db: Session) -> list[Company]:
    return db.query(Company).filter(Company.logo is not None).all()


