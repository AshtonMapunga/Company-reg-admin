import axios from "axios";

const BASE_URL = "https://echolar-admin-final.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const companyService = {
  async getAllCompanyApplications() {
    try {
      const response = await api.get("/applications", {
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching company applications:", error);
      throw error;
    }
  },

  async createCompanyApplication(companyData: any) {
    try {
      const response = await api.post("/applications", companyData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating company application:", error);
      throw error;
    }
  },

  async updateCompanyApplication(id: string, updateData: any) {
    try {
      const response = await api.put(`/applications/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating company application ${id}:`, error);
      throw error;
    }
  },

  async deleteCompanyApplication(id: string) {
    try {
      const response = await api.delete(`/applications/${id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting company application ${id}:`, error);
      throw error;
    }
  },

    async updateStatusService(id: string, statusData: { status: string }) {
    try {
      const response = await api.put(`/applications/${id}/status`, statusData, {
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

export default companyService;