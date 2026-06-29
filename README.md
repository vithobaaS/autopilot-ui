# AutoPilot Platform

AutoPilot is a high-performance web browser automation platform designed for distributed execution orchestration. It consists of three core components:

---

## 📂 Project Structure

```text
localagent/
├── autopilot-ui/           # React/Vite Frontend (Web Dashboard)
├── autopilot-master/       # Cloud Coordinator Broker service (Spring Boot)
├── autopilot-worker/       # AutoPropel LocalAgent application runner (Spring Boot)
├── service-packaging/      # Windows Service wrappers and registration scripts
├── docker-compose.yml      # Local development database infrastructure
└── pom.xml                 # Workspace parent POM for the Java projects
```

---

## 🛠️ Prerequisites
- **Java**: JDK 21 or JDK 25 installed and configured on your `PATH`.
- **Node.js**: v18+ (for running the React UI).
- **Browsers**: Google Chrome and/or Mozilla Firefox installed in default system paths.
- **Docker**: For running the local PostgreSQL database.

---

## 🏗️ Local Development Setup

To run the entire distributed platform on your local machine, follow these steps in order:

### 1. Start the Local Database
We use Docker to spin up a local PostgreSQL database for development, so you don't need to connect to AWS.
From the root of the project:
```bash
docker-compose up -d
```
*(This starts PostgreSQL on port `5432` with credentials `user: localagent`, `password: localagent`)*

### 2. Start the Master (Cloud Coordinator)
The Master broker manages the database, serves the API, and schedules jobs.
Open a new terminal at the root of the project:
```bash
.\mvnw.cmd clean spring-boot:run -pl autopilot-master -Dspring-boot.run.profiles=default -DJWT_SECRET=supersecretjwtkeythatismorethan256bits
```
*(The Master will start on port `9090`)*

### 3. Start the UI (React Frontend)
The frontend dashboard allows you to visually interact with the platform.
Open a new terminal at the root of the project:
```bash
cd autopilot-ui
npm install
npm run dev
```
*(The UI will start on port `5173` and proxy API requests to the Master on `9090`)*

### 4. Start the Worker (Execution Engine)
The Worker actually drives the browser and runs the tests. It will automatically connect to your local Master to fetch jobs.
Open a new terminal at the root of the project:
```bash
.\mvnw.cmd clean spring-boot:run -pl autopilot-worker/localagent-java
```
*(The Worker will start on port `8080` and begin polling `http://localhost:9090` for jobs)*

---

## ☁️ Cloud / Production Deployment
When deploying to AWS or another cloud provider:
1. Deploy `autopilot-master` to an EC2 instance or ECS container and point it to a managed PostgreSQL RDS database using `DB_URL`, `DB_USER`, and `DB_PASS`.
2. Build and deploy `autopilot-ui` (e.g. via S3 + CloudFront or an Nginx container).
3. Distribute the `autopilot-worker` to the testing nodes. Set the `LOCALAGENT_CLOUD_URL` environment variable on the workers to point to your public Master API.

Example for Worker:
```bash
set LOCALAGENT_CLOUD_URL=https://api.yourdomain.com
set LOCALAGENT_AGENT_ID=agent_windows_01
```
