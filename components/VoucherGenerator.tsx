import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContainerItem } from '../utils/types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VoucherGeneratorProps {
  invoiceNumber: string
  invoiceDate: string
  buyerName: string
  billTo: string
  selectedProducts: { id: string; quantity: number }[]
  items: ContainerItem[]
  buyerType: 'bulk' | 'distributor' | 'retail'
  currency: 'JOD' | 'USD'
  taxPercentage: number
  termsAndConditions: string
  totalAmount: number
}

const USD_TO_JOD_RATE = 0.710;

export function VoucherGenerator({
  invoiceNumber,
  invoiceDate,
  buyerName,
  billTo,
  selectedProducts,
  items,
  buyerType,
  currency,
  taxPercentage,
  termsAndConditions,
  totalAmount
}: VoucherGeneratorProps) {
  const [voucherNumber, setVoucherNumber] = useState(`VCH-${invoiceNumber.split('-')[1]}`)
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0])
  const [amendedAmount, setAmendedAmount] = useState(totalAmount.toFixed(2))
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')

  const generateVoucher = () => {
    const fileName = `Voucher_${voucherNumber}.pdf`;
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
    doc.text('Payment Voucher', margin + 30, margin + 10);

    // Add company info and voucher details
    doc.setFontSize(10);
    doc.text('Palm Desert Trading Co. LLC.', margin, margin + 30);
    doc.text('P.O Box 4028 Amman, 11953 Amman', margin, margin + 35);
    doc.text('TEL: +962 5522668 | Email: Info@palmdt.com', margin, margin + 40);
    doc.text('Sales Tax NO: 40177840', margin, margin + 45);

    doc.text(`Voucher Date: ${voucherDate}`, pageWidth - margin - 60, margin + 30);
    doc.text(`Voucher No: ${voucherNumber}`, pageWidth - margin - 60, margin + 35);
    doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin - 60, margin + 40);
    doc.text(`Invoice Date: ${invoiceDate}`, pageWidth - margin - 60, margin + 45);

    // Add Paid To section
    doc.text('Paid To:', margin, margin + 55);
    const billToLines = billTo.split('\n');
    billToLines.forEach((line, index) => {
      doc.text(line, margin, margin + 60 + (index * 5));
    });

    // Add payment details
    doc.setFontSize(12);
    doc.text('Payment Details', margin, margin + 90);
    doc.setFontSize(10);
    doc.text(`Amount Paid: ${currency} ${parseFloat(amendedAmount).toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})}`, margin, margin + 100);
    doc.text(`Payment Method: ${paymentMethod}`, margin, margin + 105);
    doc.text(`Payment Date: ${voucherDate}`, margin, margin + 110);

    // Add signature lines
    doc.line(margin, pageHeight - margin - 40, margin + 70, pageHeight - margin - 40);
    doc.text('Authorized Signature', margin, pageHeight - margin - 35);

    doc.line(pageWidth - margin - 70, pageHeight - margin - 40, pageWidth - margin, pageHeight - margin - 40);
    doc.text('Receiver Signature', pageWidth - margin - 70, pageHeight - margin - 35);

    // Add the system-generated message
    doc.setFontSize(9);
    doc.setTextColor(100);
    const newText = "This voucher is system generated and serves as proof of payment. If you have any questions, please contact us by email: info@palmdt.com";
    const textLines = doc.splitTextToSize(newText, usableWidth);
    doc.text(textLines, margin, pageHeight - margin - 22);

    // Add the "Thank you" message
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Thank you for your business.', pageWidth / 2, pageHeight - margin - 8, { align: 'center' });

    doc.save(fileName);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="voucher-number">Voucher Number</Label>
          <Input
            id="voucher-number"
            value={voucherNumber}
            onChange={(e) => setVoucherNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="voucher-date">Voucher Date</Label>
          <Input
            id="voucher-date"
            type="date"
            value={voucherDate}
            onChange={(e) => setVoucherDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="amended-amount">Amended Amount ({currency})</Label>
        <Input
          id="amended-amount"
          type="number"
          step="0.01"
          value={amendedAmount}
          onChange={(e) => setAmendedAmount(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="payment-method">Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Voucher Details</h3>
        <p><strong>Invoice Number:</strong> {invoiceNumber}</p>
        <p><strong>Invoice Date:</strong> {invoiceDate}</p>
        <p><strong>Buyer Name:</strong> {buyerName}</p>
        <p><strong>Original Amount:</strong> {currency} {totalAmount.toLocaleString(undefined, {minimumFractionDigits: currency === 'JOD' ? 3 : 2, maximumFractionDigits: currency === 'JOD' ? 3 : 2})}</p>
      </div>
      <Button onClick={generateVoucher}>Generate and Save Voucher</Button>
    </div>
  )
}

