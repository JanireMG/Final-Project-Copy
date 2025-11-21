import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  "/api",
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes("localhost") || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60, 
    },
  })
);


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const dbQuery = db.promise();

console.log("Pool de MySQL creado correctamente");

app.get("/", (req, res) => {
  res.send("Server OK");
});

app.get("/api/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, error: "User or password error" });

  try {
    const [results] = await dbQuery.query("SELECT * FROM users WHERE USERNAME = ?", [username]);

    if (results.length === 0)
      return res.status(401).json({ success: false, error: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.USER_PASSWORD);
    if (!match) return res.status(401).json({ success: false, error: "Password error" });

    req.session.user = { id: user.USER_ID, username: user.USERNAME };
    res.json({
      success: true,
      message: "Success login",
      user: {
        id: user.USER_ID,
        firstname: user.FIRSTNAME,
        username: user.USERNAME,
        email: user.EMAIL,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB error" });
  }
});


app.post("/api/register", async (req, res) => {
  const { firstname, username, email, password } = req.body;
  if (!firstname || !username || !email || !password)
    return res.status(400).json({ success: false, error: "Missing fields to fill in" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbQuery.query(
      "INSERT INTO users (FIRSTNAME, USERNAME, EMAIL, USER_PASSWORD) VALUES (?, ?, ?, ?)",
      [firstname, username, email, hashedPassword]
    );
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error("MySQL error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("USERNAME"))
        return res.status(400).json({ success: false, error: "User already in use." });
      if (err.message.includes("EMAIL"))
        return res.status(400).json({ success: false, error: "Email already in use." });
    }
    res.status(500).json({ success: false, error: "Error creating user" });
  }
});


app.post("/api/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Logout error" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  } else {
    res.status(400).json({ success: false, error: "No active session" });
  }
});


app.put("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username && !password)
    return res.status(400).json({ success: false, error: "Enter at least one field to update" });

  try {
    const fields = [];
    const values = [];

    if (username) {
      fields.push("USERNAME = ?");
      values.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("USER_PASSWORD = ?");
      values.push(hashedPassword);
    }

    values.push(id);

    const [result] = await dbQuery.query(`UPDATE users SET ${fields.join(", ")} WHERE USER_ID = ?`, values);

    if (result.affectedRows === 0)
      return res.json({ success: true, message: "No changes applied. User already exists." });

    if (username && req.session.user) req.session.user.username = username;

    res.json({
      success: true,
      message: "User successfully updated",
      updatedFields: { username: username || null, password: !!password },
    });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY" && err.message.includes("USERNAME"))
      return res.status(400).json({ success: false, error: "Username already in use" });
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server en marcha en puerto ${PORT}`);
});