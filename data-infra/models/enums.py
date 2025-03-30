import enum

class CourseType(enum.Enum):
    INTEGRATED = "INTEGRATED"
    BACHELORS = "BACHELORS"
    MASTERS = "MASTERS"
    DOCTORATE = "DOCTORATE"

class GraduationStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    GRADUATED = "GRADUATED"
    DROPOUT = "DROPOUT"
    EXTERNAL = "EXTERNAL"
    NOT_ENROLLED = "NOT_ENROLLED"

class CourseStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class SeniorityLevel(enum.Enum):
    INTERN = "INTERN"
    ENTRY_LEVEL = "ENTRY_LEVEL"
    ASSOCIATE = "ASSOCIATE"
    MID_SENIOR_LEVEL = "MID_SENIOR_LEVEL"
    DIRECTOR = "DIRECTOR"
    EXECUTIVE = "EXECUTIVE"
    C_LEVEL = "C_LEVEL" 