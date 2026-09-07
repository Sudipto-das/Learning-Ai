import os
import sys
import io
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

class Ticket(BaseModel):
    name:str
    email:str
    issue:str
    
schema = Ticket.model_json_schema()

response_format = {
    "type":"json_object"
}

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
text = "my name is sudipto.my food is not deliverd . my email is sudipto@gmail.com"

response = client.chat.completions.create(
    messages=[{
        "role":"system","content":f"""
                Extract the personal information from the ticket strictly based on this schema and give a json output.
                {schema};
                """
            },
        {"role": "user", "content": f"""
            This is a customer ticket. Please extract the personal information from this.
            {text}
            """
    }],
    model="qwen/qwen3.6-27b",
    temperature=1,
    max_completion_tokens=2048,
    response_format=response_format

)

import re
import json

answer=response.choices[0].message.content

cleaned = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL)
raw_json = cleaned.strip().removeprefix("```json").removesuffix("```").strip()
data_file=json.loads(raw_json)
ticket=Ticket(**data_file)

print(ticket.name)
print(ticket.email)
print(ticket.issue)

