import axios from "axios";

const BASE_URL = "https://echolar-admin-final.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

const VendorNumberService = {
  // GET all vendor numbers
  async getAllVendorNumbers() {
    try {
      const response = await api.get("/universal-applications", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching vendor numbers:", error);
      throw error;
    }
  },

  // CREATE a new vendor number
  async createVendorNumber(vendorData: any) {
    try {
      const response = await api.post("/universal-applications", vendorData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating vendor number:", error);
      throw error;
    }
  },

  // UPDATE a vendor number by ID
  async updateVendorNumber(id: string, updateData: any) {
    try {
      const response = await api.put(`/universal-applications/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating vendor number ${id}:`, error);
      throw error;
    }
  },

  // DELETE a vendor number by ID
  async deleteVendorNumber(id: string) {
    try {
      const response = await api.delete(`/universal-applications/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting vendor number ${id}:`, error);
      throw error;
    }
  },
};

export default VendorNumberService;
