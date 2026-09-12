const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dhamzzz@@@333",
  database: "college_portal"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL connected successfully");
  }
});
app.post("/api/register", async (req, res) => {
  console.log("REGISTER REQUEST:", req.body);

  try {
    const {
      name,
      registerNumber,
      department,
      email,
      password
    } = req.body;

    if (!name || !registerNumber || !department || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users
      (name, register_number, department, email, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name,
        registerNumber,
        department,
        email,
        hashedPassword
      ],
      (err, result) => {
        if (err) {
          console.error("MYSQL ERROR:", err);

          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              message: "Email or Register Number already registered"
            });
          }

          return res.status(500).json({
            message: err.sqlMessage || err.message
          });
        }

        console.log("ACCOUNT CREATED:", result.insertId);

        return res.status(201).json({
          message: "Account created successfully",
          userId: result.insertId
        });
      }
    );

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({
        message: "Register Number and Password are required"
      });
    }

    const sql = `
      SELECT id, name, register_number, department, email, password
      FROM users
      WHERE register_number = ?
    `;

    db.query(sql, [registerNumber], async (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid Register Number or Password"
        });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid Register Number or Password"
        });
      }

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          registerNumber: user.register_number,
          department: user.department,
          email: user.email
        }
      });
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});