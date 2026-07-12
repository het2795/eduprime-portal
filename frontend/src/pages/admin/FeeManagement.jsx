import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, ShieldCheck, Search, DollarSign } from 'lucide-react';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [btnLoadingId, setBtnLoadingId] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/fees');
      setFees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleManualPay = async (id) => {
    if (!window.confirm('Clear student balance and mark as Paid manually?')) return;
    setBtnLoadingId(id);
    try {
      await api.put(`/admin/fees/${id}/pay-manual`);
      alert('Student outstanding fees cleared successfully!');
      await fetchFees();
    } catch (err) {
      console.error(err);
      alert('Failed to clear transaction manual check.');
    } finally {
      setBtnLoadingId(null);
    }
  };

  const filteredFees = fees.filter((f) => {
    const val = search.toLowerCase();
    return (
      (f.student?.name && f.student.name.toLowerCase().includes(val)) ||
      (f.student?.rollNo && f.student.rollNo.toLowerCase().includes(val))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header Panel */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Fee ledger management</h3>
          <p className="text-[10px] text-slate-400">View college outstanding tuition balances or clear transaction statuses manually</p>
        </div>

        <div className="relative flex-1 sm:flex-none w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by student, roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 outline-none text-slate-805 dark:text-white"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">No ledger records match search parameter details.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-medium">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Student</th>
                  <th className="py-2.5">Roll ID</th>
                  <th className="py-2.5">Outstanding Balance</th>
                  <th className="py-2.5">Dues Deadline</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {filteredFees.map((f) => {
                  const hasDues = f.totalOutstanding > 0;
                  return (
                    <tr key={f._id} className="text-slate-655 dark:text-slate-300">
                      <td className="py-3.5 font-bold text-slate-850 dark:text-white">
                        <p>{f.student?.name || 'Student'}</p>
                        <span className="text-[9px] text-slate-450 font-normal">{f.student?.dept} · Sem {f.student?.semester}</span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-brand-blue">{f.student?.rollNo || 'N/A'}</td>
                      <td className="py-3.5 font-bold text-slate-700 dark:text-slate-200">
                        ${f.totalOutstanding} USD
                      </td>
                      <td className="py-3.5 font-mono text-[10.5px] text-slate-400">{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          hasDues ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' : 'bg-brand-green/10 text-brand-green border-brand-green/20'
                        }`}>{hasDues ? 'Outstanding Dues' : 'Dues Cleared'}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        {hasDues ? (
                          <button
                            onClick={() => handleManualPay(f._id)}
                            disabled={btnLoadingId === f._id}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green/90 text-white font-bold text-[9px] uppercase tracking-wider"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">No Dues</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;
