// Backend/routes/auth.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ✅ Register

// ===============================
// ✅ REGISTER ROUTE
// ===============================
const SKILL_SYNONYMS = new Map([
  ["js", "JavaScript"],["javascript", "JavaScript"],["reactjs", "React"],["react.js", "React"],["nodejs", "Node.js"],["node.js", "Node.js"],["expressjs", "Express"],["express.js", "Express"],
  ["ts", "TypeScript"],["typescript", "TypeScript"],["html5", "HTML"],["css3", "CSS"],
  ["py", "Python"],["python", "Python"],["golang", "Go"],["go", "Go"],["cpp", "C++"],["c++", "C++"],["c#", "C#"],["dotnet", ".NET"],[".net", ".NET"],["asp.net", "ASP.NET"],["aspnet", "ASP.NET"],
  ["rn", "React Native"],["react native", "React Native"],["flutter", "Flutter"],["swiftui", "SwiftUI"],["jetpack compose", "Jetpack Compose"],
  ["tf", "TensorFlow"],["tensorflow", "TensorFlow"],["pt", "PyTorch"],["pytorch", "PyTorch"],["sklearn", "scikit-learn"],["scikit", "scikit-learn"],
  ["ml", "Machine Learning"],["dl", "Deep Learning"],["ai", "Artificial Intelligence"],["cv", "Computer Vision"],["nlp", "NLP"],["llm", "LLMs"],["huggingface", "Hugging Face"],
  ["postgres", "PostgreSQL"],["postgresql", "PostgreSQL"],["mysql", "MySQL"],["mariadb", "MariaDB"],["sqlite", "SQLite"],["sql server", "SQL Server"],["mssql", "SQL Server"],["oracle", "Oracle"],
  ["mongo", "MongoDB"],["mongodb", "MongoDB"],["elastic", "Elasticsearch"],["elasticsearch", "Elasticsearch"],["solr", "Solr"],["meilisearch", "Meilisearch"],["typesense", "Typesense"],
  ["redis", "Redis"],["memcached", "Memcached"],["neo4j", "Neo4j"],["cassandra", "Cassandra"],["dynamodb", "DynamoDB"],["cosmosdb", "Cosmos DB"],["firestore", "Firestore"],["firebase", "Firebase"],["supabase", "Supabase"],
  ["k8s", "Kubernetes"],["kubernetes", "Kubernetes"],["helm", "Helm"],["istio", "Istio"],["linkerd", "Linkerd"],["docker", "Docker"],["podman", "Podman"],["containerd", "containerd"],
  ["aws", "AWS"],["amazon web services", "AWS"],["azure", "Azure"],["gcp", "GCP"],["google cloud", "GCP"],
  ["s3", "S3"],["amazon s3", "S3"],["ec2", "EC2"],["lambda", "Lambda"],["cloudfront", "CloudFront"],["route 53", "Route 53"],["rds", "RDS"],["dynamodb", "DynamoDB"],["ecs", "ECS"],["eks", "EKS"],
  ["bigquery", "BigQuery"],["pub/sub", "Pub/Sub"],["pubsub", "Pub/Sub"],["cloud run", "Cloud Run"],["cloud functions", "Cloud Functions"],["gke", "GKE"],
  ["app service", "App Service"],["cosmos db", "Cosmos DB"],["aks", "AKS"],["blob storage", "Blob Storage"],["azure functions", "Azure Functions"],
  ["graphql", "GraphQL"],["rest", "REST"],["rest api", "REST"],["rest apis", "REST"],["grpc", "gRPC"],["soap", "SOAP"],
  ["websocket", "WebSockets"],["websockets", "WebSockets"],["socket.io", "Socket.IO"],["sse", "Server-Sent Events"],
  ["jwt", "JWT"],["oauth", "OAuth2"],["oauth2", "OAuth2"],["oidc", "OIDC"],["sso", "SSO"],["tls", "TLS"],["ssl", "SSL"],["http", "HTTP"],["http/2", "HTTP/2"],["http/3", "HTTP/3"],["quic", "QUIC"],
  ["ci", "CI"],["cd", "CD"],["ci/cd", "CI/CD"],["gitops", "GitOps"],
  ["nginx", "Nginx"],["apache", "Apache"],["terraform", "Terraform"],["pulumi", "Pulumi"],["ansible", "Ansible"],["chef", "Chef"],["puppet", "Puppet"],
  ["git", "Git"],["github", "GitHub"],["gitlab", "GitLab"],["bitbucket", "Bitbucket"],["jira", "Jira"],["confluence", "Confluence"],
  ["webpack", "Webpack"],["vite", "Vite"],["rollup", "Rollup"],["parcel", "Parcel"],["babel", "Babel"],["eslint", "ESLint"],["prettier", "Prettier"],
  ["redux", "Redux"],["rtk", "Redux Toolkit"],["mobx", "MobX"],["zustand", "Zustand"],["rxjs", "RxJS"],["jquery", "jQuery"],
  ["jest", "Jest"],["vitest", "Vitest"],["mocha", "Mocha"],["chai", "Chai"],["jasmine", "Jasmine"],["karma", "Karma"],["cypress", "Cypress"],["playwright", "Playwright"],["selenium", "Selenium"],["rtl", "React Testing Library"],["react testing library", "React Testing Library"],
  ["prometheus", "Prometheus"],["grafana", "Grafana"],["elk", "ELK"],["elastic stack", "ELK"],["kibana", "Kibana"],["logstash", "Logstash"],["loki", "Loki"],["splunk", "Splunk"],
  ["opentelemetry", "OpenTelemetry"],["otel", "OpenTelemetry"],["datadog", "Datadog"],["new relic", "New Relic"],["sentry", "Sentry"],["cloudwatch", "CloudWatch"],["stackdriver", "Stackdriver"],
  ["airflow", "Airflow"],["dbt", "dbt"],["hadoop", "Hadoop"],["spark", "Spark"],["beam", "Apache Beam"],["kafka", "Kafka"],["rabbitmq", "RabbitMQ"],["pulsar", "Pulsar"],["nats", "NATS"],["mqtt", "MQTT"],
  ["sqs", "SQS"],["sns", "SNS"],
  ["mui", "Material UI"],["tailwind", "TailwindCSS"],["tailwindcss", "TailwindCSS"],["bootstrap", "Bootstrap"],
  ["nextjs", "Next.js"],["next.js", "Next.js"],["nuxt", "Nuxt"],["angular", "Angular"],["angularjs", "AngularJS"],["vue", "Vue"],["vue.js", "Vue"],["svelte", "Svelte"],["solidjs", "SolidJS"],
  ["d3", "D3.js"],["threejs", "Three.js"],["webgl", "WebGL"],["svg", "SVG"],["canvas", "Canvas"],
  ["oop", "Object-Oriented Programming"],["dsa", "Data Structures & Algorithms"],["dbms", "Databases"],["rdbms", "Relational Databases"],["nosql", "NoSQL"],
  ["seo", "SEO"],["a11y", "Accessibility"],["i18n", "Internationalization"],["l10n", "Localization"],
  ["microservices", "Microservices"],["serverless", "Serverless"],["jamstack", "Jamstack"],["pwa", "PWA"],
  ["tdd", "TDD"],["bdd", "BDD"],["ddd", "DDD"],["solid", "SOLID"],["clean architecture", "Clean Architecture"],
]);
const normalizeSkill = (s) => {
  const key = String(s || "").trim().toLowerCase();
  if (!key) return null;
  const mapped = SKILL_SYNONYMS.get(key);
  if (mapped) return mapped;
  const cleaned = key.replace(/\s+/g, " ").trim();
  const title = cleaned.split(" ").map((w) => w.length ? w[0].toUpperCase() + w.slice(1) : "").join(" ");
  return title;
};
  router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      year,
      branch,
      phone,
      address,
      resumeLink,
      profilePicture,
      skills,
      interests,
      achievements,
      learningObjectives,
      availability,
      experienceLevel,
      careerGoalsTags,
      preferredMentorshipStyle,
    } = req.body;

    // 🧩 Validation
    if (!name || !email || !password || !year) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // 🧠 Check if email exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

   

    // 🧾 Create user
    const normalizedSkills = Array.from(new Set((skills || []).map(normalizeSkill).filter(Boolean)));
    const user = await User.create({
      name,
      email,
      password,
      role,
      year,
      branch,
      phone,
      address,
      resumeLink,
      profilePicture,
      skills: normalizedSkills,
      interests,
      achievements,
      learningObjectives,
      availability,
      experienceLevel,
      careerGoalsTags,
      preferredMentorshipStyle,
    });

    // 🪪 Generate token
    const token = signToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin-only login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
export default router;
 