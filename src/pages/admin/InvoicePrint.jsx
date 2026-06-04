import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const numberToWords = (amount) => {
  if (amount === 0) return 'zero';
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const toWords = (n) => {
    if (n < 20) return words[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${words[n % 10]}` : '');
    if (n < 1000) return `${words[Math.floor(n / 100)]} hundred${n % 100 ? ` ${toWords(n % 100)}` : ''}`;
    if (n < 100000) return `${toWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${toWords(n % 1000)}` : ''}`;
    if (n < 10000000) return `${toWords(Math.floor(n / 100000))} lakh${n % 100000 ? ` ${toWords(n % 100000)}` : ''}`;
    return `${toWords(Math.floor(n / 10000000))} crore${n % 10000000 ? ` ${toWords(n % 10000000)}` : ''}`;
  };
  return toWords(amount);
};

const getFirstDefined = (source, ...keys) => keys.map(key => source[key]).find(value => value !== undefined && value !== null && value !== '') || '—';

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
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!invoice) return null;

  const invoiceNumber = getFirstDefined(invoice, 'invoiceNumber', 'invoice_number', 'receipt_number', 'id');
  const invoiceDate = getFirstDefined(invoice, 'date', 'invoice_date', 'quotationDate', 'quotation_date', 'receipt_date');
  const formattedDate = invoiceDate !== '—' ? format(new Date(invoiceDate), 'yyyy-MM-dd') : '—';
  const documentTitle = invoice.type === 'Receipt' ? 'Receipt' : invoice.type === 'Quotation' ? 'Quotation' : 'Invoice';
  const name = getFirstDefined(invoice, 'clientName', 'client_name', 'requestedBy', 'requested_by');
  const addressValue = getFirstDefined(invoice, 'address', 'clientAddress', 'client_address', 'presentAddress', 'present_address');
  const contact = getFirstDefined(invoice, 'clientContact', 'client_contact', 'contactNumber', 'contact_number');
  const paymentMode = getFirstDefined(invoice, 'paymentMode', 'payment_mode');
  const paymentAmount = invoice.amountPaid || invoice.total || invoice.grand_total || 0;
  const amountInWords = `${numberToWords(Math.floor(paymentAmount))}${paymentAmount % 1 ? ` and ${numberToWords(Math.round((paymentAmount % 1) * 100))} paise` : ''}`;

  const hasLineItems = Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0;
  const lineItems = hasLineItems ? invoice.lineItems : [{
    description: invoice.description || 'Description',
    quantity: invoice.total_area || invoice.totalArea || invoice.area || 1,
    rate: invoice.unitPrice || invoice.unit_price || 0,
    amount: invoice.grand_total || invoice.total || paymentAmount,
  }];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 no-print">
        <button onClick={() => navigate('/admin/invoices')} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </button>
        <button onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; }
        }
        .print-document { max-width: 920px; margin: 0 auto; }
        .invoice-header-text { line-height: 1.05; }
        .receipt-title { letter-spacing: 0.08em; }
        .label-value span { font-weight: 700; }
      `}</style>

      <div className="bg-white border border-black print-card print-document p-6">
        <div className="border border-black p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center text-center">
                <img src="/logo-receipt.png" alt="Archify & Buildify" className="h-20 w-20 object-contain" />
                <div className="text-[10px] uppercase tracking-wide mt-1">Archify & Buildify</div>
                <div className="text-[9px] uppercase tracking-wider">CONCEPT OF CREATION</div>
              </div>
              <div className="invoice-header-text pt-2">
                <div className="text-[11px] uppercase tracking-wide">State: Odisha,State Code: 21</div>
                <div className="text-3xl font-bold uppercase">ARCHIFY & BUILDIFY CONSTRUCTIONS PVT. LTD.</div>
                <div className="text-sm">Raj Nivas,G.A. 432,B1,Second floor,near DAV School,Kalinga Nagar,Bhubaneswar,Odisha 751003</div>
                <div className="text-sm">Contact no.: 9078036899</div>
              </div>
            </div>
            <div className="text-sm text-right pt-2">
              <div className="font-semibold">GSTIN: 21AASCA0645C1Z5</div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-xs italic">"Archify & Buildify where imagination becomes reality. Elevate your space with us and let every corner tell a story of innovation, elegance and timeless design because at Archify & Buildify we don't just build structures, we create experiences that lasts lifetime"</p>
          <h2 className="text-2xl font-bold uppercase mt-4 receipt-title">{documentTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="space-y-1 label-value">
            <div>Invoice. no. :{invoiceNumber}</div>
            <div>Name :{name}</div>
            <div>Address :{addressValue}</div>
            <div>Contact Number :{contact}</div>
          </div>
          <div className="text-right md:text-right label-value">
            <div>Date :{formattedDate}</div>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse border border-black">
            <thead>
              <tr className="bg-white text-black text-left text-xs uppercase tracking-wide">
                <th className="border border-black px-3 py-2 font-semibold">DESCRIPTION</th>
                <th className="border border-black px-3 py-2 text-center font-semibold">AREA(sq.ft.)</th>
                <th className="border border-black px-3 py-2 text-center font-semibold">UNIT PRICE(₹)</th>
                <th className="border border-black px-3 py-2 text-center font-semibold">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="bg-white">
                  <td className="border border-black px-3 py-3 align-top">{item.description || 'Service'}</td>
                  <td className="border border-black px-3 py-3 text-center">{item.quantity || item.area || '-'}</td>
                  <td className="border border-black px-3 py-3 text-center">{fmt(item.rate)}</td>
                  <td className="border border-black px-3 py-3 text-center font-semibold">{fmt(item.amount || (item.quantity * item.rate))}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-black px-3 py-3 text-right font-semibold" colSpan={3}>Grand Total</td>
                <td className="border border-black px-3 py-3 text-center font-semibold">{fmt(invoice.total || invoice.grand_total || paymentAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-y border-black py-3 mb-4 text-center text-sm font-semibold">Amount in words : {amountInWords}</div>

        <div className="border border-black mb-4">
          <div className="bg-white border-b border-black px-3 py-2 text-sm font-semibold uppercase">Payment Details</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="border-r border-black px-3 py-3 font-semibold uppercase text-[11px]">DATE</td>
                <td className="border-r border-black px-3 py-3 font-semibold uppercase text-[11px]">MODE OF PAYMENT</td>
                <td className="border-r border-black px-3 py-3 font-semibold uppercase text-[11px]">RECEIVED BY</td>
                <td className="px-3 py-3 font-semibold uppercase text-[11px]">ADVANCED AMOUNT</td>
              </tr>
              <tr>
                <td className="border-r border-black px-3 py-3">{formattedDate}</td>
                <td className="border-r border-black px-3 py-3">{paymentMode || '—'}</td>
                <td className="border-r border-black px-3 py-3">Archify & Buildify Constructions Private Limited</td>
                <td className="px-3 py-3">{fmt(paymentAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 text-sm">
          <div className="lg:col-span-2 border border-black p-3">
            <div className="font-semibold mb-1">Bank Details:</div>
            <div>Account : ARCHIFY AND BUILDING CONSTRUCTIONS PRIVATE LIMITED</div>
            <div>Bank Name : Bandhan Bank</div>
            <div>Account no. : 10220010289792</div>
            <div>Bank IFSC : BDBL0001926</div>
          </div>
          <div className="border border-black p-3 flex flex-col items-center justify-center">
            <div className="text-xs uppercase font-semibold mb-2">Scan and Pay</div>
            <img src="/scanner.jpg" alt="QR Code" className="w-32 h-32 object-contain" />
          </div>
        </div>

        <div className="border-t border-black pt-4 text-sm">
          <div className="grid grid-cols-3 gap-2 items-center text-center mb-2">
            <div className="flex items-center justify-center gap-2">
              <img src="/instagram.png" alt="Instagram" className="h-5 w-5 object-contain" />
              <span className="font-semibold">archify_buildify</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <img src="/facebook.png" alt="Facebook" className="h-5 w-5 object-contain" />
              <span className="font-semibold">archifyandbuildify</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold">www.archifybuildify.com</span>
            </div>
          </div>
          <div className="text-center font-semibold mb-2">THANK YOU</div>
          <div className="uppercase tracking-wide text-xs mb-2 text-center">OUR SERVICES</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700">
            <span>House Plan as per Vaastu</span>
            <span>3D visualization</span>
            <span>Construction</span>
            <span>Interior Designing</span>
            <span>Modular Kitchen</span>
            <span>Building Plan Approval</span>
            <span>Structural Designing</span>
            <span>Landscape Designing</span>
            <span>Renovation</span>
            <span>House Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
