import express from "express";
import { createPrescription } from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", createPrescription);

export default router;