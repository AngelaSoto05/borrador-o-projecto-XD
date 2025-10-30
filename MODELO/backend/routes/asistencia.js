import express from "express";
import { db } from "./db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { registros } = req.body;  

  registros.forEach(item => {
    db.query(
      "INSERT INTO asistencia (estudiante_id, fecha, estado) VALUES (?, CURDATE(), ?)",
      [item.id, item.estado]
    );
  });

  res.json({ msg: "✅ Asistencia guardada en MySQL" });
});

export default router;
