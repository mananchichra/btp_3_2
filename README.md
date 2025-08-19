# ArchWorkBench

**ArchWorkBench** is a web application for generating and managing Architectural Decision Records (ADRs) using AI. It enables users to create, store, and format ADRs in various industry-standard templates such as Michael Nygard's original, Y-Statements, and MADR. The system is built with a full-stack architecture:

- **Frontend**: React (Vite) client for interactive ADR creation and management.
- **Backend**: Express server with in-memory and database-backed storage for users and ADRs.
- **Database Schema**: Uses Drizzle ORM for PostgreSQL to define User and ADR models.

ADR templates, prompts, and management are handled through shared TypeScript modules, making the project easy to extend and customize.

## Installation

1. **Clone the repository**  
   ```bash
     git clone https://github.com/mananchichra/btp_3_2.git
     cd btp_3_2

1. Install dependencies
You need Node.js and npm installed.

```bash
  npm install
  ```
2. Provision the database

Set your PostgreSQL database URL in the environment:

```bash
  export DATABASE_URL=your_postgres_connection_string
```
3. Run database migrations
```bash
  npx drizzle-kit up
```
4. Build the client

```bash
  npm run build
```
5. Start the server

```bash
  npm run start
```
Access the application
by visiting http://localhost:3000 in your browser.



   
