from typing import Dict, Optional

from app.db.models import Company, CompanyType

LEVELS_FYI_COMPANY_MAPPINGS: Dict[str, str] = {
    # Common abbreviations
    "P&G": "procter-and-gamble",
    "J&J": "johnson-and-johnson",
    "A&M": "am",
    "AT&T": "att",
    "H&M": "hm",
    
    # Different naming conventions
    "JP Morgan": "jpmorgan",
    "JPMorgan Chase": "jpmorgan",
    "JP Morgan Chase": "jpmorgan",
    "J.P. Morgan": "jpmorgan",
    
    # Shortened names
    "Meta": "facebook",
    "Alphabet": "google",
    
    # Special characters
    "T-Mobile": "tmobile",
    "Procter & Gamble": "procter-and-gamble",
    "Johnson & Johnson": "johnson-and-johnson",
    
    # Regional variations
    "Microsoft India": "microsoft",
    "Google Ireland": "google",
    
    # Acquisitions/Subsidiaries
    "LinkedIn": "microsoft",
    "WhatsApp": "meta",
    "Instagram": "meta",
    "YouTube": "google",
    
    # Location specific
    "PwC Portugal": "pwc",
    "PwC Luxembourg": "pwc",
}


def normalize_company_name(name: str) -> str:
    """
    Normalize company name for Levels.fyi URL.

    Args:
        name: Raw company name

    Returns:
        Normalized company name for Levels.fyi URL
    """
    clean_name = name.strip()
    if clean_name in LEVELS_FYI_COMPANY_MAPPINGS:
        return LEVELS_FYI_COMPANY_MAPPINGS[clean_name]

    normalized = (
        clean_name.lower()
        .replace(".", "")
        .replace("&", "and")
        .replace(" ", "-")
        .replace("'", "")
        .replace(",", "")
        .replace("(", "")
        .replace(")", "")
        .strip("-")
    )

    return normalized


def get_levels_fyi_name(company: Company) -> Optional[str]:
    """
    Get the Levels.fyi company name, handling special cases and normalization.

    Args:
        company_name: Original company name

    Returns:
        Normalized name for Levels.fyi URL or None if company should be excluded
    """
    EXCLUDED_COMPANY_TYPES = {
        CompanyType.SELF_OWNED,
        CompanyType.SELF_EMPLOYED,
    }

    if company.company_type in EXCLUDED_COMPANY_TYPES:
        return None

    return normalize_company_name(company.name)
