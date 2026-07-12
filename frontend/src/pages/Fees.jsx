import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, DollarSign, Calendar, Download, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const Fees = () => {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchFees = async () => {
    try {
      const res = await api.get('/fees');
      setStatement(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePayment = async () => {
    if (!statement || statement.totalOutstanding <= 0) return;
    setBtnLoading(true);

    try {
      const res = await api.post('/fees/pay');
      alert(res.data.message);
      await fetchFees();
    } catch (err) {
      console.error(err);
      alert('Mock payment processing failed.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDownloadReceipt = (receipt) => {
    alert(`Downloading receipt ${receipt.receiptUrl} for Semester ${receipt.semester}. Paid Amount: $${receipt.amount}.`);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    totalOutstanding = 0,
    dueDate = new Date(),
    paymentBreakup = [],
    paymentHistory = []
  } = statement || {};

  const isDuesCleared = totalOutstanding === 0;

  return (
    <div className="space-y-6">
      {/* Due Dues Banner Panel */}
      <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Ledger Dues Status</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-brand-green font-heading">
              ${totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">USD Outstanding</span>
          </div>
          {!isDuesCleared ? (
            <span className="text-[10px] font-bold text-brand-amber flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Dues must be cleared before {new Date(dueDate).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-brand-green flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> All academic ledger payments are fully up-to-date.
            </span>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {!isDuesCleared ? (
            <button
              onClick={handlePayment}
              disabled={btnLoading}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/95 disabled:bg-slate-250 text-white text-xs font-bold font-heading tracking-wide shadow-md shadow-brand-green/20 flex items-center justify-center gap-2 hover:translate-y-[-1px] transition-all"
            >
              {btnLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay Now
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-700 text-slate-450 dark:text-slate-500 text-xs font-bold font-heading border border-slate-200 dark:border-navy-600 cursor-not-allowed"
            >
              Dues Cleared
            </button>
          )}
        </div>
      </div>

      {/* Breakup & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakup List */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Semester Payment Breakdown</h3>
            <p className="text-[10px] text-slate-400">Current trimester academic charges breakdown details</p>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-navy-700/50">
            {paymentBreakup.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">{item.item}</span>
                <span className="text-slate-800 dark:text-white font-bold">${item.amount}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-navy-700/50 mt-4 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400">Total Calculation</span>
            <span className="text-slate-800 dark:text-white">${paymentBreakup.reduce((a, b) => a + b.amount, 0)}</span>
          </div>
        </div>

        {/* Payment Ledger History */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Ledger Payment History</h3>
            <p className="text-[10px] text-slate-400">Chronological list of previous semester tuition receipts</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Trimester</th>
                  <th className="py-2.5">Paid Amount</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Receipt Reference</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {paymentHistory.map((receipt, idx) => (
                  <tr key={idx} className="text-slate-600 dark:text-slate-300 font-medium">
                    <td className="py-3.5 font-bold text-slate-800 dark:text-white">{receipt.semester}</td>
                    <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-200">${receipt.amount}</td>
                    <td className="py-3.5 text-slate-400">{new Date(receipt.date).toLocaleDateString()}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-navy-900 text-slate-450 dark:text-slate-400">
                        {receipt.receiptUrl}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(receipt)}
                        className="p-1.5 bg-slate-50 dark:bg-navy-900/50 hover:bg-slate-100 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-450 hover:text-brand-blue shrink-0 inline-flex transition-colors select-none"
                        title="Download PDF Invoice"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fees;
