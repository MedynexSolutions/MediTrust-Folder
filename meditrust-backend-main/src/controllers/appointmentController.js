import Appointment from "../models/Appointment.js";

export const bookAppointment = async (req, res) => {
  const appointment = await Appointment.create(req.body);
  res.json(appointment);
};