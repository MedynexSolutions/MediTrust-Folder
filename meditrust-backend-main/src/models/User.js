import bcrypt from "bcryptjs";
import { createSupabaseModel } from "./supabaseModel.js";

const User = createSupabaseModel({
  table: "users",
  beforeCreate: async (user) => ({
    ...user,
    password: await bcrypt.hash(user.password, await bcrypt.genSalt(10))
  }),
  methods: {
    async matchPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }
});

export default User;
