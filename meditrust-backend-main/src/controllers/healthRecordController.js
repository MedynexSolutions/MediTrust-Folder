import HealthRecord from "../models/HealthRecord.js";

export const createHealthRecord = async (req, res) => {
  const record = await HealthRecord.create(req.body);
  res.json(record);
};