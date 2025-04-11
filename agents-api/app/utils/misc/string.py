def clean_website_url(website_url: str) -> str:
    """
    Clean a website URL by removing query parameters, ensuring it starts with http:// or https://
    
    Args:
        website_url: The URL to clean
        
    Returns:
        The cleaned URL
    """
    if not website_url:
        return None
    # Remove query parameters
    website_url = website_url.split('?')[0]
    
    # Ensure https and trailing slash
    website_url = ensure_https_protocol(website_url)
    website_url = add_trailing_slash(website_url)
    
    # Remove www 
    website_url = website_url.replace('www.', '')
    
    return website_url

def ensure_https_protocol(url: str) -> str:
    """
    Converts a URL to https:// if it doesn't already start with http:// or https://
    
    Args:
        url: The URL to ensure
        
    Returns:
        The URL with a protocol
    """
    if not url:
        return None
    if not url.startswith('http://') and not url.startswith('https://'):
        return 'https://' + url
    return url

def add_trailing_slash(url: str) -> str:
    """
    Adds a trailing slash to a URL if it doesn't already have one.
    
    Args:
        url: The URL to add a trailing slash to
        
    Returns:
        The URL with a trailing slash
    """
    if not url:
        return None
    return url + '/' if not url.endswith('/') else url
    
def sanitize_linkedin_url(linkedin_url: str) -> str:
    """ 
    Sanitizes a LinkedIn URL by removing www and country prefixes, ensuring https and trailing slash
    
    Args:
        linkedin_url: The LinkedIn URL to sanitize
        
    Returns:
        The sanitized LinkedIn URL
    """
    if not linkedin_url:
        return linkedin_url
        
    # Removes www and country prefixes
    if 'linkedin.com' in linkedin_url:
        parts = linkedin_url.split('linkedin.com')
        linkedin_url = 'https://linkedin.com' + parts[-1]
        
    # Ensure https and trailing slash
    linkedin_url = ensure_https_protocol(linkedin_url)
    linkedin_url = add_trailing_slash(linkedin_url)
        
    return linkedin_url