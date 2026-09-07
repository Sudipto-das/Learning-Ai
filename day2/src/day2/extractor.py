import os
import re
import json
from dotenv import load_dotenv
from groq import Groq
from .models import ResumeData, HRRequirements, MatchResult

load_dotenv()

def extract_resume_data(resume_text: str) -> ResumeData:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    schema = ResumeData.model_json_schema()

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"""You are an expert resume parser. Extract structured data from the resume text strictly based on this JSON schema:
                {schema}
                Return ONLY valid JSON. No extra text, no explanation."""
            },
            {
                "role": "user",
                "content": f"""Extract all information from this resume:\n\n{resume_text}"""
            }
        ],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"}
    )

    answer = response.choices[0].message.content
    raw_json = answer.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(raw_json)

    return ResumeData(**data)


def calculate_match_ai(resume_data: ResumeData, hr_requirements: HRRequirements) -> MatchResult:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    schema = MatchResult.model_json_schema()

    prompt = f"""You are an expert HR recruiter. Analyze this resume against the job requirements and give a match score.
    Resume Data:{resume_data.model_dump_json(indent=2)}

    Job Requirements:{hr_requirements.model_dump_json(indent=2)}
    Score each category from 0-100 based on how well the resume matches:
    - skill_match: How many required/preferred skills are present
    - experience_match: Does the candidate have enough years of experience
    - project_match: Does the candidate have relevant project experience
    - education_match: Does the candidate have the required education
    - overall_match: Weighted average (skills 40%, experience 30%, projects 20%, education 10%)


    Return ONLY valid JSON matching this schema:{schema}"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert HR recruiter. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"}
    )

    answer = response.choices[0].message.content
    raw_json = answer.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(raw_json)

    return MatchResult(**data)
