import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContainerItem } from '../utils/types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface QuotationGeneratorProps {
  quoteReference: string
  buyerName: string
  billTo: string
  selectedProducts: { id: string; quantity: number }[]
  items: ContainerItem[]
  buyerType: 'bulk' | 'distributor' | 'retail'
  currency: 'JOD' | 'USD'
  taxPercentage: number
  termsAndConditions: string
}

const USD_TO_JOD_RATE = 0.710;

const calculateSellingPrice = (costPerCarton: number, buyerType: 'bulk' | 'distributor' | 'retail') => {
  switch (buyerType) {
    case 'bulk':
      return costPerCarton * 2; // 100% markup
    case 'distributor':
      return costPerCarton * 2.5; // 150% markup
    case 'retail':
      return costPerCarton * 3; // 200% markup
    default:
      return costPerCarton;
  }
};

export function QuotationGenerator({
  quoteReference,
  buyerName,
  billTo,
  selectedProducts,
  items,
  buyerType,
  currency,
  taxPercentage,
  termsAndConditions
}: QuotationGeneratorProps) {
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0])

  const generateQuotation = () => {
    const fileName = `Quotation_${quoteReference}.pdf`;
    const pageWidth = 210;  // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;      // 20mm margin
    const usableWidth = pageWidth - (2 * margin);
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    // Add company logo
    const imgData = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rabsin%20logo-WkMxi91yvrgdWv766tzFg2GtZt2EBI.png';
    doc.addImage(imgData, 'PNG', margin, margin, 20, 20);

    // Add title
    doc.setFontSize(18);
    doc.text('Quotation', margin + 30, margin + 10);

    // Add company info and date/quote reference
    doc.setFontSize(10);
    doc.text('Palm Desert Trading Co. LLC.', margin, margin + 30);
    doc.text('P.O Box 4028 Amman, 11953 Amman', margin, margin + 35);
    doc.text('TEL: +962 5522668 | Email: Info@palmdt.com', margin, margin + 40);
    doc.text('Sales Tax NO: 40177840', margin, margin + 45);

    doc.text(`Date: ${quoteDate}`, pageWidth - margin - 60, margin + 30);
    doc.text(`Quote Ref: ${quoteReference}`, pageWidth - margin - 60, margin + 35);

    // Add Bill To section
    doc.text('Bill To:', margin, margin + 55);
    const billToLines = billTo.split('\n');
    billToLines.forEach((line, index) => {
      doc.text(line, margin, margin + 60 + (index * 5));
    });

    // Add product table
    const tableData = selectedProducts.map(sp => {
      const item = items.find(i => i.id === sp.id);
      if (!item || !item.results) return [];
      const pricePerCarton = calculateSellingPrice(item.results.totalCostPerCarton, buyerType);
      const total = pricePerCarton * sp.quantity;
      return [
        sp.quantity,
        item.productName,
        (pricePerCarton * (currency === 'JOD' ? 1 : 1/USD_TO_JOD_RATE)).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2}),
        `${taxPercentage}%`,
        (total * (currency === 'JOD' ? 1 : 1/USD_TO_JOD_RATE)).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})
      ];
    });

    (doc as any).autoTable({
      startY: margin + 80,
      margin: { left: margin, right: margin },
      head: [['Qty', 'Item Description', 'Unit Price', 'TAX %', 'Total']],
      body: tableData,
    });

    // Calculate totals
    const totals = selectedProducts.reduce((acc, sp) => {
      const item = items.find(i => i.id === sp.id);
      if (!item || !item.results) return acc;
      const pricePerCarton = calculateSellingPrice(item.results.totalCostPerCarton, buyerType);
      const total = pricePerCarton * sp.quantity;
      return {
        subtotal: acc.subtotal + total,
        salesTax: acc.salesTax + (total * (taxPercentage / 100)),
      };
    }, { subtotal: 0, salesTax: 0 });

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text(`Subtotal: ${(totals.subtotal * (currency === 'JOD' ? 1 : 1/USD_TO_JOD_RATE)).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})}`, pageWidth - margin - 50, finalY + 10);
    doc.text(`Sales Tax: ${(totals.salesTax * (currency === 'JOD' ? 1 : 1/USD_TO_JOD_RATE)).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})}`, pageWidth - margin - 50, finalY + 15);
    doc.setFontSize(12);
    doc.text(`Total: ${currency} ${((totals.subtotal + totals.salesTax) * (currency === 'JOD' ? 1 : 1/USD_TO_JOD_RATE)).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})}`, pageWidth - margin - 50, finalY + 20);

    // Add Terms and Conditions
    if (termsAndConditions) {
      doc.setFontSize(10);
      doc.text('Terms and Conditions:', margin, finalY + 30);
      const termsLines = doc.splitTextToSize(termsAndConditions, usableWidth);
      doc.text(termsLines, margin, finalY + 35);
    }

    // Add bank details
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text('Palm Desert Trading Co. LLC.', margin, pageHeight - margin - 55);
    doc.text('ADDRESS: AMMAN, JORDAN', margin, pageHeight - margin - 51);
    doc.text('BANK NAME: BANK AL ETIHAD', margin, pageHeight - margin - 47);
    doc.text('ADDRESS: AMMAN, JORDAN', margin, pageHeight - margin - 43);
    doc.text('ACCOUNT NUMBER: 0480155486915101 (JOD)', margin, pageHeight - margin - 39);
    doc.text('IBAN: JO18UBSI4800000480155486915101', margin, pageHeight - margin - 35);
    doc.text('SWIFT NUMBER: UBSIJOAX', margin, pageHeight - margin - 31);

    // Add the system-generated message
    doc.setFontSize(9);
    doc.setTextColor(100);
    const newText = "This quotation is system generated and does not require any stamp or signature. If you have any questions concerning this quotation, please contact us by email: info@palmdt.com";
    const textLines = doc.splitTextToSize(newText, usableWidth);
    doc.text(textLines, margin, pageHeight - margin - 22);

    // Move the "Thank you" message down
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Thank you for your business.', pageWidth / 2, pageHeight - margin - 8, { align: 'center' });

    doc.save(fileName);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="quote-date">Quotation Date</Label>
        <Input
          id="quote-date"
          type="date"
          value={quoteDate}
          onChange={(e) => setQuoteDate(e.target.value)}
        />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Quotation Details</h3>
        <p><strong>Quote Reference:</strong> {quoteReference}</p>
        <p><strong>Buyer Name:</strong> {buyerName}</p>
        <p><strong>Bill To:</strong> {billTo}</p>
        <p><strong>Buyer Type:</strong> {buyerType}</p>
        <p><strong>Currency:</strong> {currency}</p>
        <p><strong>Tax Percentage:</strong> {taxPercentage}%</p>
      </div>
      <Button onClick={generateQuotation}>Generate and Save Quotation</Button>
    </div>
  )
}

