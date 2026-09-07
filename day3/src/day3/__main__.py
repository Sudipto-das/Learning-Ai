import os
import re
from groq import Groq
from dotenv import load_dotenv


load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# tools
def get_weather(city: str) -> str:
    """Fake weather data (real project me API use karo)"""
    weather_data = {
        "delhi": "32C, Cloudy",
        "mumbai": "34C, Humid",
        "bangalore": "25C, Pleasant",
        "kolkata": "33C, Rainy",
    }
    city_lower = city.lower().strip()
    if city_lower in weather_data:
        return f"{city.title()} ka weather: {weather_data[city_lower]}"
    return f"{city} ka weather data nahi mila"

TOOLS = {
    "weather": get_weather,
}

# ReAct prompt

def react_prompt(question: str) -> str:
    tools_description = """Available Tools:
1. weather(city) - Weather check karne ke liye. Example: weather(Delhi)
"""

    return f"""You are a helpful assistant. You MUST follow this exact format:

Thought: [Socho kya karna hai]
Action: tool_name(arguments)
Observation: [Tool ka result yahan aayega - mat likho, mujhe milega]
... (repeat Thought/Action/Observation jab tak answer na mile)
Thought: Ab mujhe sab kuch pata hai
Final Answer: [Final answer yahan likho]

{tools_description}

IMPORTANT RULES:
- Har step me sirf EK Action do
- Action me tool ka naam aur arguments do
- Format EXACTLY aisa hona chahiye: Action: calculator(2 + 2)
- Observation mat likho, wo auto aayega
- Jab answer mil jaaye to Final Answer me likho

Question: {question}"""

# action perser

def parse_action(text: str):
    """LLM ke output se action nikalo"""
    # Action dhundho: Action: tool_name(arguments)
    match = re.search(r'Action:\s*(\w+)\((.+?)\)', text)
    if match:
        tool_name = match.group(1)
        tool_args = match.group(2).strip('"').strip("'")
        return tool_name, tool_args
    return None, None


# main reAct loop


def run_react(question: str, max_iterations: int = 5):
    messages = [
        {"role": "system", "content": "You are a helpful ReAct agent. Follow the Thought/Action/Observation format strictly."}
    ]
    prompt = react_prompt(question)
    messages.append({"role": "user", "content": prompt})

    for i in range(max_iterations):
        # LLM call
        response = client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            temperature=0
        )
        llm_output = response.choices[0].message.content
        print(f"\nLLM Output:\n{llm_output}")
        
        if "Final Answer" in llm_output:
            final_answer = llm_output.split("Final Answer:")[-1].strip()
            print(f"\n{'='*50}")
            print(f"ANSWER: {final_answer}")
            print('='*50)
            return final_answer
        tool_name, tool_args = parse_action(llm_output)
        
        
        if tool_name and tool_name in TOOLS:
            # Tool call karo
            print(f"\n>> Calling Tool: {tool_name}({tool_args})")
            tool_result = TOOLS[tool_name](tool_args)
            print(f">> Result: {tool_result}")
            
            # LLM ko batao result kya aaya
            messages.append({"role": "assistant", "content": llm_output})
            messages.append({"role": "user", "content": f"Observation: {tool_result}"})
        else:
            # Tool nahi mila
            print(f"\n>> Tool '{tool_name}' nahi mila!")
            messages.append({"role": "assistant", "content": llm_output})
            messages.append({"role": "user", "content": "Observation: Tool not found. Please use available tools."})

    return "Max iterations ho gaye, answer nahi mil paya."

if __name__ == "__main__":
    # Test questions
    questions = [
        
        "Delhi ka weather kaisa hai?",
        "mumbai ka weather kaisa hai ?",
        
    ]
    
    for q in questions:
        run_react(q)
        print("\n")
            
            
        

