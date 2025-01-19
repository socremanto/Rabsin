import { useState } from 'react'
import { ContainerItem } from '../utils/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { QuotationGenerator } from './QuotationGenerator'
import { InvoiceGenerator } from './InvoiceGenerator'
import { VoucherGenerator } from './VoucherGenerator'

interface DocumentGeneratorProps {
  items: ContainerItem[]
}

interface SelectedProduct {
  id: string;
  quantity: number;
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

const generateQuoteReference = (lastNumber: number) => {
  const nextNumber = lastNumber + 1;
  const currentYear = new Date().getFullYear();
  return `Rabsin${currentYear}/${String(nextNumber).padStart(3, '0')}`;
};

export function DocumentGenerator({ items }: DocumentGeneratorProps) {
  const [lastReferenceNumber, setLastReferenceNumber] = useState(0);
  const [quoteReference, setQuoteReference] = useState(() => generateQuoteReference(0));
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [buyerType, setBuyerType] = useState<'bulk' | 'distributor' | 'retail'>('bulk')
  const [buyerName, setBuyerName] = useState('')
  const [billTo, setBillTo] = useState('')
  const [currency, setCurrency] = useState<'JOD' | 'USD'>('JOD');
  const [taxPercentage, setTaxPercentage] = useState(16);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);

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

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { id: '', quantity: 0 }]);
  };

  const updateSelectedProduct = (index: number, field: 'id' | 'quantity', value: string | number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setSelectedProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyer-name">Buyer Name</Label>
              <Input
                id="buyer-name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter buyer name"
              />
            </div>
            <div>
              <Label htmlFor="quote-reference">Quote Reference</Label>
              <Input
                id="quote-reference"
                value={quoteReference}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="buyer-type-select">Buyer Type</Label>
              <Select value={buyerType} onValueChange={(value: 'bulk' | 'distributor' | 'retail') => setBuyerType(value)}>
                <SelectTrigger id="buyer-type-select">
                  <SelectValue placeholder="Choose buyer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency-select">Currency</Label>
              <Select value={currency} onValueChange={(value: 'JOD' | 'USD') => setCurrency(value)}>
                <SelectTrigger id="currency-select">
                  <SelectValue placeholder="Choose currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOD">JOD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax-percentage">Tax Percentage</Label>
              <Input
                id="tax-percentage"
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bill-to">Bill To</Label>
            <Textarea
              id="bill-to"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder="Enter billing address"
              rows={4}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Selected Products</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((sp, index) => (
                  <tr key={index}>
                    <td>
                      <Select value={sp.id} onValueChange={(value) => updateSelectedProduct(index, 'id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.productName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={sp.quantity}
                        onChange={(e) => updateSelectedProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                        min={0}
                      />
                    </td>
                    <td>
                      <Button variant="destructive" onClick={() => removeProduct(index)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={addProduct}>Add Product</Button>
          </div>
          <div>
            <Label htmlFor="terms-and-conditions">Terms and Conditions</Label>
            <Textarea
              id="terms-and-conditions"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Enter terms and conditions"
              rows={6}
            />
          </div>
          <div className="flex space-x-4">
            <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={selectedProducts.length === 0 || !buyerName || !quoteReference}
                  onClick={() => setIsQuotationDialogOpen(true)}
                >
                  Generate Quotation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Generate Quotation</DialogTitle>
                </DialogHeader>
                <QuotationGenerator
                  quoteReference={quoteReference}
                  buyerName={buyerName}
                  billTo={billTo}
                  selectedProducts={selectedProducts}
                  items={items}
                  buyerType={buyerType}
                  currency={currency}
                  taxPercentage={taxPercentage}
                  termsAndConditions={termsAndConditions}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={selectedProducts.length === 0 || !buyerName || !quoteReference}
                  onClick={() => setIsInvoiceDialogOpen(true)}
                >
                  Generate Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Generate Invoice</DialogTitle>
                </DialogHeader>
                <InvoiceGenerator
                  quoteReference={quoteReference}
                  buyerName={buyerName}
                  billTo={billTo}
                  selectedProducts={selectedProducts}
                  items={items}
                  buyerType={buyerType}
                  currency={currency}
                  taxPercentage={taxPercentage}
                  termsAndConditions={termsAndConditions}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={selectedProducts.length === 0 || !buyerName || !quoteReference}
                  onClick={() => setIsVoucherDialogOpen(true)}
                >
                  Generate Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Generate Voucher</DialogTitle>
                </DialogHeader>
                <VoucherGenerator
                  invoiceNumber={`INV-${quoteReference.split('/')[1]}`}
                  invoiceDate={new Date().toISOString().split('T')[0]}
                  buyerName={buyerName}
                  billTo={billTo}
                  selectedProducts={selectedProducts}
                  items={items}
                  buyerType={buyerType}
                  currency={currency}
                  taxPercentage={taxPercentage}
                  termsAndConditions={termsAndConditions}
                  totalAmount={totals.subtotal + totals.salesTax}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DocumentGenerator;

