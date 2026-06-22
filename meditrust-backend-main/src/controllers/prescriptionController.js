import Prescription from "../models/Prescription.js";

export const createPrescription = async (req, res) => {
  const data = await Prescription.create(req.body);
  res.json(data);
};