import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiEdit2, FiPlus, FiUsers } from "react-icons/fi";
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
import { exportBankPdf } from "../utils/pdfExport";

const BankDetailsPage = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const { bankDetails, loading, fetchBankDetails, addHolder, editHolder, deleteHolder } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHolderId, setSelectedHolderId] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchBankDetails(bankId, { search, page }).catch((error) => toast.error(error.message));
  }, [bankId, fetchBankDetails, page, search]);

  const handleSaveHolder = async (event) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!/^\d{10}$/.test(formState.phoneNumber.trim())) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    try {
      if (isEditMode && selectedHolderId) {
        await editHolder(bankId, selectedHolderId, formState);
        toast.success("Account holder updated");
      } else {
        await addHolder(bankId, formState);
        toast.success("Account holder added");
      }

      setFormState({ name: "", phoneNumber: "" });
      setSelectedHolderId(null);
      setIsEditMode(false);
      setIsModalOpen(false);
      await fetchBankDetails(bankId, { search, page: 1 });
      setPage(1);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteHolder = async (holderId) => {
    if (!window.confirm("Delete this account holder and all deposit records?")) {
      return;
    }

    try {
      await deleteHolder(holderId);
      toast.success("Account holder deleted");
      await fetchBankDetails(bankId, { search, page });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openAddHolderModal = () => {
    setFormState({ name: "", phoneNumber: "" });
    setSelectedHolderId(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditHolderModal = (holder) => {
    setFormState({
      name: holder.name,
      phoneNumber: holder.phoneNumber,
    });
    setSelectedHolderId(holder._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const bank = bankDetails.bank;

  return (
    <section className="space-y-6">
      <header className="glass-card rounded-2xl border border-white/50 bg-white/30 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-700 hover:bg-white"
          >
            <FiArrowLeft /> Dashboard
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bank && exportBankPdf({ bank, holders: bankDetails.holders })}
              disabled={!bank}
              className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              <FiDownload /> Export PDF
            </button>
            <button
              type="button"
              onClick={openAddHolderModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <FiPlus /> Add Account Holder
            </button>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Bank: {bank?.bankName || "Loading..."}
        </h1>
        <div className="mt-4">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by holder name or phone number"
          />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="Bank Name" value={bank?.bankName || "-"} icon={FiUsers} />
        <SummaryCard title="Total Account Holders" value={bank?.totalAccountHolders || 0} icon={FiUsers} />
        <SummaryCard
          title="Total Deposited Amount"
          value={formatINR(bank?.totalDepositedAmount || 0)}
          icon={BiRupee}
        />
      </div>

      {loading.bankDetails ? (
        <LoadingState label="Loading bank details" />
      ) : bankDetails.holders.length === 0 ? (
        <EmptyState title="No account holders found" description="Add an account holder to start recording deposits." />
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {bankDetails.holders.map((holder) => (
              <GlassCard key={holder._id}>
                <div
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/holders/${holder._id}`)}
                >
                  <h3 className="text-xl font-bold text-slate-900">{holder.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{holder.phoneNumber}</p>
                  <p className="mt-2 text-base font-semibold text-indigo-700">
                    {formatINR(holder.totalDepositedAmount)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditHolderModal(holder)}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-200"
                  >
                    <span className="inline-flex items-center gap-1"><FiEdit2 /> Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHolder(holder._id)}
                    className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          <Pagination pagination={bankDetails.pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={isEditMode ? "Edit Account Holder" : "Add Account Holder"}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-3" onSubmit={handleSaveHolder}>
          <label className="block text-sm font-medium text-slate-700">
            Account Holder Name
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone Number
            <input
              type="text"
              value={formState.phoneNumber}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  phoneNumber: event.target.value.replace(/[^\d]/g, "").slice(0, 10),
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading.mutation}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-70"
          >
            {loading.mutation ? "Saving..." : isEditMode ? "Update Account Holder" : "Save Account Holder"}
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default BankDetailsPage;
