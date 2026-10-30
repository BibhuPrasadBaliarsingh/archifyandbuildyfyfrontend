import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Globe } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fmtRupee = (val) => {
  const n = Number(val) || 0;
  return `₹ ${n.toLocaleString('en-IN')}`;
};

const numberToWordsRupees = (amount) => {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return 'Rupees Zero Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n) => {
    if (n < 20) return units[n];
    const t = tens[Math.floor(n / 10)];
    const u = units[n % 10];
    return u ? `${t} ${u}` : t;
  };

  const convertThreeDigits = (n) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    if (h && r) return `${units[h]} Hundred ${convertTwoDigits(r)}`;
    if (h) return `${units[h]} Hundred`;
    return convertTwoDigits(r);
  };

  let words = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore) words += `${convertTwoDigits(crore)} Crore `;
  if (lakh) words += `${convertTwoDigits(lakh)} Lakh `;
  if (thousand) words += `${convertTwoDigits(thousand)} Thousand `;
  if (hundred) words += convertThreeDigits(hundred);

  return `Rupees ${words.trim()} Only`;
};

const formatDateDot = (d) => {
  if (!d || d === '—') return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return format(dt, 'dd . MM . yyyy');
  } catch {
    return d;
  }
};

const formatDateReceiptDot = (d) => {
  if (!d || d === '—') return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return format(dt, 'dd.MM.yyyy');
  } catch {
    return d;
  }
};

const formatDateDash = (d) => {
  if (!d || d === '—') return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return format(dt, 'dd-MM-yyyy');
  } catch {
    return d;
  }
};

const getFirstDefined = (source, ...keys) =>
  keys.map(key => source[key]).find(value => value !== undefined && value !== null && value !== '') || '—';

const SERVICE_SCOPES = {
  'Interior Design': [
    '1 . SITE MEASUREMENTS',
    '2 . 3D MODEL WITH RENDER IMAGES',
    '3 . PRELIMINARY ESTIMATE',
    '4 . DETAILING OF WALL PANELING',
    '5 . DETAILING OF FURNITURE',
    '6 . DETAILING OF CEILING',
    '7 . MATERIAL SPECIFICATIONS\n    ( COLOUR CODE , LAMINATE DESIGN , FLOOR TILES , ETC. )',
    '8 . ELECTRICAL DETAILING',
    '9 . PLUMBING DETAILING',
    '10 . FINAL ESTIMATE',
  ],
  '2D (Two Dimensional) plan': [
    '1 . SITE MEASUREMENTS & PLOT ORIENTATION',
    '2 . ARCHITECTURAL 2D FLOOR PLANS AS PER VAASTU',
    '3 . DETAILED FURNITURE LAYOUT PLAN',
    '4 . COLUMN & BEAM POSITIONING DRAWING',
    '5 . DOOR & WINDOW OPENING SCHEDULE',
    '6 . 2D ELEVATION WORKING DRAWINGS',
    '7 . SECTIONAL ARCHITECTURAL DETAILS',
    '8 . ELECTRICAL SWITCHBOARD & CONDUIT LAYOUT',
    '9 . PLUMBING & SANITARY DRAINAGE LAYOUT',
    '10 . FINAL REVISED 2D WORKING DRAWINGS',
  ],
  'House Plan as per Vaastu': [
    '1 . SITE ORIENTATION & VAASTU PURUSHA MANDALA',
    '2 . VAASTU COMPLIANT FLOOR PLANS (ALL FLOORS)',
    '3 . ZONING (KITCHEN, MASTER BEDROOM, POOJA, TANKS)',
    '4 . DOOR & WINDOW PLACEMENT AS PER VAASTU',
    '5 . COLUMN & BEAM POSITIONING DRAWINGS',
    '6 . STRUCTURAL WORKING DETAILS',
    '7 . 2D ELEVATION DRAWING',
    '8 . ELECTRICAL & PLUMBING SCHEMATICS',
    '9 . REVISED DRAWINGS UPON CONSULTATION',
    '10 . FINAL SANCTIONED WORKING DRAWING SET',
  ],
  '3D (Three Dimensional) Elevation': [
    '1 . SITE REFERENCE & STRUCTURAL COORDINATION',
    '2 . CONCEPTUAL 3D FACADE DESIGN',
    '3 . 3D MODELING & ARCHITECTURAL MASSING',
    '4 . EXTERIOR TEXTURE, STONE & CLADDING DETAILS',
    '5 . DAY & NIGHT LIGHTING SIMULATION',
    '6 . HIGH-RESOLUTION PHOTOREALISTIC RENDERS',
    '7 . COLOR SCHEME & PAINT CODE SPECIFICATIONS',
    '8 . BOUNDARY WALL, MAIN GATE & BALCONY DETAILS',
    '9 . ELEVATION WORKING DRAWINGS WITH DIMENSIONS',
    '10 . FINAL 3D PRESENTATION SET',
  ],
  'Landscaping': [
    '1 . SITE TOPOGRAPHY & SOIL STUDY',
    '2 . MASTER LANDSCAPE LAYOUT PLAN',
    '3 . HARDSCAPE DESIGN (PATHWAYS, DRIVEWAYS, PATIO)',
    '4 . SOFTSCAPE DESIGN & HORTICULTURE SELECTION',
    '5 . OUTDOOR & GARDEN LIGHTING LAYOUT',
    '6 . IRRIGATION & DRAINAGE SCHEMATICS',
    '7 . WATER FEATURE & GAZEBO ARCHITECTURAL DETAILS',
    '8 . OUTDOOR MATERIAL & FINISH SPECIFICATIONS',
    '9 . SITE MAINTENANCE MANUAL',
    '10 . FINAL PROJECT ESTIMATE',
  ],
  'Building Plan Approval': [
    '1 . SITE & REVENUE PLOT VERIFICATION',
    '2 . LOCAL BYE-LAWS & FAR CALCULATIONS',
    '3 . MUNICIPAL / BDA / RDA APPROVAL DRAWINGS',
    '4 . STRUCTURAL STABILITY CERTIFICATE COORDINATION',
    '5 . FIRE & ENVIRONMENTAL CLEARANCE LIAISON',
    '6 . RAINWATER HARVESTING & DRAINAGE SUBMISSION PLAN',
    '7 . STATUTORY DOCUMENTATION DOSSIER',
    '8 . ONLINE PORTAL SUBMISSION & TRACKING',
    '9 . OBJECTION RESOLUTION & LIAISON',
    '10 . SANCTIONED PERMIT / PASS PLAN HANDOVER',
  ],
};

const getScopeItems = (description, planType) => {
  const key = description || planType || '';
  for (const [scopeKey, items] of Object.entries(SERVICE_SCOPES)) {
    if (key.toLowerCase().includes(scopeKey.toLowerCase()) || scopeKey.toLowerCase().includes(key.toLowerCase())) {
      return items;
    }
  }
  return SERVICE_SCOPES['Interior Design'];
};

const STANDARD_SERVICES = [
  '2D ( Floor Plan Residential )',
  '2D ( Floor Plan Commercial )',
  '3D Elevation',
  'Interior Design',
  'Building Plan Approval & Documentation',
  'Additional Floor Approval',
  'Layout Charges',
  'Site Visit Charges',
];

const resolveInvoiceTableRows = (invoice) => {
  const g = invoice.ground ? Number(invoice.ground) : '';
  const f = invoice.first ? Number(invoice.first) : '';
  const s = invoice.second ? Number(invoice.second) : '';
  const t = invoice.third ? Number(invoice.third) : '';

  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const validLineItems = lineItems.filter(item =>
    (item.description && item.description.trim()) ||
    Number(item.amount) > 0 ||
    Number(item.rate) > 0 ||
    Number(item.quantity) > 0
  );

  const rows = STANDARD_SERVICES.map(serviceName => ({
    name: serviceName,
    ground: '',
    first: '',
    second: '',
    third: '',
    totalArea: '',
    unitPrice: '',
    amount: 0,
  }));

  if (validLineItems.length > 0) {
    validLineItems.forEach(item => {
      const desc = (item.description || '').toLowerCase();
      let matchedIndex = -1;
      if (desc.includes('residential') || (desc.includes('2d') && !desc.includes('commercial'))) {
        matchedIndex = 0;
      } else if (desc.includes('commercial')) {
        matchedIndex = 1;
      } else if (desc.includes('3d') || desc.includes('elevation')) {
        matchedIndex = 2;
      } else if (desc.includes('interior')) {
        matchedIndex = 3;
      } else if (desc.includes('approval') || desc.includes('documentation')) {
        matchedIndex = 4;
      } else if (desc.includes('additional')) {
        matchedIndex = 5;
      } else if (desc.includes('layout')) {
        matchedIndex = 6;
      } else if (desc.includes('site') || desc.includes('visit')) {
        matchedIndex = 7;
      }

      const itemQty = Number(item.quantity) || '';
      const itemRate = Number(item.rate) || '';
      const itemAmt = Number(item.amount) || (Number(item.quantity || 0) * Number(item.rate || 0)) || 0;

      if (matchedIndex !== -1) {
        rows[matchedIndex].totalArea = itemQty || rows[matchedIndex].totalArea;
        rows[matchedIndex].unitPrice = itemRate || rows[matchedIndex].unitPrice;
        rows[matchedIndex].amount = itemAmt;
        if (g || f || s || t) {
          rows[matchedIndex].ground = item.ground || g || '';
          rows[matchedIndex].first = item.first || f || '';
          rows[matchedIndex].second = item.second || s || '';
          rows[matchedIndex].third = item.third || t || '';
        }
      } else {
        rows.push({
          name: item.description || 'Custom Service',
          ground: item.ground || g || '',
          first: item.first || f || '',
          second: item.second || s || '',
          third: item.third || t || '',
          totalArea: itemQty,
          unitPrice: itemRate,
          amount: itemAmt,
        });
      }
    });
  } else {
    const desc = (invoice.description || invoice.projectType || '').toLowerCase();
    let targetIndex = -1;
    if (desc.includes('residential') || (desc.includes('2d') && !desc.includes('commercial'))) targetIndex = 0;
    else if (desc.includes('commercial')) targetIndex = 1;
    else if (desc.includes('3d') || desc.includes('elevation')) targetIndex = 2;
    else if (desc.includes('interior')) targetIndex = 3;
    else if (desc.includes('approval') || desc.includes('documentation')) targetIndex = 4;
    else if (desc.includes('additional')) targetIndex = 5;
    else if (desc.includes('layout')) targetIndex = 6;
    else if (desc.includes('site') || desc.includes('visit')) targetIndex = 7;

    const amt = Number(invoice.total || invoice.grand_total || invoice.subTotal || 0);
    const qty = Number(invoice.total_area || invoice.totalArea || invoice.area || 0);
    const rate = Number(invoice.unitPrice || invoice.unit_price || 0);

    if (targetIndex !== -1) {
      rows[targetIndex].totalArea = qty || '';
      rows[targetIndex].unitPrice = rate || '';
      rows[targetIndex].amount = amt;
      rows[targetIndex].ground = g || '';
      rows[targetIndex].first = f || '';
      rows[targetIndex].second = s || '';
      rows[targetIndex].third = t || '';
    } else {
      const customName = invoice.description || invoice.projectType || 'Custom Service';
      rows.push({
        name: customName,
        ground: g || '',
        first: f || '',
        second: s || '',
        third: t || '',
        totalArea: qty || '',
        unitPrice: rate || '',
        amount: amt,
      });
    }
  }

  // Ensure any row with amount or totalArea has the floor values populated if entered
  if (g || f || s || t) {
    let assigned = false;
    rows.forEach(r => {
      if (Number(r.amount) > 0 || r.totalArea) {
        if (!r.ground && g) r.ground = g;
        if (!r.first && f) r.first = f;
        if (!r.second && s) r.second = s;
        if (!r.third && t) r.third = t;
        assigned = true;
      }
    });
    if (!assigned && rows.length > 0) {
      rows[0].ground = g || '';
      rows[0].first = f || '';
      rows[0].second = s || '';
      rows[0].third = t || '';
    }
  }

  return rows;
};

const getPaymentList = (inv, invDate) => {
  if (Array.isArray(inv.payments) && inv.payments.length > 0) {
    return inv.payments.map(p => ({
      date: formatDateDash(p.date || invDate),
      amount: Number(p.amount) || 0,
    }));
  }
  if (Array.isArray(inv.paymentHistory) && inv.paymentHistory.length > 0) {
    return inv.paymentHistory.map(p => ({
      date: formatDateDash(p.date || invDate),
      amount: Number(p.amount) || 0,
    }));
  }
  if (inv.notes && inv.notes.includes(':')) {
    const lines = inv.notes.split('\n').filter(l => /\d{2}[-/.]\d{2}[-/.]\d{4}/.test(l));
    if (lines.length > 0) {
      return lines.map(line => {
        const parts = line.split(':');
        const d = parts[0]?.trim();
        const a = Number(parts[1]?.replace(/[^\d.]/g, '')) || 0;
        return { date: d, amount: a };
      });
    }
  }
  const paid = Number(inv.amountPaid) || 0;
  if (paid > 0) {
    return [{
      date: formatDateDash(invDate),
      amount: paid,
    }];
  }
  return [{
    date: formatDateDash(invDate),
    amount: 0,
  }];
};

export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(r => setInvoice(r.data))
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (invoice) {
      const timer = setTimeout(() => window.print(), 350);
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!invoice) return null;

  const isQuotation = invoice.type === 'Quotation';
  const isReceipt = invoice.type === 'Receipt';

  // Common extraction
  const invoiceNumber = getFirstDefined(invoice, 'invoiceNumber', 'invoice_number', 'receipt_number', 'id');
  const invoiceDate = getFirstDefined(invoice, 'date', 'invoice_date', 'quotationDate', 'quotation_date', 'receipt_date', 'payment_date');
  const validDate = getFirstDefined(invoice, 'validDate', 'valid_date', 'dueDate', 'due_date');
  const dotDate = formatDateDot(invoiceDate);
  const receiptDateDot = formatDateReceiptDot(invoiceDate);
  const dotValidDate = formatDateDot(validDate);

  const clientName = getFirstDefined(invoice, 'clientName', 'client_name', 'requestedBy', 'requested_by');
  const clientAddress = getFirstDefined(invoice, 'clientAddress', 'client_address', 'presentAddress', 'present_address', 'address');
  const clientContact = getFirstDefined(invoice, 'clientContact', 'client_contact', 'contactNumber', 'contact_number');
  const projectLocation = getFirstDefined(invoice, 'projectLocation', 'project_location', 'presentAddress', 'clientAddress');
  const projectType = getFirstDefined(invoice, 'projectType', 'project_type');
  const paymentMode = getFirstDefined(invoice, 'paymentMode', 'payment_mode');
  const preparedBy = getFirstDefined(invoice, 'preparedBy', 'prepared_by');
  const preparedByText = preparedBy !== '—'
    ? (preparedBy.toLowerCase().startsWith('by') ? preparedBy : `By: ${preparedBy}`)
    : 'By: Miss. Eva';

  const grandTotal = Number(invoice.grand_total || invoice.total || 0);
  const totalArea = Number(invoice.total_area || invoice.totalArea || invoice.area || 0);
  const unitPrice = Number(invoice.unitPrice || invoice.unit_price || 0);

  const wordsText = numberToWordsRupees(grandTotal);

  // For Quotation view
  const serviceTitle = (invoice.description || invoice.planType || 'INTERIOR DESIGN').toUpperCase();
  const scopeItems = getScopeItems(invoice.description, invoice.planType);
  const hasFloorBreakdown = [invoice.ground, invoice.first, invoice.second, invoice.third, invoice.fourth, invoice.fifth]
    .some(v => Number(v) > 0);

  // For Invoice view
  const invoiceRows = resolveInvoiceTableRows(invoice);
  const computedTotalAmount = invoiceRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || grandTotal;
  const paymentList = getPaymentList(invoice, invoiceDate);
  const totalPaid = Number(invoice.amountPaid) || paymentList.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;
  const approvalFee = Number(invoice.tax || invoice.gst || 0);
  const totalDueAmount = invoice.balance != null ? Number(invoice.balance) : Math.max(0, computedTotalAmount + approvalFee - totalPaid);
  const totalDueWordsText = numberToWordsRupees(totalDueAmount);

  // For Receipt view
  const receiptAmount = Number(invoice.amountPaid || invoice.advance_amount || invoice.total || invoice.grand_total || 20000);
  const receiptItems = (Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0)
    ? invoice.lineItems.map(item => ({
        description: item.description || '2D ( Floor Plan Residential )',
        area: item.quantity || '',
        unitPrice: item.rate || '',
        amount: Number(item.amount) || receiptAmount,
      }))
    : [{
        description: invoice.description || invoice.projectType || '2D ( Floor Plan Residential )',
        area: totalArea || '',
        unitPrice: unitPrice || '',
        amount: receiptAmount,
      }];
  const receiptTotal = receiptItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-4 px-3 print:p-0 print:m-0 print:max-w-none">
      {/* Action buttons (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 no-print print:hidden">
        <button onClick={() => navigate('/admin/invoices')} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </button>
        <button onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, aside, nav, .no-print, [role="navigation"] {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 1.5px solid #000 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 8px 12px !important;
          }
          .print-document {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
          }
        }
        .print-document {
          max-width: 820px;
          margin: 0 auto;
        }
      `}</style>

      {/* Render Quotation View */}
      {isQuotation && (
        <div className="bg-white border-2 border-black print-card print-document p-4 text-black font-sans leading-tight">
          <div className="text-center pb-2 border-b border-black">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
              CO<span className="text-red-600">X</span> Archify &amp; Buildify LLP
            </h1>
            <p className="text-xs font-medium mt-1">Mission Chowk, Jyoti Nagar, Sundargarh,770001</p>
            <p className="text-xs font-bold mt-0.5">Contact No : 9078036899</p>
          </div>

          <div className="py-2 text-center">
            <p className="text-[10px] leading-snug font-medium px-4">
              &quot;COX Archify &amp; Buildify, where imagination becomes reality. Elevate your space with us and let every corner tell a story of innovation, elegance and timeless design because at COX Archify &amp; Buildify, we don&apos;t just build structures, we create experiences that lasts lifetime.&quot;
            </p>
            <h2 className="text-lg font-extrabold tracking-widest uppercase underline mt-2">
              QUOTATION
            </h2>
          </div>

          <div className="flex justify-between items-start text-[11px] font-semibold leading-relaxed mb-2 px-1">
            <div className="space-y-0.5">
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Sl. no.</span>
                <span>:</span>
                <span className="font-bold">{invoiceNumber !== '—' ? invoiceNumber : 'ABC1641'}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Requested by</span>
                <span>:</span>
                <span>{clientName !== '—' ? clientName : 'Mr. Sudipta Khamari'}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Present address</span>
                <span>:</span>
                <span>{clientAddress !== '—' ? clientAddress : 'Sunaripada, Sundargarh'}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Project location</span>
                <span>:</span>
                <span>{projectLocation !== '—' ? projectLocation : 'Sunaripada, Sundargarh'}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Project Type</span>
                <span>:</span>
                <span>{projectType !== '—' ? projectType : 'Residential'}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span>Contact no.</span>
                <span>:</span>
                <span>{clientContact !== '—' ? clientContact : '7978298250'}</span>
              </div>
            </div>

            <div className="space-y-0.5 text-left">
              <div className="grid grid-cols-[75px_10px_1fr]">
                <span>Date</span>
                <span>:</span>
                <span>{dotDate !== '—' ? dotDate : '15 . 10 . 2026'}</span>
              </div>
              <div className="grid grid-cols-[75px_10px_1fr]">
                <span>Valid upto</span>
                <span>:</span>
                <span>{dotValidDate !== '—' ? dotValidDate : '14 . 11 . 2026'}</span>
              </div>
              <div className="pt-0.5 font-bold">
                {preparedByText}
              </div>
            </div>
          </div>

          <div className="border border-black mb-0">
            <table className="w-full border-collapse text-black">
              <thead>
                <tr className="border-b border-black text-[11px] font-extrabold uppercase tracking-wide bg-white">
                  <th className="border-r border-black py-1 px-3 text-center w-[55%]">{serviceTitle}</th>
                  <th className="border-r border-black py-1 px-2 text-center w-[15%]">AREA (sq.ft.)</th>
                  <th className="border-r border-black py-1 px-2 text-center w-[15%]">UNIT PRICE</th>
                  <th className="py-1 px-2 text-center w-[15%]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 align-top text-[10px] font-bold leading-relaxed">
                    <div className="space-y-0.5">
                      {scopeItems.map((item, idx) => (
                        <div key={idx} className="whitespace-pre-line">{item}</div>
                      ))}
                    </div>

                    {hasFloorBreakdown && (
                      <div className="mt-2 pt-1.5 border-t border-dashed border-gray-400 text-[9.5px]">
                        <div className="underline font-bold mb-0.5">FLOOR BREAKDOWN:</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                          {Number(invoice.ground) > 0 && <div>Ground Floor: {invoice.ground} sq.ft.</div>}
                          {Number(invoice.first) > 0 && <div>First Floor: {invoice.first} sq.ft.</div>}
                          {Number(invoice.second) > 0 && <div>Second Floor: {invoice.second} sq.ft.</div>}
                          {Number(invoice.third) > 0 && <div>Third Floor: {invoice.third} sq.ft.</div>}
                          {Number(invoice.fourth) > 0 && <div>Fourth Floor: {invoice.fourth} sq.ft.</div>}
                          {Number(invoice.fifth) > 0 && <div>Fifth Floor: {invoice.fifth} sq.ft.</div>}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="border-r border-black p-2 text-center align-middle font-bold text-xs">
                    {totalArea || 800}
                  </td>
                  <td className="border-r border-black p-2 text-center align-middle font-bold text-xs">
                    {unitPrice || 50}
                  </td>
                  <td className="p-2 text-center align-middle font-bold text-xs">
                    {fmtRupee(grandTotal || 40000)}
                  </td>
                </tr>
                <tr className="border-t border-black font-extrabold text-xs">
                  <td colSpan={3} className="border-r border-black py-1 px-3 text-right uppercase tracking-wider">
                    GRAND TOTAL
                  </td>
                  <td className="py-1 px-2 text-center">
                    {fmtRupee(grandTotal || 40000)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-black border-t-0 bg-gray-200 py-1 text-center text-[10.5px] font-extrabold tracking-wide">
            Amount in words : {wordsText}
          </div>

          <div className="border border-black border-t-0 grid grid-cols-[1fr_135px]">
            <div className="p-2 text-[10px] font-semibold leading-relaxed">
              <div className="font-extrabold mb-0.5">Bank Details :</div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account</span>
                <span>:</span>
                <span className="font-bold">ARCHIFY AND BUILDIFY CONSTRUCTIONS PRIVATE LIMITED</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank Name</span>
                <span>:</span>
                <span>Bandhan Bank</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account no.</span>
                <span>:</span>
                <span className="font-bold tracking-wider">10220010289792</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank IFSC</span>
                <span>:</span>
                <span className="font-bold tracking-wider">BDBL0001926</span>
              </div>
            </div>

            <div className="border-l border-black p-1.5 flex flex-col items-center justify-center text-center">
              <img src="/scanner.jpg" alt="Scan and Pay QR" className="w-16 h-16 object-contain" />
              <div className="text-[9.5px] font-extrabold mt-0.5">Scan and Pay</div>
            </div>
          </div>

          <div className="border border-black border-t-0 p-1.5 text-[8.5px] font-semibold leading-tight space-y-0.5">
            <div className="font-extrabold text-[9px] uppercase mb-0.5">TERMS and CONDITIONS:</div>
            <div>1) 60% payment along with work order.</div>
            <div>2) Balance payment to be made on delivery.</div>
            <div>3) Maximum three revision as per your specification.</div>
            <div>4) More than three revisions will be charged extra.</div>
            <div>5) Additional charges for unforeseen circumstances.</div>
            <div>6) The client has to provide approvals, access, communication and necessary information for timely delivering of project.</div>
            <div>7) Grand total is exclusive of taxes i.e 18% to the final invoice.</div>
            <div>8) The final bill amount will be calculated as per the carpet area of the site.</div>
          </div>

          <div className="py-1.5 flex items-center justify-around text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <img src="/instagram.png" alt="Instagram" className="w-3.5 h-3.5 object-contain" />
              <span>cox_archifyandbuildify</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src="/facebook.png" alt="Facebook" className="w-3.5 h-3.5 object-contain" />
              <span>Cox ArchifyandBuildify</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-black">www.archifybuildify.com</span>
            </div>
          </div>

          <div className="border border-black text-center">
            <div className="py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-b border-black">
              THANK YOU
            </div>
            <div className="py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider bg-gray-200 border-b border-black">
              OUR SERVICES
            </div>
            <div className="py-1 px-2 text-[9px] font-bold text-gray-900 leading-normal">
              <div>• House Plan as per Vaastu • 3D visualization • Construction • Interior Designing • Modular Kitchen</div>
              <div className="mt-0.5">• Building Plan Approval • Structural Designing • Landscape Designing • Renovation • House Loan</div>
            </div>
          </div>
        </div>
      )}

      {/* Render Receipt View */}
      {isReceipt && (
        <div className="bg-white border-2 border-black print-card print-document p-4 text-black font-sans leading-tight">
          {/* Header */}
          <div className="text-center pb-2 border-b border-black">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
              CO<span className="text-red-600">X</span> Archify &amp; Buildify LLP
            </h1>
            <p className="text-xs font-medium mt-1">Mission Chowk, Jyoti Nagar, Sundargarh,770001</p>
            <p className="text-xs font-bold mt-0.5">Contact No : 9078036899</p>
          </div>

          {/* Tagline */}
          <div className="py-2 text-center">
            <p className="text-[10px] leading-snug font-medium px-4">
              &quot;COX Archify &amp; Buildify where imagination meets reality. Elevate your spaces with us, and let every corner tell a story of innovation, elegance, and timeless design because at COX Archify &amp; Buildify, we don&apos;t just build structures, we create experiences that last a lifetime.&quot;
            </p>
            <h2 className="text-lg font-extrabold tracking-widest uppercase mt-2">
              RECEIPT
            </h2>
          </div>

          {/* Client Metadata & Date */}
          <div className="flex justify-between items-start text-[11px] font-semibold leading-relaxed mb-2 px-1">
            <div className="space-y-0.5">
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Bill no.</span>
                <span>:</span>
                <span className="font-bold">{invoiceNumber !== '—' ? invoiceNumber : 'ABC1075'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Name</span>
                <span>:</span>
                <span>{clientName !== '—' ? clientName : 'Mr. Jaiwant Soreng'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Address</span>
                <span>:</span>
                <span>{clientAddress !== '—' ? clientAddress : 'Jyoti Nagar, Sundargarh'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Contact no.</span>
                <span>:</span>
                <span>{clientContact !== '—' ? clientContact : '8249256115'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold">Date: {receiptDateDot !== '—' ? receiptDateDot : '21.08.2026'}</span>
            </div>
          </div>

          {/* Description of Work Table */}
          <div className="border border-black mb-0">
            <table className="w-full border-collapse text-black text-[10px]">
              <thead>
                <tr className="border-b border-black font-extrabold uppercase bg-white">
                  <th className="border-r border-black py-1.5 px-3 text-center w-[55%]">DESCRIPTION OF WORK</th>
                  <th className="border-r border-black py-1.5 px-2 text-center w-[15%]">Area (sq.ft)</th>
                  <th className="border-r border-black py-1.5 px-2 text-center w-[15%]">UNIT PRICE</th>
                  <th className="py-1.5 px-2 text-center w-[15%]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {receiptItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-black font-bold h-20">
                    <td className="border-r border-black py-2 px-3 text-center align-middle font-bold">
                      {item.description}
                    </td>
                    <td className="border-r border-black py-2 px-2 text-center align-middle">
                      {item.area ? Number(item.area).toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border-r border-black py-2 px-2 text-center align-middle">
                      {item.unitPrice || ''}
                    </td>
                    <td className="py-2 px-2 text-center align-middle font-bold">
                      {fmtRupee(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-200 font-extrabold text-[10.5px]">
                  <td colSpan={3} className="border-r border-black py-1.5 px-3 text-right uppercase tracking-wider">
                    TOTAL AMOUNT
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold">
                    {fmtRupee(receiptTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details Section */}
          <div className="border border-black border-t-0">
            <div className="py-0.5 text-center font-extrabold uppercase text-[10px] border-b border-black tracking-wider">
              PAYMENT DETAILS
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-black font-extrabold uppercase bg-white">
                  <th className="border-r border-black py-1.5 px-2 text-center w-[20%]">DATE</th>
                  <th className="border-r border-black py-1.5 px-2 text-center w-[26%]">MODE OF PAYMENT</th>
                  <th className="border-r border-black py-1.5 px-2 text-center w-[34%]">RECEIVED BY</th>
                  <th className="py-1.5 px-2 text-center w-[20%]">ADVANCED AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold">
                  <td className="border-r border-black py-2 px-2 text-center align-middle">
                    {receiptDateDot !== '—' ? receiptDateDot : '21.08.2026'}
                  </td>
                  <td className="border-r border-black py-2 px-2 text-center align-middle">
                    {paymentMode !== '—' ? paymentMode : 'Cash'}
                  </td>
                  <td className="border-r border-black py-2 px-2 text-center align-middle leading-tight">
                    COX Archify &amp; Buildify<br />Constructions Private Limited
                  </td>
                  <td className="py-2 px-2 text-center align-middle font-bold">
                    {fmtRupee(receiptAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bank Details & SCAN TO PAY */}
          <div className="border border-black border-t-0 grid grid-cols-[1fr_135px]">
            <div className="p-2 text-[10px] font-semibold leading-relaxed">
              <div className="font-extrabold mb-0.5">Bank Details :</div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account</span>
                <span>:</span>
                <span className="font-bold">ARCHIFY AND BUILDIFY CONSTRUCTIONS PRIVATE LIMITED</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank Name</span>
                <span>:</span>
                <span>Bandhan Bank</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account no.</span>
                <span>:</span>
                <span className="font-bold tracking-wider">10220010289792</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank IFSC</span>
                <span>:</span>
                <span className="font-bold tracking-wider">BDBL0001926</span>
              </div>
            </div>

            <div className="border-l border-black p-1.5 flex flex-col items-center justify-center text-center">
              <img src="/scanner.jpg" alt="Scan and Pay QR" className="w-16 h-16 object-contain" />
              <div className="text-[9.5px] font-extrabold mt-0.5 tracking-wider uppercase">SCAN TO PAY</div>
            </div>
          </div>

          {/* Shaded Message Bar */}
          <div className="border border-black border-t-0 bg-gray-200 py-1.5 text-center text-[10.5px] font-extrabold tracking-wide">
            Part payment received for the services you have opted for.
          </div>

          {/* Social Links */}
          <div className="py-1.5 flex items-center justify-around text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <img src="/instagram.png" alt="Instagram" className="w-3.5 h-3.5 object-contain" />
              <span>archify_buildify</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src="/facebook.png" alt="Facebook" className="w-3.5 h-3.5 object-contain" />
              <span>@archifyandbuildify</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-black">www.archifybuildify.com</span>
            </div>
          </div>

          {/* Footer Box */}
          <div className="border border-black text-center">
            <div className="py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-b border-black">
              THANK YOU
            </div>
            <div className="py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider bg-gray-200 border-b border-black">
              OUR SERVICES
            </div>
            <div className="py-1 px-2 text-[9px] font-bold text-gray-900 leading-normal">
              <div>• House Plan as per Vaastu • 3D visualization • Construction • Interior Designing • Modular Kitchen</div>
              <div className="mt-0.5">• Building Plan Approval • Structural Designing • Landscape Designing • Renovation • House Loan</div>
            </div>
          </div>
        </div>
      )}

      {/* Render Invoice View */}
      {!isQuotation && !isReceipt && (
        <div className="bg-white border-2 border-black print-card print-document p-4 text-black font-sans leading-tight">
          {/* Header */}
          <div className="text-center pb-2 border-b border-black">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
              CO<span className="text-red-600">X</span> Archify &amp; Buildify LLP
            </h1>
            <p className="text-xs font-medium mt-1">Mission Chowk, Jyoti Nagar, Sundargarh,770001</p>
            <p className="text-xs font-bold mt-0.5">Contact No : 9078036899</p>
          </div>

          {/* Tagline */}
          <div className="py-2 text-center">
            <p className="text-[10px] leading-snug font-medium px-4">
              &quot;COX Archify &amp; Buildify where imagination meets reality. Elevate your spaces with us, and let every corner tell a story of innovation, elegance, and timeless design because at COX Archify &amp; Buildify, we don&apos;t just build structures, we create experiences that last a lifetime.&quot;
            </p>
            <h2 className="text-lg font-extrabold tracking-widest uppercase mt-2">
              INVOICE
            </h2>
          </div>

          {/* Metadata & Date */}
          <div className="flex justify-between items-start text-[11px] font-semibold leading-relaxed mb-2 px-1">
            <div className="space-y-0.5">
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Invoice no.</span>
                <span>:</span>
                <span className="font-bold">{invoiceNumber !== '—' ? invoiceNumber : 'ABC1220'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Name</span>
                <span>:</span>
                <span>{clientName !== '—' ? clientName : 'Mr. Jaiwant Soreng'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Address</span>
                <span>:</span>
                <span>{clientAddress !== '—' ? clientAddress : 'Jyoti Nagar, Sundargarh'}</span>
              </div>
              <div className="grid grid-cols-[90px_10px_1fr]">
                <span>Contact no.</span>
                <span>:</span>
                <span>{clientContact !== '—' ? clientContact : '8249256115'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold">Date: {dotDate !== '—' ? dotDate : '25 . 09 . 2026'}</span>
            </div>
          </div>

          {/* Main Services Table */}
          <div className="border border-black mb-0">
            <table className="w-full border-collapse text-black text-[10px]">
              <thead>
                <tr className="border-b border-black font-extrabold uppercase bg-white">
                  <th className="border-r border-black py-1 px-2 text-center w-[30%]">DESCRIPTION</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[9.5%]">GROUND FLOOR</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[9.5%]">FIRST FLOOR</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[9.5%]">SECOND FLOOR</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[9.5%]">THIRD FLOOR</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[11%]">TOTAL AREA (sq.ft)</th>
                  <th className="border-r border-black py-1 px-1 text-center w-[10%]">UNIT PRICE ( Rupees )</th>
                  <th className="py-1 px-2 text-center w-[11%]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-black font-bold">
                    <td className="border-r border-black py-1 px-2 text-left font-bold">{row.name}</td>
                    <td className="border-r border-black py-1 px-1 text-center">{row.ground || ''}</td>
                    <td className="border-r border-black py-1 px-1 text-center">{row.first || ''}</td>
                    <td className="border-r border-black py-1 px-1 text-center">{row.second || ''}</td>
                    <td className="border-r border-black py-1 px-1 text-center">{row.third || ''}</td>
                    <td className="border-r border-black py-1 px-1 text-center">
                      {row.totalArea ? Number(row.totalArea).toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border-r border-black py-1 px-1 text-center">{row.unitPrice || ''}</td>
                    <td className="py-1 px-2 text-center font-bold">
                      {fmtRupee(row.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="font-extrabold text-[10.5px]">
                  <td colSpan={7} className="border-r border-black py-1 px-3 text-right uppercase tracking-wider">
                    TOTAL AMOUNT
                  </td>
                  <td className="py-1 px-2 text-center font-bold">
                    {fmtRupee(computedTotalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount in Words */}
          <div className="border border-black border-t-0 bg-gray-200 py-1 text-center text-[10px] font-extrabold tracking-wide">
            Total amount in words : {numberToWordsRupees(computedTotalAmount)} .
          </div>

          {/* Payment Details Section */}
          <div className="border border-black border-t-0">
            <div className="py-0.5 text-center font-extrabold uppercase text-[10px] border-b border-black tracking-wider">
              PAYMENT DETAILS
            </div>

            <table className="w-full border-collapse text-[10px]">
              <tbody>
                {paymentList.map((p, idx) => (
                  <tr key={idx} className={idx < paymentList.length - 1 ? 'border-b border-black' : ''}>
                    <td className="border-r border-black py-0.5 px-3 font-semibold w-[69%]">
                      Date: {p.date}
                    </td>
                    <td className="py-0.5 px-2 text-center font-bold w-[31%]">
                      {fmtRupee(p.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-black bg-gray-100 font-extrabold">
                  <td className="border-r border-black py-0.5 px-3 text-right uppercase tracking-wider">
                    TOTAL PAID
                  </td>
                  <td className="py-0.5 px-2 text-center">
                    {fmtRupee(totalPaid)}
                  </td>
                </tr>
                <tr className="border-t border-black bg-gray-100 font-extrabold">
                  <td className="border-r border-black py-0.5 px-3 text-right uppercase tracking-wider">
                    APPROVAL APPLICATION FEE
                  </td>
                  <td className="py-0.5 px-2 text-center">
                    {fmtRupee(approvalFee)}
                  </td>
                </tr>
                <tr className="border-t border-black bg-gray-100 font-extrabold">
                  <td className="border-r border-black py-0.5 px-3 text-right uppercase tracking-wider">
                    TOTAL DUE AMOUNT
                  </td>
                  <td className="py-0.5 px-2 text-center">
                    {fmtRupee(totalDueAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Due Amount in Words */}
          <div className="border border-black border-t-0 bg-gray-200 py-1 text-center text-[10px] font-extrabold tracking-wide">
            Total amount in words : {totalDueWordsText} .
          </div>

          {/* Bank Details & SCAN TO PAY */}
          <div className="border border-black border-t-0 grid grid-cols-[1fr_135px]">
            <div className="p-2 text-[10px] font-semibold leading-relaxed">
              <div className="font-extrabold mb-0.5">Bank Details :</div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account</span>
                <span>:</span>
                <span className="font-bold">ARCHIFY AND BUILDIFY CONSTRUCTIONS PRIVATE LIMITED</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank Name</span>
                <span>:</span>
                <span>Bandhan Bank</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Account no.</span>
                <span>:</span>
                <span className="font-bold tracking-wider">10220010289792</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span>Bank IFSC</span>
                <span>:</span>
                <span className="font-bold tracking-wider">BDBL0001926</span>
              </div>
            </div>

            <div className="border-l border-black p-1.5 flex flex-col items-center justify-center text-center">
              <img src="/scanner.jpg" alt="Scan and Pay QR" className="w-16 h-16 object-contain" />
              <div className="text-[9.5px] font-extrabold mt-0.5 tracking-wider uppercase">SCAN TO PAY</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="py-1.5 flex items-center justify-around text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <img src="/instagram.png" alt="Instagram" className="w-3.5 h-3.5 object-contain" />
              <span>archify_buildify</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src="/facebook.png" alt="Facebook" className="w-3.5 h-3.5 object-contain" />
              <span>@archifyandbuildify</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-black">www.archifybuildify.com</span>
            </div>
          </div>

          {/* Footer Box */}
          <div className="border border-black text-center">
            <div className="py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-b border-black">
              THANK YOU
            </div>
            <div className="py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider bg-gray-200 border-b border-black">
              OUR SERVICES
            </div>
            <div className="py-1 px-2 text-[9px] font-bold text-gray-900 leading-normal">
              <div>• House Plan as per Vaastu • 3D visualization • Construction • Interior Designing • Modular Kitchen</div>
              <div className="mt-0.5">• Building Plan Approval • Structural Designing • Landscape Designing • Renovation • House Loan</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
