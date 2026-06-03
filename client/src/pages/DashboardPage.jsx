import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiDownload, FiEdit2, FiPlus, FiUsers } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import toast from "react-hot-toast";
import useDashboardStore from "../store/useDashboardStore";
import SummaryCard from "../components/ui/SummaryCard";
import SearchInput from "../components/ui/SearchInput";
import GlassCard from "../components/ui/GlassCard";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Modal from "../components/ui/Modal";
import { formatINR } from "../utils/currency";
import { exportDashboardPdf } from "../utils/pdfExport";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { dashboard, loading, fetchDashboard, addBank, editBank, deleteBank } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    fetchDashboard({ search, page }).catch((error) => toast.error(error.message));
  }, [fetchDashboard, search, page]);

  const handleSaveBank = async (event) => {
    event.preventDefault();

    if (!bankName.trim()) {
      toast.error("Bank name is required");
      return;
    }

    try {
      if (isEditMode && selectedBankId) {
        await editBank(selectedBankId, { bankName });
        toast.success("Bank updated successfully");
      } else {
        await addBank({ bankName });
        toast.success("Bank added successfully");
      }

      setBankName("");
      setSelectedBankId(null);
      setIsEditMode(false);
      setIsBankModalOpen(false);
      await fetchDashboard({ search, page: 1 });
      setPage(1);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openAddBankModal = () => {
    setBankName("");
    setSelectedBankId(null);
    setIsEditMode(false);
    setIsBankModalOpen(true);
  };

  const openEditBankModal = (bank) => {
    setBankName(bank.bankName);
    setSelectedBankId(bank._id);
    setIsEditMode(true);
    setIsBankModalOpen(true);
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm("Delete this bank and all related records?")) {
      return;
    }

    try {
      await deleteBank(bankId);
      toast.success("Bank deleted successfully");
      await fetchDashboard({ search, page });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const summaryCards = [
    {
      title: "Total Banks",
      value: dashboard.summary.totalBanks,
      icon: FiBriefcase,
    },
    {
      title: "Total Account Holders",
      value: dashboard.summary.totalAccountHolders,
      icon: FiUsers,
    },
    {
      title: "Total Deposited Amount",
      value: formatINR(dashboard.summary.totalDepositedAmount),
      icon: BiRupee,
    },
  ];

  return (
    <section className="space-y-6">
      <header className="glass-card rounded-2xl border border-white/50 bg-white/30 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bank Deposit Management Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportDashboardPdf({ summary: dashboard.summary, banks: dashboard.banks })}
              className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              <FiDownload /> Export PDF
            </button>
            <button
              type="button"
              onClick={openAddBankModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FiPlus /> Add Bank
            </button>
          </div>
        </div>
        <div className="mt-4">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search banks by name" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((item) => (
          <SummaryCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </div>

      {loading.dashboard ? (
        <LoadingState label="Loading dashboard" />
      ) : dashboard.banks.length === 0 ? (
        <EmptyState
          title="No banks found"
          description="Add your first bank to begin tracking account holders and deposits."
        />
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dashboard.banks.map((bank) => (
              <GlassCard key={bank._id} className="cursor-pointer" onClick={() => navigate(`/banks/${bank._id}`)}>
                <div onClick={() => navigate(`/banks/${bank._id}`)} role="button" tabIndex={0}>
                  <h3 className="text-xl font-bold text-slate-900">{bank.bankName}</h3>
                  <p className="mt-2 text-sm text-slate-700">{bank.accountHolderCount} Account Holders</p>
                  <p className="mt-1 text-base font-semibold text-indigo-700">{formatINR(bank.totalDepositedAmount)}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditBankModal(bank);
                    }}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-200"
                  >
                    <span className="inline-flex items-center gap-1"><FiEdit2 /> Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteBank(bank._id);
                    }}
                    className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          <Pagination pagination={dashboard.pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={isBankModalOpen}
        title={isEditMode ? "Edit Bank" : "Add Bank"}
        onClose={() => setIsBankModalOpen(false)}
      >
        <form className="space-y-3" onSubmit={handleSaveBank}>
          <label className="block text-sm font-medium text-slate-700">
            Bank Name
            <input
              type="text"
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
              placeholder="Enter bank name"
            />
          </label>
          <button
            type="submit"
            disabled={loading.mutation}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-70"
          >
            {loading.mutation ? "Saving..." : isEditMode ? "Update Bank" : "Save Bank"}
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default DashboardPage;
