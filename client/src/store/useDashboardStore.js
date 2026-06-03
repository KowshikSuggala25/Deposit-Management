import { create } from "zustand";
import api from "../api/client";

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const useDashboardStore = create((set, get) => ({
  dashboard: {
    summary: {
      totalBanks: 0,
      totalAccountHolders: 0,
      totalDepositedAmount: 0,
    },
    banks: [],
    pagination: { ...initialPagination, limit: 9 },
  },
  bankDetails: {
    bank: null,
    holders: [],
    pagination: { ...initialPagination },
  },
  holderDetails: {
    holder: null,
    stats: {
      totalDepositsCount: 0,
      totalDepositedAmount: 0,
    },
    deposits: [],
    pagination: { ...initialPagination },
  },
  loading: {
    dashboard: false,
    bankDetails: false,
    holderDetails: false,
    mutation: false,
  },

  setLoading: (key, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    })),

  fetchDashboard: async ({ search = "", page = 1, limit = 9 } = {}) => {
    get().setLoading("dashboard", true);

    try {
      const response = await api.get("/dashboard", {
        params: { search, page, limit },
      });

      set({ dashboard: response.data.data });
      return response.data.data;
    } finally {
      get().setLoading("dashboard", false);
    }
  },

  addBank: async (payload) => {
    get().setLoading("mutation", true);

    try {
      await api.post("/banks", payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  editBank: async (bankId, payload) => {
    get().setLoading("mutation", true);

    try {
      await api.put(`/banks/${bankId}`, payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  deleteBank: async (bankId) => {
    get().setLoading("mutation", true);

    try {
      await api.delete(`/banks/${bankId}`);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  fetchBankDetails: async (bankId, { search = "", page = 1, limit = 10 } = {}) => {
    get().setLoading("bankDetails", true);

    try {
      const response = await api.get(`/banks/${bankId}`, {
        params: { search, page, limit },
      });

      set({ bankDetails: response.data.data });
      return response.data.data;
    } finally {
      get().setLoading("bankDetails", false);
    }
  },

  addHolder: async (bankId, payload) => {
    get().setLoading("mutation", true);

    try {
      await api.post(`/banks/${bankId}/holders`, payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  editHolder: async (bankId, holderId, payload) => {
    get().setLoading("mutation", true);

    try {
      await api.put(`/banks/${bankId}/holders/${holderId}`, payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  deleteHolder: async (holderId) => {
    get().setLoading("mutation", true);

    try {
      await api.delete(`/holders/${holderId}`);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  fetchHolderDetails: async (
    holderId,
    { search = "", page = 1, limit = 10, range, startDate, endDate } = {}
  ) => {
    get().setLoading("holderDetails", true);

    try {
      const response = await api.get(`/holders/${holderId}`, {
        params: {
          search,
          page,
          limit,
          range,
          startDate,
          endDate,
        },
      });

      set({ holderDetails: response.data.data });
      return response.data.data;
    } finally {
      get().setLoading("holderDetails", false);
    }
  },

  addDeposit: async (holderId, payload) => {
    get().setLoading("mutation", true);

    try {
      await api.post(`/holders/${holderId}/deposits`, payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  editDeposit: async (depositId, payload) => {
    get().setLoading("mutation", true);

    try {
      await api.put(`/holders/deposits/${depositId}`, payload);
    } finally {
      get().setLoading("mutation", false);
    }
  },

  deleteDeposit: async (depositId) => {
    get().setLoading("mutation", true);

    try {
      await api.delete(`/holders/deposits/${depositId}`);
    } finally {
      get().setLoading("mutation", false);
    }
  },
}));

export default useDashboardStore;
