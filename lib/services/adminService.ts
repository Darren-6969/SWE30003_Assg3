import { reportService } from "./reportService";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export const adminService = {
  login(username: string, password: string) {
    const ok = username === ADMIN_USER && password === ADMIN_PASS;
    return {
      success: ok,
      message: ok ? "Admin login successful." : "Invalid admin credentials.",
    };
  },

  getReport() {
    return reportService.getSystemSummary();
  },
};
