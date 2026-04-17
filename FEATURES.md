# ⚡ Radius Chat Bot – Feature Breakdown

A production-grade, highly-responsive real-time chat application built meticulously utilizing **FastAPI**, **React.js**, **WebSockets**, and **Tailwind CSS**. Designed efficiently to tackle robust full-stack problem solving and aesthetic UX architecture.

---

## 🔒 1. Scalable Authentication System
- **Secure Handling:** Features `bcrypt` payload hashing and stateless `JWT` (JSON Web Token) sessions managed via Python `passlib` equivalents.
- **Smart Username Resolution:** Registration seamlessly handles duplicate username conflicts using an automated Discord-styled tag discriminator assignment (Example: `John` automatically registers as uniquely identifiable `John#8492`), completely avoiding database collision errors and bad UX.

## 💬 2. Private 1-on-1 Real-Time Engine
- **Targeted WebSocket Routing:** Extends beyond naive global broadcasting. Connection managers actively dictionary-map JWT-authorized usernames to their respective active WS pipes, delivering JSON frames exclusively to intentional targets. 
- **Persisted History Context:** Messages immediately hydrate upon chat focus, querying the locally mounted SQLite (or PostgreSQL-ready) database safely via `SQLAlchemy` asynchronous bounds isolating chat history logically between unique interacting pairs.

## 💎 3. Adaptive "WhatsApp-Style" Interface
- **Vibrant UX / Aesthetics:** Avoids generic colors out of the box, leaning into a curated palette of elegant dark-neutral gradients, glassmorphism UI traits, and micro-hover CSS transitions.
- **Flawless Mobile Translation:** True responsive design using Tailwind's layout bounds seamlessly shifts from a desktop split-pane to an intuitive single-pane mobile flow outfitted with back-navigation arrows to swap seamlessly. 
- **Live Search & Initialization:** Validate and execute new chat instances on the fly without refreshing utilizing the instant search form.

## 🔔 4. Dynamic Unread Notifications & Contacts
- **Background Active Listeners:** Implements dual-layered WebSocket connections, anchoring a master listener to the root `App.tsx` state to passively capture incoming activity payload globally.
- **Intelligent Badging:** Unread messages immediately generate a distinct emerald badge counter by identifying sender frames outside of currently focused React instances, dynamically dropping the notification as soon as the user focuses that specific `ChatRoom`.

## 🤖 5. Embedded AI Assistant 
- **@ai Tag Processing:** An asynchronous background task aggressively filters chat text streams for `@ai` mentions without blocking server load.
- **Injectable Intelligence:** Simulated processing routing generates context-aware fallback data intelligently disguised as a secondary "System AI" user replying strictly to the author who initiated the webhook constraint natively directly inside their private context window.

## 🐳 6. Production-Ready Deployment
- **Dockerized Infrastructure:** Encases the architecture inside an orchestrated `docker-compose` network cleanly segregating the system via proxy configurations. 
- **Optimized Frontend Serving:** Bypasses Vite dev servers utilizing an Nginx Alpine container to multi-stage build dynamic files prioritizing cache rules and explicitly upgrading WebSocket Header headers cleanly translating to backend ports natively. 
