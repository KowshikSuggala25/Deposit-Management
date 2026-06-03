import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDisplayDate } from "./date";

const formatINRForPdf = (value = 0) => {
  const amount = Number(value) || 0;
  return `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

const addHeader = (doc, title, subtitle) => {
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(subtitle, 14, 25);
};

export const exportDashboardPdf = ({ summary, banks }) => {
  const doc = new jsPDF();

  addHeader(
    doc,
    "Bank Deposit Management Dashboard",
    `Generated on ${formatDisplayDate(new Date())}`
  );

  doc.setFontSize(11);
  doc.text(`Total Banks: ${summary.totalBanks}`, 14, 34);
  doc.text(`Total Account Holders: ${summary.totalAccountHolders}`, 14, 41);
  doc.text(`Total Deposits: ${formatINRForPdf(summary.totalDepositedAmount)}`, 14, 48);

  autoTable(doc, {
    startY: 55,
    head: [["Bank", "Account Holders", "Total Deposits"]],
    body: banks.map((bank) => [
      bank.bankName,
      String(bank.accountHolderCount),
      formatINRForPdf(bank.totalDepositedAmount),
    ]),
    styles: { fontSize: 10 },
  });

  doc.save("dashboard-report.pdf");
};

export const exportBankPdf = ({ bank, holders }) => {
  const doc = new jsPDF();

  addHeader(doc, `${bank.bankName} - Bank Report`, `Generated on ${formatDisplayDate(new Date())}`);

  doc.setFontSize(11);
  doc.text(`Total Account Holders: ${bank.totalAccountHolders}`, 14, 34);
  doc.text(`Total Deposits: ${formatINRForPdf(bank.totalDepositedAmount)}`, 14, 41);

  autoTable(doc, {
    startY: 50,
    head: [["Account Holder", "Phone Number", "Total Deposits"]],
    body: holders.map((holder) => [holder.name, holder.phoneNumber, formatINRForPdf(holder.totalDepositedAmount)]),
    styles: { fontSize: 10 },
  });

  doc.save(`${bank.bankName.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
};

export const exportHolderPdf = ({ holder, stats, deposits }) => {
  const doc = new jsPDF();

  addHeader(doc, `${holder.name} - Holder Report`, `Generated on ${formatDisplayDate(new Date())}`);

  doc.setFontSize(11);
  doc.text(`Phone Number: ${holder.phoneNumber}`, 14, 34);
  doc.text(`Bank: ${holder.bankName}`, 14, 41);
  doc.text(`Total Deposits Count: ${stats.totalDepositsCount}`, 14, 48);
  doc.text(`Total Deposited Amount: ${formatINRForPdf(stats.totalDepositedAmount)}`, 14, 55);

  autoTable(doc, {
    startY: 63,
    head: [["Date", "Amount"]],
    body: deposits.map((deposit) => [formatDisplayDate(deposit.depositDate), formatINRForPdf(deposit.amount)]),
    styles: { fontSize: 10 },
  });

  doc.save(`${holder.name.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
};
