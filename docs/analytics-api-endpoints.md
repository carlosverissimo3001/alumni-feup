# Analytics API Endpoints Specification

This document details the specific API endpoints required to support the analytics dashboard.

## Base Path

All analytics endpoints will use the base path: `/api/analytics`

## Common Query Parameters

These query parameters will be available on most endpoints:

- `startDate`: Filter data from this date (ISO format)
- `endDate`: Filter data until this date (ISO format)
- `courseIds`: Array of course IDs to filter by
- `graduationYears`: Array of graduation years to filter by
- `industryIds`: Array of industry IDs to filter by
- `locationIds`: Array of location IDs to filter by
- `limit`: Maximum number of results to return (default: 20)
- `offset`: Offset for pagination (default: 0)

## Company Analytics Endpoints

### Get Top Companies

Returns the companies employing the most alumni.

```
GET /api/analytics/companies/top
```

**Response Format:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Company Name",
      "alumniCount": 42,
      "logo": "url/to/logo.png"
    }
  ],
  "total": 100
}
```

### Get Company Distribution by Industry

Returns the number of alumni working in companies grouped by industry.

```
GET /api/analytics/companies/by-industry
```

**Response Format:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Industry Name",
      "companyCount": 15,
      "alumniCount": 42
    }
  ],
  "total": 100
}
```

### Get Company Growth Over Time

Returns company employment growth over time.

```
GET /api/analytics/companies/growth
```

**Query Parameters:**
- `companyIds`: Array of company IDs to include
- `timeGranularity`: "month", "quarter", or "year" (default: "year")

**Response Format:**

```json
{
  "timeSeries": [
    {
      "date": "2023-01-01T00:00:00Z",
      "companies": [
        {
          "id": "uuid",
          "name": "Company Name",
          "alumniCount": 42
        }
      ]
    }
  ]
}
```

### Get Company Details

Returns detailed information about a specific company, including alumni data.

```
GET /api/analytics/companies/:id/details
```

**Response Format:**

```json
{
  "id": "uuid",
  "name": "Company Name",
  "industry": {
    "id": "uuid",
    "name": "Industry Name"
  },
  "alumniCount": 42,
  "locations": [
    {
      "id": "uuid",
      "city": "City Name",
      "country": "Country Name",
      "alumniCount": 10
    }
  ],
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "alumniCount": 15
    }
  ],
  "roles": [
    {
      "title": "Job Title",
      "count": 5,
      "seniorityLevel": "ENTRY_LEVEL"
    }
  ]
}
```

## Location Analytics Endpoints

### Get Alumni Distribution by Location

Returns alumni distribution across locations.

```
GET /api/analytics/locations/distribution
```

**Query Parameters:**
- `groupBy`: "country" or "city" (default: "country")
- `countryIds`: Array of country IDs to filter by
- `cityIds`: Array of city IDs to filter by

> Note: This will probably be a bit hard to implement, but such is life.

**Response Format:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Location Name",
      "alumniCount": 42,
      "coordinates": {
        "latitude": 41.1496,
        "longitude": -8.6109
      }
    }
  ],
  "total": 100
}
```

### Get Location Migration Patterns

Returns alumni migration patterns between locations.

```
GET /api/analytics/locations/migration
```

**Response Format:**

```json
{
  "flows": [
    {
      "source": {
        "id": "uuid",
        "name": "Source Location"
      },
      "destination": {
        "id": "uuid",
        "name": "Destination Location"
      },
      "count": 10
    }
  ]
}
```

### Get Location Details

Returns detailed information about a specific location.

```
GET /api/analytics/locations/:id/details
```

**Response Format:**

```json
{
  "id": "uuid",
  "name": "Location Name",
  "alumniCount": 42,
  "companies": [
    {
      "id": "uuid",
      "name": "Company Name",
      "alumniCount": 10
    }
  ],
  "industries": [
    {
      "id": "uuid",
      "name": "Industry Name",
      "alumniCount": 15
    }
  ],
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "alumniCount": 20
    }
  ]
}
```

## Career Analytics Endpoints

### Get Role Distribution by Seniority

Returns the distribution of roles by seniority level.

```
GET /api/analytics/careers/seniority
```

**Response Format:**

```json
{
  "levels": [
    {
      "level": "ENTRY_LEVEL",
      "count": 150,
      "percentage": 30
    },
    {
      "level": "MID_SENIOR_LEVEL",
      "count": 200,
      "percentage": 40
    }
  ],
  "total": 500
}
```

### Get Common Career Paths

Returns common career progression paths.

```
GET /api/analytics/careers/paths
```

**Response Format:**

```json
{
  "paths": [
    {
      "nodes": [
        {
          "title": "Software Engineer",
          "level": "ENTRY_LEVEL",
          "count": 100
        },
        {
          "title": "Senior Software Engineer",
          "level": "MID_SENIOR_LEVEL",
          "count": 60
        },
        {
          "title": "Tech Lead",
          "level": "DIRECTOR",
          "count": 25
        }
      ],
      "count": 25,
      "averageYearsToProgress": [2.5, 3.2]
    }
  ]
}
```

### Get Top Job Titles

Returns the most common job titles among alumni.

```
GET /api/analytics/careers/titles
```

**Response Format:**

```json
{
  "items": [
    {
      "title": "Software Engineer",
      "count": 150,
      "industries": [
        {
          "id": "uuid",
          "name": "Tech",
          "count": 100
        }
      ]
    }
  ],
  "total": 500
}
```

## Educational Analytics Endpoints

### Get Course Outcomes

Returns career outcomes by course.

```
GET /api/analytics/education/outcomes
```

**Response Format:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "alumniCount": 200,
      "topCompanies": [
        {
          "id": "uuid",
          "name": "Company Name",
          "count": 20
        }
      ],
      "topIndustries": [
        {
          "id": "uuid",
          "name": "Industry Name",
          "count": 50
        }
      ]
    }
  ]
}
```

### Get Graduation Trends

Returns graduation trends over time.

```
GET /api/analytics/education/graduation-trends
```

**Response Format:**

```json
{
  "years": [
    {
      "year": 2020,
      "total": 500,
      "byFaculty": [
        {
          "id": "uuid",
          "name": "Faculty Name",
          "count": 200
        }
      ],
      "byCourse": [
        {
          "id": "uuid",
          "name": "Course Name",
          "count": 100
        }
      ]
    }
  ]
}
```

### Get Course Career Comparison

Returns a comparison of career outcomes between courses.

```
GET /api/analytics/education/course-comparison
```

**Query Parameters:**
- `courseIds`: Array of course IDs to compare (required)

**Response Format:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "metrics": {
        "averageSalary": null, // If available in future
        "topIndustries": [
          {
            "id": "uuid",
            "name": "Industry Name",
            "percentage": 40
          }
        ],
        "seniorityDistribution": [
          {
            "level": "ENTRY_LEVEL",
            "percentage": 30
          }
        ],
        "locationDistribution": [
          {
            "id": "uuid",
            "name": "Location Name",
            "percentage": 25
          }
        ]
      }
    }
  ]
}
```

## Industry Analytics Endpoints

### Get Industry Distribution

Returns the distribution of alumni across industries.

```
GET /api/analytics/industries/distribution
```

**Response Format:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Industry Name",
      "alumniCount": 200,
      "percentage": 20
    }
  ],
  "total": 1000
}
```

### Get Industry Trends

Returns industry employment trends over time.

```
GET /api/analytics/industries/trends
```

**Query Parameters:**
- `timeGranularity`: "year" or "quarter" (default: "year")

**Response Format:**

```json
{
  "timeSeries": [
    {
      "date": "2020-01-01T00:00:00Z",
      "industries": [
        {
          "id": "uuid",
          "name": "Industry Name",
          "count": 150
        }
      ]
    }
  ]
}
```

### Get Industry Details

Returns detailed information about a specific industry.

```
GET /api/analytics/industries/:id/details
```

**Response Format:**

```json
{
  "id": "uuid",
  "name": "Industry Name",
  "alumniCount": 200,
  "companies": [
    {
      "id": "uuid",
      "name": "Company Name",
      "alumniCount": 50
    }
  ],
  "topRoles": [
    {
      "title": "Job Title",
      "count": 30
    }
  ],
  "courseDistribution": [
    {
      "id": "uuid",
      "name": "Course Name",
      "count": 75
    }
  ],
  "locationDistribution": [
    {
      "id": "uuid",
      "name": "Location Name",
      "count": 40
    }
  ]
}
```

## Summary Statistics Endpoints

### Get Dashboard Summary

Returns summary metrics for the dashboard.

```
GET /api/analytics/summary
```

**Response Format:**

```json
{
  "totalAlumni": 5000,
  "totalCompanies": 1200,
  "totalLocations": 85,
  "totalCourses": 30,
  "totalIndustries": 25,
  "recentTrends": {
    "fastestGrowingCompanies": [
      {
        "id": "uuid",
        "name": "Company Name",
        "growthRate": 25.5
      }
    ],
    "fastestGrowingIndustries": [
      {
        "id": "uuid",
        "name": "Industry Name",
        "growthRate": 15.2
      }
    ],
    "emergingLocations": [
      {
        "id": "uuid",
        "name": "Location Name",
        "growthRate": 30.1
      }
    ]
  }
}
```

## Data Types and Enums

```typescript
enum SeniorityLevel {
  INTERN = "INTERN",
  ENTRY_LEVEL = "ENTRY_LEVEL",
  ASSOCIATE = "ASSOCIATE",
  MID_SENIOR_LEVEL = "MID_SENIOR_LEVEL",
  DIRECTOR = "DIRECTOR",
  EXECUTIVE = "EXECUTIVE",
  C_LEVEL = "C_LEVEL"
}

enum TimeGranularity {
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year"
}

enum LocationGroupBy {
  COUNTRY = "country",
  CITY = "city"
}
``` 