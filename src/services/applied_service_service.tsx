import axios from "axios";

const BASE_URL = "https://echolar-admin-final.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const appiledService = {
 
  async getAllAppliedService() {
    try {
      const response = await api.get("/universal-applications", {
         headers: {
    "Content-Type": "application/json"
  }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching :", error);
      throw error;
    }
  },



  async createAppliedService(appiedData: any) {
    try {
      const response = await api.post("/universal-applications", appiedData, {
         headers: {
    "Content-Type": "application/json"
  }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating :", error);
      throw error;
    }
  },

  async updateAppliedService(id: string, updateData: any) {
    try {
      const response = await api.put(`/universal-applications/${id}`, updateData, {
         headers: {
    "Content-Type": "application/json"
  }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating  ${id}:`, error);
      throw error;
    }
  },

 
  async deleteAppliedService(id: string) {
    try {
      const response = await api.delete(`/universal-applications/${id}`, {
         headers: {
    "Content-Type": "application/json"
  }
   
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting  ${id}:`, error);
      throw error;
    }
  },

 
};

export default appiledService;