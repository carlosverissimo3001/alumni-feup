import unicodedata
from typing import Dict, Optional

from app.db.models import Company, CompanyType

LEVELS_FYI_COMPANY_MAPPINGS: Dict[str, str] = {
    "Alphabet": "google",
    "T-Mobile": "tmobile",
    "LinkedIn": "microsoft",
    # In levels.fyi, all link to facebook
    "Meta": "facebook",
    "WhatsApp": "facebook",
    "Instagram": "facebook",
    "YouTube": "google",
    # Location specific
    "PwC Portugal": "pwc",
    "PwC Luxembourg": "pwc",
    "Ubisoft Paris Studio": "ubisoft",
    "Ubisoft Montréal": "ubisoft",
    "Ubisoft Annecy": "ubisoft",
    "KPMG Portugal": "kpmg",
    "NEC Laboratories America, Inc.": "nec",
    "NEC Europe": "nec",
    "Natixis in Portugal": "natixis",
    "Accenture Portugal": "accenture",
    "Accenture UK & Ireland": "accenture",
    "Fujitsu Portugal": "fujitsu",
    "Claranet Portugal": "claranet",
    # Parent companies
    "Kuehne & Nagel": "kuehnenagel",
    "Bosch Portugal": "bosch-global",
    "Deloitte Digitall": "deloitte",
    "Ocado Technology": "ocado-group",
    "Expedia Group": "expedia",
    "Flutter UK & Ireland": "flutter",
    "Flutter Entertainment": "flutter",
    "Natixis Corporate & Investment Banking": "natixis",
    # Other non standard names
    "Just Eat Takeaway.com": "just-eat",
    "P&G": "procter-and-gamble",
    "Bosch Security and Safety Systems": "bosch-global",
    "Bosch": "bosch-global",
    "Bosch Thermotechnik GmbH": "bosch-global",
    "JPMorganChase": "jpmorgan-chase",
    "EY": "ernst-and-young",
    "OLX": "olx-group",
    "Hewlett Packard Enterprise": "hp",
    "Funding Circle UK": "funding-circle",
    "Mercedes-Benz AG": "mercedes-benz",
    "Picnic Technologies": "picnic",
    "Capgemini Engineering": "capgemini",
    "Ford Motor Company": "ford-motor",
    "NTT DATA Europe & Latam": "ntt-data",
    "NTT DATA Business Solutions": "ntt-data",
    "NTT DATA, Inc.": "ntt-data",
    "Devoteam | Cyber Trust": "devoteam",
    "The Janssen Pharmaceutical Companies of Johnson & Johnson": "johnson-and-johnson",
    "JD Sports Fashion": "jd-sports",
    "Renault": "renault-group",
    "Lufthansa": "lufthansa-group",
    "McKinsey & Company": "mckinsey",
    "A.P. Moller - Maersk": "maersk",
    "Walmart Global Tech": "walmart",
    "Sony Interactive Entertainment": "sony",
    "Synopsys Inc": "synopsys",
    "Verizon Business": "verizon",
    "Bose Corporation": "bose",
    "BNP Paribas - Securities Services": "bnp-paribas",
    "Inmarsat": "inmarsat-government",
    "ESL FACEIT Group - EFG": "faceit",
    "Palantir Technologies": "palantir",
    "Amazon Web Services (AWS)": "amazon",
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
        .replace("+", "")
        .replace("(", "")
        .replace(")", "")
        .strip("-")
    )
    
    # use NFKD normalization to remove é, ã, etc.
    normalized = unicodedata.normalize("NFKD", normalized)

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
