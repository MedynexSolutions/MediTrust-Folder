import User from "../models/User.js";

export const getDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor" });
  res.json(doctors);
};