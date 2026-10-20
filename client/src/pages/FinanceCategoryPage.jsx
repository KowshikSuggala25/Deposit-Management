import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiPlus, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import useDashboardStore from "../store/useDashboardStore";
import SearchInput from "../components/ui/SearchInput";
import GlassCard from "../components/ui/GlassCard";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import SummaryCard from "../components/ui/SummaryCard";
import { formatINR } from "../utils/currency";

const FinanceCategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { financeDetails, loading, fetchFinanceDetails, addFinanceHolder, editFinanceHolder, deleteHolder } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phoneNumber: "" });
  const title = category === "gold" ? "Gold Finance" : "Cash Finance";
  const load = () => fetchFinanceDetails(category, { search, page }).catch((error) => toast.error(error.message));
  useEffect(() => { load(); }, [category, search, page]);
  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\d{10}$/.test(form.phoneNumber.trim())) { toast.error("Enter a name and a valid 10 digit phone number"); return; }
    try {
      if (edit) await editFinanceHolder(category, selected, form); else await addFinanceHolder(category, form);
      setModal(false); setForm({ name: "", phoneNumber: "" }); setPage(1); await fetchFinanceDetails(category, { search, page: 1 });
      toast.success(edit ? "Customer updated" : "Customer added");
    } catch (error) { toast.error(error.message); }
  };
  const openEdit = (holder) => { setSelected(holder._id); setForm({ name: holder.name, phoneNumber: holder.phoneNumber }); setEdit(true); setModal(true); };
  const remove = async (id) => {
    if (!window.confirm("Delete this customer and all deposit records?")) return;
    try { await deleteHolder(id); await load(); toast.success("Customer deleted"); } catch (error) { toast.error(error.message); }
  };
  const finance = financeDetails.finance;
  return <section className="space-y-6">
    <header className="glass-card rounded-2xl border border-white/50 bg-white/30 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate("/hand-cash")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-700"><FiArrowLeft /> Hand Cash</button>
        <button type="button" onClick={() => { setEdit(false); setForm({ name: "", phoneNumber: "" }); setModal(true); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white"><FiPlus /> Add Customer</button>
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">Rate: rupees per ₹100, recorded by month or year.</p>
      <div className="mt-4"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search customers by name or phone number" /></div>
    </header>
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard title="Finance Category" value={title} icon={FiUsers} />
      <SummaryCard title="Total Customers" value={finance?.totalAccountHolders || 0} icon={FiUsers} />
      <SummaryCard title="Total Active Amount" value={formatINR(finance?.totalDepositedAmount || 0)} icon={FiUsers} />
    </div>
    {loading.bankDetails ? <LoadingState label="Loading customers" /> : financeDetails.holders.length === 0 ? <EmptyState title="No customers found" description="Add a customer to start recording finance deposits." /> : <div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{financeDetails.holders.map((holder) => <GlassCard key={holder._id}><div role="button" tabIndex={0} className="cursor-pointer" onClick={() => navigate(`/holders/${holder._id}`)}><h3 className="text-xl font-bold text-slate-900">{holder.name}</h3><p className="mt-1 text-sm text-slate-600">{holder.phoneNumber}</p><p className="mt-2 font-semibold text-indigo-700">{formatINR(holder.totalDepositedAmount)}</p></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => openEdit(holder)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700"><FiEdit2 className="inline" /> Edit</button><button type="button" onClick={() => remove(holder._id)} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700">Delete</button></div></GlassCard>)}</div><Pagination pagination={financeDetails.pagination} onPageChange={setPage} /></div>}
    <Modal isOpen={modal} title={edit ? "Edit Customer" : "Add Customer"} onClose={() => setModal(false)}><form className="space-y-3" onSubmit={save}><label className="block text-sm font-medium">Customer Name<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="block text-sm font-medium">Phone Number<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" maxLength={10} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label><button disabled={loading.mutation} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">{loading.mutation ? "Saving..." : "Save Customer"}</button></form></Modal>
  </section>;
};
export default FinanceCategoryPage;
