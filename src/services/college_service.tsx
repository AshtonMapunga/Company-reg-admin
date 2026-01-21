import axios from "axios";

const BASE_URL = "https://echolar-admin-final.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const CollegeRegService = {
  // ✅ Get all college registrations
  async getAllCollegeRegistrations() {
    try {
      const response = await api.get("/college_applications", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching college registrations:", error);
      throw error;
    }
  },

  // ✅ Create new college registration
  async createCollegeRegistration(registrationData: any) {
    try {
      const response = await api.post("/college_applications", registrationData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating college registration:", error);
      throw error;
    }
  },

  // ✅ Update college registration
  async updateCollegeRegistration(id: string, updateData: any) {
    try {
      const response = await api.put(`/college_applications/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating college registration ${id}:`, error);
      throw error;
    }
  },

  // ✅ Delete college registration
  async deleteCollegeRegistration(id: string) {
    try {
      const response = await api.delete(`/college_applications/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting college registration ${id}:`, error);
      throw error;
    }
  },
};

export default CollegeRegService;