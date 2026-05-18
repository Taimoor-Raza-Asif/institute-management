import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const currentYear = new Date().getFullYear();
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthOpts = [{ value: 'all', label: 'All Months' }, ...monthNames.map((m,i) => ({ value: i+1, label: m }))];
const getYears = () => { const y=[]; for(let i=currentYear+1;i>=2020;i--) y.push(i); return y; };

const OverallExpenses = () => {
  const { currentTheme } = useTheme();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState('all');
  const [sections, setSections] = useState({ fees: true, donations: true, salaries: true, bills: true });
  const [data, setData] = useState({ fees: [], salaries: [], bills: [], donations: [] });
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year };
      if (month !== 'all') params.month = month;
      const [feesRes, salRes, billRes, donRes] = await Promise.all([
        api.get('/fees', { params: { year, ...(month !== 'all' ? { month } : {}) } }),
        api.get('/salary/all', { params: { year, ...(month !== 'all' ? { month } : {}) } }),
        api.get('/billing', { params: { year, ...(month !== 'all' ? { month: month, year: year } : { year }) } }),
        api.get('/donations', { params: { year, ...(month !== 'all' ? { month } : {}) } }),
      ]);
      setData({
        fees: Array.isArray(feesRes.data) ? feesRes.data : (feesRes.data?.fees || []),
        salaries: Array.isArray(salRes.data) ? salRes.data : [],
        bills: Array.isArray(billRes.data) ? billRes.data : [],
        donations: Array.isArray(donRes.data) ? donRes.data : [],
      });
    } catch (e) { console.error('Failed to fetch overall data', e); }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalFees = data.fees.reduce((s,f) => s + (parseFloat(f.amountPaid||f.amount||0)), 0);
  const totalDonations = data.donations.reduce((s,d) => s + (parseFloat(d.amount||0)), 0);
  const totalSalaries = data.salaries.reduce((s,r) => s + (parseFloat(r.paidAmount||0)), 0);
  const totalBills = data.bills.reduce((s,b) => s + (parseFloat(b.amount||0)), 0);

  const income = (sections.fees ? totalFees : 0) + (sections.donations ? totalDonations : 0);
  const expense = (sections.salaries ? totalSalaries : 0) + (sections.bills ? totalBills : 0);
  const net = income - expense;

  const toggle = (key) => setSections(p => ({ ...p, [key]: !p[key] }));

  const inputCls = `w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg||'bg-white/80'} backdrop-blur-sm ${currentTheme?.inputBorder||'border border-emerald-200'} ${currentTheme?.inputText||'text-gray-800'} shadow-sm focus:outline-none ${currentTheme?.inputRing||'focus:ring-2 focus:ring-emerald-300'} text-sm`;

  const handleDownload = async () => {
    const doc = new jsPDF({ format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 15;
    const hh = 50;
    let y = 0;

    // --- HEADER ---
    doc.setFillColor(15,118,110); doc.rect(0,0,pw,hh,'F');
    doc.setFillColor(20,184,166); doc.triangle(pw*0.45,0,pw,0,pw,hh,'F');
    doc.setFillColor(255,255,255);
    doc.setGState(new doc.GState({opacity:0.06}));
    doc.circle(pw*0.75,-8,42,'F'); doc.circle(pw*0.92,hh+4,30,'F'); doc.circle(m+5,hh+2,28,'F');
    doc.setGState(new doc.GState({opacity:1}));
    doc.setFillColor(8,145,178); doc.rect(0,hh-3.5,pw,3.5,'F');
    doc.setFillColor(255,255,255); doc.circle(m+14,25,15,'F');
    doc.setDrawColor(8,145,178); doc.setLineWidth(1.2); doc.circle(m+14,25,15.8,'S');
    const logo = new Image(); logo.src = '/Jamia Logo.png';
    await new Promise(r => { logo.onload=()=>{doc.addImage(logo,'JPEG',m+4,15,20,20);r();}; logo.onerror=()=>r(); });
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont(undefined,'bold');
    doc.text('Jamia Tul Mastwaar',m+34,20);
    doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(204,251,241);
    doc.text('Makhdoom Pur Sharif Murid, Chakwal',m+34,27);
    doc.text('(0334) 8724125  |  jamiatulmastwaar@gmail.com',m+34,33);
    const bw=68,bh=11,bx=pw-m-bw,by=32;
    doc.setFillColor(255,255,255); doc.roundedRect(bx,by,bw,bh,2.5,2.5,'F');
    doc.setDrawColor(15,118,110); doc.setLineWidth(0.8); doc.roundedRect(bx,by,bw,bh,2.5,2.5,'S');
    doc.setFontSize(8.5); doc.setFont(undefined,'bold'); doc.setTextColor(15,118,110);
    doc.text('OVERALL EXPENSES',bx+bw/2,by+7.2,{align:'center'});

    y = hh + 10;
    const mLabel = month !== 'all' ? monthNames[month-1] : 'All Months';
    doc.setFillColor(236,253,245); doc.roundedRect(m,y,pw-2*m,12,1.5,1.5,'F');
    doc.setFontSize(9); doc.setTextColor(4,120,87);
    const checked = Object.entries(sections).filter(([,v])=>v).map(([k])=>k.charAt(0).toUpperCase()+k.slice(1)).join(', ');
    doc.text(`Filters — Year: ${year} | Month: ${mLabel} | Sections: ${checked}`,m+3,y+8);
    doc.setTextColor(0,0,0); y+=18;

    const tw = pw - 2*m;
    const rh = 8, cpx = 2, cpy = 5.5;

    const secHeader = (title) => {
      if(y > ph - 50){ doc.addPage(); y = m+5; }
      doc.setFillColor(240,248,242); doc.roundedRect(m,y,tw,8,1,1,'F');
      doc.setFontSize(11); doc.setFont(undefined,'bold'); doc.setTextColor(40,167,69);
      doc.text(title,m+3,y+5.5); doc.setTextColor(0,0,0); y+=13;
    };

    const tblHeader = (cols, widths) => {
      doc.setFillColor(26,188,156); doc.rect(m,y,tw,rh,'F');
      doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
      let x=m; cols.forEach((h,i)=>{doc.text(h,x+cpx,y+cpy);x+=widths[i];}); doc.setTextColor(0,0,0); y+=rh;
    };

    const tblRow = (cells, widths, even) => {
      if(y > ph - 50){ doc.addPage(); y = m+5; }
      if(even){doc.setFillColor(236,253,245);doc.rect(m,y,tw,rh,'F');}
      doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(40,40,40);
      let x=m; cells.forEach((c,i)=>{const t=doc.splitTextToSize(String(c||'N/A'),widths[i]-4)[0]||'';doc.text(t,x+cpx,y+cpy);x+=widths[i];});
      doc.setDrawColor(220,220,220); doc.setLineWidth(0.2); doc.line(m,y+rh,m+tw,y+rh); y+=rh;
    };

    const totalCard = (label, amount, tagline) => {
      if(y > ph - 45){ doc.addPage(); y = m+5; }
      y+=4; const ch=22;
      doc.setFillColor(15,118,110); doc.roundedRect(m,y,tw,ch,3,3,'F');
      doc.setFillColor(20,184,166); doc.setGState(new doc.GState({opacity:0.35}));
      doc.roundedRect(m+tw*0.55,y,tw*0.45,ch,3,3,'F'); doc.setGState(new doc.GState({opacity:1}));
      doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(204,251,241);
      doc.text(label,m+5,y+8);
      doc.setFontSize(13); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
      doc.text(`PKR ${Number(amount).toLocaleString()}`,m+5,y+17);
      doc.setFontSize(7); doc.setFont(undefined,'normal'); doc.setTextColor(153,246,228);
      doc.text(tagline,pw-m-5,y+13,{align:'right'}); y+=ch+6;
    };

    // ── FEES SECTION ──
    if (sections.fees) {
      const fees = data.fees;
      const fW = [8, 45, 28, 25, 25, tw-8-45-28-25-25];
      secHeader('FEES COLLECTED');
      if (fees.length) {
        tblHeader(['#','Student','Amount (PKR)','Month/Year','Method','Status'], fW);
        fees.forEach((f,i) => tblRow([i+1, f.studentName||'N/A', Number(f.amountPaid||f.amount||0).toLocaleString(), f.month&&f.year?`${monthNames[(f.month||1)-1]} ${f.year}`:'N/A', f.paymentMethod||'N/A', f.status||'N/A'], fW, i%2===1));
        y+=4;
      } else { doc.setFontSize(9); doc.text('No fee records found.',m,y+4); y+=12; }
      totalCard('TOTAL FEES COLLECTED', totalFees, 'Fees Summary');
    }

    // ── DONATIONS SECTION ──
    if (sections.donations) {
      const dons = data.donations;
      const dW = [8, 40, 28, 28, tw-8-40-28-28];
      secHeader('DONATIONS RECEIVED');
      if (dons.length) {
        tblHeader(['#','Donor','Amount (PKR)','Date','Purpose'], dW);
        dons.forEach((d,i) => tblRow([i+1, d.donorName||'N/A', Number(d.amount||0).toLocaleString(), d.donationDate?new Date(d.donationDate).toLocaleDateString():'N/A', d.purpose||'N/A'], dW, i%2===1));
        y+=4;
      } else { doc.setFontSize(9); doc.text('No donation records found.',m,y+4); y+=12; }
      totalCard('TOTAL DONATIONS', totalDonations, 'Donations Summary');
    }

    // ── SALARIES SECTION ──
    if (sections.salaries) {
      const sals = data.salaries;
      const sW = [8, 42, 22, 24, 28, 28, tw-8-42-22-24-28-28];
      secHeader('SALARIES PAID');
      if (sals.length) {
        tblHeader(['#','Staff Name','Role','Month/Year','Salary/Mo','Paid (PKR)','Status'], sW);
        sals.forEach((s,i) => tblRow([i+1, s.staffName, s.staffRole, `${monthNames[(s.month||1)-1]} ${s.year}`, Number(s.salaryPerMonth||0).toLocaleString(), Number(s.paidAmount||0).toLocaleString(), s.status||'N/A'], sW, i%2===1));
        y+=4;
      } else { doc.setFontSize(9); doc.text('No salary records found.',m,y+4); y+=12; }
      totalCard('TOTAL SALARIES PAID', totalSalaries, 'Salaries Summary');
    }

    // ── BILLS SECTION ──
    if (sections.bills) {
      const bills = data.bills;
      const bW2 = [8, 50, 28, 28, tw-8-50-28-28];
      secHeader('BILLS & EXPENSES');
      if (bills.length) {
        tblHeader(['#','Title','Amount (PKR)','Date','Paid To'], bW2);
        bills.forEach((b,i) => tblRow([i+1, b.title, Number(b.amount||0).toLocaleString(), b.billDate?new Date(b.billDate).toLocaleDateString():'N/A', b.paidTo||'N/A'], bW2, i%2===1));
        y+=4;
      } else { doc.setFontSize(9); doc.text('No bill records found.',m,y+4); y+=12; }
      totalCard('TOTAL BILLS & EXPENSES', totalBills, 'Bills Summary');
    }

    // ── FINAL SUMMARY ──
    if(y > ph - 80){ doc.addPage(); y = m+5; }
    secHeader('FINANCIAL SUMMARY');

    // Income card (green)
    y+=2;
    doc.setFillColor(4,120,87); doc.roundedRect(m,y,tw,18,3,3,'F');
    doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(187,247,208);
    doc.text('TOTAL INCOME (Fees + Donations)',m+5,y+7);
    doc.setFontSize(12); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
    doc.text(`PKR ${Number(income).toLocaleString()}`,m+5,y+15); y+=22;

    // Expense card (red-ish)
    doc.setFillColor(185,28,28); doc.roundedRect(m,y,tw,18,3,3,'F');
    doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(254,202,202);
    doc.text('TOTAL EXPENSE (Salaries + Bills)',m+5,y+7);
    doc.setFontSize(12); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
    doc.text(`PKR ${Number(expense).toLocaleString()}`,m+5,y+15); y+=22;

    // Net profit/loss card
    const isProfit = net >= 0;
    doc.setFillColor(isProfit?15:127, isProfit?118:29, isProfit?110:29);
    doc.roundedRect(m,y,tw,22,3,3,'F');
    doc.setFillColor(isProfit?20:220, isProfit?184:38, isProfit?166:38);
    doc.setGState(new doc.GState({opacity:0.3}));
    doc.roundedRect(m+tw*0.55,y,tw*0.45,22,3,3,'F');
    doc.setGState(new doc.GState({opacity:1}));
    doc.setFontSize(8); doc.setFont(undefined,'normal');
    doc.setTextColor(isProfit?204:254, isProfit?251:202, isProfit?241:202);
    doc.text(isProfit?'NET PROFIT':'NET LOSS',m+5,y+8);
    doc.setFontSize(14); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
    doc.text(`PKR ${Number(Math.abs(net)).toLocaleString()}`,m+5,y+18);
    doc.setFontSize(8); doc.setFont(undefined,'normal');
    doc.setTextColor(isProfit?153:254, isProfit?246:202, isProfit?228:202);
    doc.text(isProfit?'Institute is in PROFIT':'Institute is in LOSS',pw-m-5,y+14,{align:'right'});
    y+=26;

    // Footer on every page
    const pages = doc.getNumberOfPages();
    for(let p=1;p<=pages;p++){
      doc.setPage(p);
      const fy=ph-10;
      doc.setDrawColor(200,200,200); doc.setLineWidth(0.3); doc.line(m,fy-3,pw-m,fy-3);
      doc.setFontSize(7); doc.setTextColor(150);
      doc.text('This is a computer-generated report. No signature is required.',pw/2,fy-8,{align:'center'});
      doc.setTextColor(120);
      doc.text('Jamia Tul Mastwaar - Overall Expenses Report',m,fy);
      doc.text(`Page ${p} of ${pages}`,pw-m,fy,{align:'right'});
    }

    doc.save(`Overall_Expenses_${year}_${mLabel.replace(/\s/g,'_')}.pdf`);
  };

  const Card = ({label,value,color}) => (
    <div className={`${currentTheme?.cardBg||'bg-white'} ${currentTheme?.cardBorder||currentTheme?.border||'border border-emerald-100'} p-5 rounded-xl ${currentTheme?.shadow||'shadow-md'}`}>
      <p className={`text-sm font-semibold ${currentTheme?.mutedText||'text-gray-500'} mb-1`}>{label}</p>
      <p className={`text-2xl font-bold ${color}`}>PKR {Number(value).toLocaleString()}</p>
    </div>
  );

  return (
    <>
      {/* Filters + Checkboxes */}
      <div className={`rounded-2xl ${currentTheme?.cardBg||'bg-white/90'} ${currentTheme?.border||'border border-emerald-100'} ${currentTheme?.shadow||'shadow-sm'} p-4 sm:p-5 mb-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-semibold ${currentTheme?.title||'text-gray-700'} mb-1`}>Filter by Year</label>
            <select className={inputCls} value={year} onChange={e=>setYear(parseInt(e.target.value))}>
              {getYears().map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${currentTheme?.title||'text-gray-700'} mb-1`}>Month</label>
            <select className={inputCls} value={month} onChange={e=>setMonth(e.target.value==='all'?'all':parseInt(e.target.value))}>
              {monthOpts.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <span className={`text-sm font-semibold ${currentTheme?.title||'text-gray-700'}`}>Include in Report:</span>
          {['fees','donations','salaries','bills'].map(k => (
            <label key={k} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={sections[k]} onChange={()=>toggle(k)} className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
              <span className={`text-sm font-medium ${currentTheme?.text||'text-gray-700'}`}>{k.charAt(0).toUpperCase()+k.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {sections.fees && <Card label="Total Fees" value={totalFees} color="text-emerald-700" />}
        {sections.donations && <Card label="Total Donations" value={totalDonations} color="text-purple-700" />}
        {sections.salaries && <Card label="Total Salaries" value={totalSalaries} color="text-blue-700" />}
        {sections.bills && <Card label="Total Bills" value={totalBills} color="text-red-700" />}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${currentTheme?.cardBg||'bg-white'} ${currentTheme?.border||'border border-emerald-100'} p-5 rounded-xl ${currentTheme?.shadow||'shadow-md'}`}>
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-emerald-700">PKR {income.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Fees + Donations</p>
        </div>
        <div className={`${currentTheme?.cardBg||'bg-white'} ${currentTheme?.border||'border border-emerald-100'} p-5 rounded-xl ${currentTheme?.shadow||'shadow-md'}`}>
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">PKR {expense.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Salaries + Bills</p>
        </div>
        <div className={`${currentTheme?.cardBg||'bg-white'} ${currentTheme?.border||'border border-emerald-100'} p-5 rounded-xl ${currentTheme?.shadow||'shadow-md'} ${net>=0?'ring-2 ring-emerald-200':'ring-2 ring-red-200'}`}>
          <p className="text-sm font-semibold text-gray-500 mb-1">{net>=0?'Net Profit':'Net Loss'}</p>
          <p className={`text-2xl font-bold ${net>=0?'text-emerald-700':'text-red-600'}`}>PKR {Math.abs(net).toLocaleString()}</p>
          <p className={`text-xs mt-1 font-semibold ${net>=0?'text-emerald-500':'text-red-400'}`}>{net>=0?'✓ Institute is in Profit':'✗ Institute is in Loss'}</p>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDownload}
          disabled={loading}
          className={`flex items-center gap-2 h-12 px-6 rounded-lg font-medium text-sm transition-all ${currentTheme?.btnPrimaryBg||'bg-emerald-600'} ${currentTheme?.btnPrimaryHover||'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText||'text-white'} ${currentTheme?.shadow||'shadow-md'} disabled:opacity-50`}
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          {loading ? 'Loading Data...' : 'Download Overall Report'}
        </button>
      </div>
    </>
  );
};

export default OverallExpenses;
