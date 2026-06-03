import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiEdit2, FiPlus, FiHash } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import toast from "react-hot-toast";
import useDashboardStore from "../store/useDashboardStore";
import SummaryCard from "../components/ui/SummaryCard";
import SearchInput from "../components/ui/SearchInput";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Modal from "../components/ui/Modal";
import GlassCard from "../components/ui/GlassCard";
import DateRangeFilter from "../components/ui/DateRangeFilter";
import { formatINR } from "../utils/currency";
import { formatDisplayDate } from "../utils/date";
import { exportHolderPdf } from "../utils/pdfExport";

const HolderDetailsPage = () => {
  const { holderId } = useParams();
  const navigate = useNavigate();
  const { holderDetails, loading, fetchHolderDetails, addDeposit, editDeposit, deleteDeposit } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const [formState, setFormState] = useState({
    depositDate: "",
    amount: "",
  });

  const loadData = async ({ resetPage = false } = {}) => {
    const targetPage = resetPage ? 1 : page;

    await fetchHolderDetails(holderId, {
      page: targetPage,
      search,
      range,
      startDate: customStart,
      endDate: customEnd,
    });

    if (resetPage) {
      setPage(1);
    }
  };

  useEffect(() => {
    loadData().catch((error) => toast.error(error.message));
  }, [holderId, page, search, range, customStart, customEnd]);

  const handleSaveDeposit = async (event) => {
    event.preventDefault();

    if (!formState.depositDate) {
      toast.error("Date is required");
      return;
    }

    if (Number(formState.amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    try {
      const payload = {
        depositDate: formState.depositDate,
        amount: Number(formState.amount),
      };

      if (isEditMode && selectedDepositId) {
        await editDeposit(selectedDepositId, payload);
        toast.success("Deposit updated successfully");
      } else {
        await addDeposit(holderId, payload);
        toast.success("Deposit added successfully");
      }

      setFormState({ depositDate: "", amount: "" });
      setSelectedDepositId(null);
      setIsEditMode(false);
      setIsModalOpen(false);
      await loadData({ resetPage: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteDeposit = async (depositId) => {
    if (!window.confirm("Delete this deposit record?")) {
      return;
    }

    try {
      await deleteDeposit(depositId);
      toast.success("Deposit deleted");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openAddDepositModal = () => {
    setFormState({ depositDate: "", amount: "" });
    setSelectedDepositId(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditDepositModal = (deposit) => {
    setFormState({
      depositDate: new Date(deposit.depositDate).toISOString().split("T")[0],
      amount: String(deposit.amount),
    });
    setSelectedDepositId(deposit._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const holder = holderDetails.holder;
  const stats = holderDetails.stats;

  return (
    <section className="space-y-6">
      <header className="glass-card rounded-2xl border border-white/50 bg-white/30 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/banks/${holder?.bankId || ""}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-700 hover:bg-white"
          >
            <FiArrowLeft /> Bank Details
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                holder &&
                exportHolderPdf({ holder, stats, deposits: holderDetails.deposits })
              }
              disabled={!holder}
              className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              <FiDownload /> Export PDF
            </button>
            <button
              type="button"
              onClick={openAddDepositModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <FiPlus /> Add Deposit
            </button>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{holder?.name || "Holder Details"}</h1>
        <p className="mt-1 text-sm text-slate-700">Phone: {holder?.phoneNumber || "-"}</p>
        <p className="text-sm text-slate-700">Bank: {holder?.bankName || "-"}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard title="Total Deposits Count" value={stats.totalDepositsCount || 0} icon={FiHash} />
        <SummaryCard
          title="Total Deposited Amount"
          value={formatINR(stats.totalDepositedAmount || 0)}
          icon={BiRupee}
        />
      </div>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search deposits by date or amount"
            />
          </div>
          <DateRangeFilter
            range={range}
            onRangeChange={(value) => {
              setRange(value);
              if (value !== "custom") {
                setCustomStart("");
                setCustomEnd("");
              }
              setPage(1);
            }}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={(type, value) => {
              if (type === "start") {
                setCustomStart(value);
              } else {
                setCustomEnd(value);
              }
              setPage(1);
            }}
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {loading.holderDetails ? (
          <LoadingState label="Loading deposits" />
        ) : holderDetails.deposits.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No deposits found" description="Add deposits to track this holder's contribution." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {holderDetails.deposits.map((deposit) => (
                  <tr key={deposit._id} className="border-t border-white/40">
                    <td className="px-4 py-3 text-slate-700">{formatDisplayDate(deposit.depositDate)}</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">{formatINR(deposit.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDepositModal(deposit)}
                          className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                        >
                          <span className="inline-flex items-center gap-1"><FiEdit2 /> Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeposit(deposit._id)}
                          className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <Pagination pagination={holderDetails.pagination} onPageChange={setPage} />

      <Modal
        isOpen={isModalOpen}
        title={isEditMode ? "Edit Deposit" : "Add Deposit"}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-3" onSubmit={handleSaveDeposit}>
          <label className="block text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              value={formState.depositDate}
              onChange={(event) => setFormState((prev) => ({ ...prev, depositDate: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Deposit Amount
            <input
              type="number"
              min="1"
              step="0.01"
              value={formState.amount}
              onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
              placeholder="Enter amount"
            />
          </label>
          <button
            type="submit"
            disabled={loading.mutation}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-70"
          >
            {loading.mutation ? "Saving..." : isEditMode ? "Update Deposit" : "Save Deposit"}
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default HolderDetailsPage;
