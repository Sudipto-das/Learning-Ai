import sys
import io
import json
import argparse

from .parsers import parse_resume
from .extractor import extract_resume_data, calculate_match_ai
from .models import HRRequirements

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description="Resume Screener")
    parser.add_argument("--resume", required=True, help="Path to resume (PDF/DOCX)")
    parser.add_argument("--requirements", required=True, help="Path to HR requirements JSON")
    args = parser.parse_args()

    resume_text = parse_resume(args.resume)
    resume_data = extract_resume_data(resume_text)

    with open(args.requirements, "r") as f:
        hr_requirements = HRRequirements(**json.load(f))

    result = calculate_match_ai(resume_data, hr_requirements)

    print(f"\nResume: {resume_data.name}")
    print(f"Overall Match: {result.overall_match}%")
    print(f"\nBreakdown:")
    print(f"  Skills: {result.skill_match}%")
    print(f"  Experience: {result.experience_match}%")
    print(f"  Projects: {result.project_match}%")
    print(f"  Education: {result.education_match}%")
  


if __name__ == "__main__":
    main()
