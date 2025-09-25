// services/licenceService.ts
import axios from "axios";

const BASE_URL = "https://chatbotbackend-1ox6.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const LicenceService = {
  async getAllLicenceService() {
    try {
      const response = await api.get("/licence-applications", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching :", error);
      throw error;
    }
  },

  async createAppliedService(appiedData: any) {
    try {
      const response = await api.post("/licence-applications", appiedData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating :", error);
      throw error;
    }
  },

  async updateAppliedService(id: string, updateData: any) {
    try {
      const response = await api.put(`/update/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating  ${id}:`, error);
      throw error;
    }
  },

  async deleteAppliedService(id: string) {
    try {
      const response = await api.delete(`/delete/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting  ${id}:`, error);
      throw error;
    }
  },

  // ✅ Status update service
  async updateStatusService(id: string, statusData: { status: string }) {
    try {
      const response = await api.put(`/licence-applications/${id}/status`, statusData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for ${id}:`, error);
      throw error;
    }
  },
};

export default LicenceService;