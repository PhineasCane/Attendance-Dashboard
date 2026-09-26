import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret_key";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendance_demo",
  password: "Canenjoroge18",
  port: 5432,
});

const authenticateJWT = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401).json({ error: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403).json({ error: "Forbidden" });
    (req as any).user = user;
    next();
  });
};

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = rows[0];

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
    );
    res.json({ token, role: user.role });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get(
  "/api/classes",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    let result;
    if (user.role === "Admin") {
      result = await pool.query(
        "SELECT c.*, array_agg(cs.student_id) as student_ids FROM classes c LEFT JOIN class_students cs ON c.id = cs.class_id GROUP BY c.id",
      );
    } else if (user.role === "Teacher") {
      result = await pool.query(
        "SELECT c.*, array_agg(cs.student_id) as student_ids FROM classes c LEFT JOIN class_students cs ON c.id = cs.class_id WHERE c.teacher_id = $1 GROUP BY c.id",
        [user.id],
      );
    } else {
        result = await pool.query(
            "SELECT c.* FROM classes c JOIN class_students cs ON c.id = cs.class_id WHERE cs.student_id = $1",
            [user.id]
        );
    } res.json(result.rows);
  },
);

app.get('/api/attendance/summary', authenticateJWT, async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (user.role === 'Admin') {
        const { rows } = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present FROM attendance");
        const total = parseInt(rows[0].total);
        const present = parseInt(rows[0].present);
        return res.json({ total, present });
    }
    if (user.role === 'Teacher') {
        const { rows } = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present FROM attendance a JOIN classes c ON a.class_id = c.id WHERE c.teacher_id = $1", [user.id]);
        return res.json({ totalRecords: rows[0].total, present: rows[0].present });
    }
    const { rows } = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present FROM attendance WHERE student_id = $1", [user.id]);
    const total = parseInt(rows[0].total);
    const present = parseInt(rows[0].present);
    res.json({ attendancePercentage: total ? (present / total) * 100 : 0});
});

app.post('/api/attendance/mark', authenticateJWT, async (req: Request, res: Response) => {
    if ((req as any).user.role !== 'Teacher')
    return res.status(403).json({ error: 'Only teachers can mark attendance' });
    const { classId, studentId, date, status } = req.body;

    const { rows } = await pool.query("INSERT INTO attendance (class_id, student_id, date, status) VALUES ($1, $2, $3, $4) RETURNING *", [classId, studentId, date, status]);
    res.json(rows[0]);
});

const seedDB = async () => {
    try {
        await pool.query("DROP TABLE IF EXISTS attendance CASCADE; DROP TABLE IF EXISTS class_students CASCADE; DROP TABLE IF EXISTS classes CASCADE; DROP TABLE IF EXISTS users CASCADE; CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) CHECK (role IN ('Student', 'Teacher', 'Admin'))); CREATE TABLE classes (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, teacher_id INT REFERENCES users(id)); CREATE TABLE class_students (class_id INT REFERENCES classes(id), student_id INT REFERENCES users(id), PRIMARY KEY (class_id, student_id)); CREATE TABLE attendance (id SERIAL PRIMARY KEY, class_id INT REFERENCES classes(id), student_id INT REFERENCES users(id), date DATE NOT NULL, status VARCHAR(20) CHECK (status IN ('Present', 'Absent')));");
        const hash = bcrypt.hashSync("password123", 10);
        await pool.query("INSERT INTO USERS (username, password, role) VALUES ('admin1', $1, 'Admin'), ('admin2', $1, 'Admin'), ('teacher1', $1, 'Teacher'), ('teacher2', $1, 'Teacher')", [hash]);
        let studentInsert = "INSERT INTO USERS (username, password, role) VALUES ";
        const studentValues = [];
        for (let i = 1; i <= 15; i++) {
            studentInsert += `($${i*2 - 1}, $${i*2}, 'Student')${i < 15 ? ', ' : ''}`;
            studentValues.push(`student${i}`, hash);
        }
        await pool.query(studentInsert, studentValues);

        const teachers = (await pool.query("SELECT id FROM users WHERE role = 'Teacher' ORDER BY id")).rows;
        const students = (await pool.query("SELECT id FROM users WHERE role = 'Student' ORDER BY id")).rows;

        const c1 = await pool.query("INSERT INTO classes (name, teacher_id) VALUES ('Math 101', $1) RETURNING id", [teachers[0].id])).rows[0].id;
        const c2 = await pool.query("INSERT INTO classes (name, teacher_id) VALUES ('Science 101', $1) RETURNING id", [teachers[0].id])).rows[0].id;
        const c3 = await pool.query("INSERT INTO classes (name, teacher_id) VALUES ('History 101', $1) RETURNING id", [teachers[1].id])).rows[0].id;

        for (let i = 0; i < 5; i++) await pool.query("INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)", [c1, students[i].id]);
        for (let i = 5; i < 10; i++) await pool.query("INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)", [c2, students[i].id]);
        for (let i = 10; i < 15; i++) await pool.query("INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)", [c3, students[i].id]);

        for (let day = 1; day <= 7; day++) {
            const date = `2024-07-0${day}`;
            for (let i = 0; i < 5; i++) {
                const status = Math.random() > 0.2 ? 'Present' : 'Absent';
                await pool.query("INSERT INTO attendance (class_id, student_id, date, status) VALUES ($1, $2, $3, $4)", [c1, students[i].id, date, status]);
            }
        }
        console.log('Database seeded successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

app.listen(3001, async () => {
    console.log("Server is running on port 3001");
    seedDB();
});
