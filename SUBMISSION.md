# Radius Take-Home Assignment Submission

Thank you for the opportunity to present my solution for the lightweight real-time chat application! Aligning with the provided job description and core assessment requirements, I approached this project with a strong product-first mindset: ensuring reliability, clarity, and simplicity while injecting valuable, user-centric features beyond the basics.

## 🛠️ The Foundation

The core requirement was to build a system where users can instantly chat without refreshing. 
- **Tech Stack:** FastAPI (Python) elegantly manages the async WebSocket connections, while a React/Vite frontend (powered by TailwindCSS) delivers a slick, modern user interface.
- **Identity & Persistence:** Conversations are persistently stored in a SQLite database via SQLAlchemy. Users must register to establish an identity, and the system easily supports infinite 1-on-1 private conversations rather than just a simplistic global room.
- **Production Preparedness:** Docker and Docker Compose files are included to effortlessly launch the FastAPI backend along with an Nginx-served multi-stage React build.

## ✨ "Beyond the Basics": Standout Features

The assessment requested at least one feature that noticeably improves the experience. I chose to build several:

### 1. Smart Username Resolution (Discord-Style Tags)
**What it is:** When a user registers a name that is already taken (e.g., "John"), instead of throwing a frustrating "Username already exists" error, the system automatically appends a 4-digit discriminator tag (e.g., `John#8492`). It accepts the registration and gently notifies the user of their unique login.
**Why I chose it:** It solves the universal "username taken" drop-off problem while keeping database indexing robust, providing an effortless and reliable onboarding UX.

### 2. Read Receipts & Dynamic Unread Badges
**What it is:** Like WhatsApp, the UI actively indicates if your message was "Sent" or "Seen" by tracking read acknowledgements. Additionally, a background global WebSocket listener operates independently of your active chat. If a message arrives from a *different* user while you are busy, an emerald unread notification badge dynamically pops up next to their name in the sidebar.
**Why I chose it:** Presence, delivery tracking, and attention-routing are the lifeblood of communication tools. Being actively notified that someone is trying to reach you while engaged elsewhere makes the experience feel alive and dependable seamlessly without page reloads.

### 3. Asynchronous AI Agent Hook (`@ai`)
**What it is:** Referencing the "AI/LLM workflows" highlighted in the Job Description, users can tag `@ai` inside any private chat context. A detached background task picks up this webhook, isolates the text, and injects a simulated "System AI" response specific to the users interacting in that chat bounds.
**Why I chose it:** AI tools are accelerating proptech workspaces workflows. Permitting users to fetch data or trigger agents without having to leave the immediate context of their human-to-human discussion saves massive friction. 
*- **Important Note:** To keep this submission lightweight and avoid embedding secure API keys, the `ai_service.py` agent is currently stubbed out using basic `if/else` logic. However, the architectural foundation—detached routing, background processing, and WebSocket payload injection—is entirely intact and built specifically to effortlessly accommodate any standard LLM endpoint model natively.*

## 🚀 How to Run

To run the application cleanly, simply utilize the included Docker configuration:

```bash
docker-compose up --build
```
Once booted, access the app at `http://localhost:5173`. 

*(Alternatively, you can run `npm run dev` in the frontend and `uvicorn app.main:app` in the backend manually as outlined in the `README.md`)*.

---

## 🤖 Leveraging AI (Antigravity) for Autonomous Engineering

To build this project efficiently and align with modern engineering workflows, I heavily leveraged **Antigravity** (Google DeepMind's Advanced Agentic Coding tool) as an autonomous pair-programmer. My approach to utilizing it was deeply iterative, focusing on high-level architecture decisions while allowing the AI to scale the boilerplate:

1. **Initial Foundation:** My initial prompts focused on defining the tech stack securely: *"Design a production-grade chat system utilizing FastAPI WebSockets and React under strict TDD principles."* 
2. **Architectural Pivots:** Rather than settling for a minimum viable product, I iterated the scope natively using prompts like: *"Add login functionality for users and I want to chat with any person like WhatsApp by giving their username."* The agent effortlessly managed the schema transitions from global broadcasts to mapped 1-on-1 private pipes.
3. **Refining Product Experience:** I instructed the agent to solve UX bottlenecks autonomously with prompts like: *"What if two people have the same name? Find some way to tackle the username conflicts."* This resulted directly in the Discord-styled resolution architecture.
4. **UX Polishing & DevOps:** Finally, I prompted it to fine-tune edge cases (*"Add unread message badges,"* and *"Make this site mobile compatible,"*) and lock the system into deployments (*"Add Docker or Compose files"*). 

By acting as a "Principal Engineer" alongside an AI agent, I was able to rapidly expand the scale of this project from a basic room to a WhatsApp-clone within hours, demonstrating my ability to supervise, review, and leverage LLMs effectively in a product-driven startup environment.

---

Thank you for your time reviewing my code. I am eager to discuss my technical tradeoffs, system designs, and how I approached this build!
