
from dotenv import load_dotenv
import sys

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    noise_cancellation,
    google,
)
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
load_dotenv()



class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION)

    async def run(self, message: str) -> str:
        # Mock response logic for web chatbot
        if not message.strip():
            return "Please say something, sir."
        if "hello" in message.lower():
            return "Hello, sir. How can I assist you today?"
        if "your name" in message.lower():
            return "My name is Friday, your personal assistant."
        return f"Of course, sir. You said: '{message}'"


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            voice="Charon"
        )
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )


def download_files():
    print("Downloading files...")
    # Add your file download logic here


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "download-files":
        download_files()
    else:
        agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))