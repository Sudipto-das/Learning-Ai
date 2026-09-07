from pydantic import BaseModel


class ResumeData(BaseModel):
    name: str
    email: str
    phone: str
    skills: list[str]
    experience_years: float
    experience_details: list[str]
    projects: list[str]
    education: list[str]
    certifications: list[str]


class HRRequirements(BaseModel):
    required_skills: list[str]
    preferred_skills: list[str]
    min_experience_years: float
    required_projects: list[str]
    required_education: list[str]


class MatchResult(BaseModel):
    skill_match: float
    experience_match: float
    project_match: float
    education_match: float
    overall_match: float
   
