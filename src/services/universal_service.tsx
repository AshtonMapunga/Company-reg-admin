import axios from "axios";

const BASE_URL = "https://echolar-admin-final.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const UniversalApplyService = {
 
  async getAllUniversalApplyService() {
    try {
      const response = await api.get("/praz_reg_apply", {
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
      const response = await api.post("/praz_reg_apply", appiedData, {
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
      const response = await api.put(`/update/${id}`, updateData, {
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
      const response = await api.delete(`/delete/${id}`, {
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

export default UniversalApplyService;