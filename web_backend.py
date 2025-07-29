from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


# Import your assistant logic here
import asyncio
from agent import Assistant
from prompts import AGENT_INSTRUCTION

assistant = Assistant()

async def get_assistant_reply(message: str) -> str:
    # Use the Assistant agent to generate a reply
    # This assumes Assistant has an async method to generate a reply, e.g., .run() or similar
    # If not, replace with the correct method
    if hasattr(assistant, 'run'):
        return await assistant.run(message)
    elif hasattr(assistant, 'generate_reply'):
        return await assistant.generate_reply(message)
    else:
        return "Sorry, Friday is not fully configured."

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/", StaticFiles(directory="web", html=True), name="web")

@app.post("/api/ask")
async def ask(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    reply = await get_assistant_reply(user_message)
    return JSONResponse({"reply": reply})

if __name__ == "__main__":
    uvicorn.run("web_backend:app", host="0.0.0.0", port=8000, reload=True)
