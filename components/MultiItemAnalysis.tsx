'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Printer } from 'lucide-react'
import { ContainerItem, ShippingDetails, CalculationResults, ProductDetails } from '../utils/types'
import { calculateCosts } from '../utils/calculations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductSummary } from './ProductSummary'
import { DocumentGenerator } from './DocumentGenerator'
import { ExcelUploader } from './ExcelUploader'

export function MultiItemAnalysis() {
  const [items, setItems] = useState<ContainerItem[]>([])
  const [shipping, setShipping] = useState<ShippingDetails>({
    shippingCostPerShipment: 0,
    customsFeesPerShipment: 0,
  })
  const [selectedBuyerType, setSelectedBuyerType] = useState<'bulk' | 'distributor' | 'retail'>('bulk');
  const productSummaryRef = useRef<HTMLDivElement>(null)
  const [cartonsToSell, setCartonsToSell] = useState<{ [key: string]: number }>({});

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      typeOfPackaging: '',
      productName: '',
      weightPerCarton: '',
      quantityPerPackage: '',
      packagesPerCarton: '',
      cartonsPerContainer: '',
      pricePerCarton: '',
      salesTaxPercentage: '',
      buyerType: 'bulk',
    }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<ContainerItem>) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const calculateAllCosts = () => {
    const totalItems = items.reduce((sum, item) =>
      sum + (parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)), 0
    )

    const updatedItems = items.map(item => ({
      ...item,
      results: calculateCosts(item, {
        ...shipping,
        shippingCostPerShipment: shipping.shippingCostPerShipment *
          ((parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)) / totalItems),
        customsFeesPerShipment: shipping.customsFeesPerShipment *
          ((parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)) / totalItems),
      })
    }));

    setItems(updatedItems)
  }

  const recalculateShippingCosts = () => {
    if (items.length === 0) return;

    const totalItems = items.reduce((sum, item) =>
      sum + (parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)), 0
    )

    const updatedItems = items.map(item => ({
      ...item,
      results: calculateCosts(item, {
        ...shipping,
        shippingCostPerShipment: shipping.shippingCostPerShipment *
          ((parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)) / totalItems),
        customsFeesPerShipment: shipping.customsFeesPerShipment *
          ((parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)) / totalItems),
      })
    }));

    setItems(updatedItems);
  }

  const handleExcelUpload = (uploadedItems: ContainerItem[]) => {
    setItems([...items, ...uploadedItems])
  }

  const getTotalCosts = () => {
    return items.reduce((totals, item) => {
      if (!item.results) return totals
      const sellingPrice = calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType);
      const profit = (sellingPrice - item.results.totalCostPerCarton) * (cartonsToSell[item.id] || 0);
      const itemWeight = parseFloat(item.weightPerCarton as string) * parseInt(item.cartonsPerContainer as string);
      return {
        totalProducts: totals.totalProducts + 1,
        totalItems: totals.totalItems + item.results.totalItemsPerContainer,
        totalCost: totals.totalCost + item.results.totalCostPerContainer,
        totalCostJOD: totals.totalCostJOD + item.results.totalCostPerContainerJOD,
        shippingCost: totals.shippingCost + (item.results.shippingCostPerItem * item.results.totalItemsPerContainer),
        customsFees: totals.customsFees + (item.results.customsFeesPerItem * item.results.totalItemsPerContainer),
        salesTax: totals.salesTax + (item.results.salesTaxPerItem * item.results.totalItemsPerContainer),
        totalProfit: totals.totalProfit + profit,
        totalWeight: totals.totalWeight + itemWeight,
        totalCartons: totals.totalCartons + parseInt(item.cartonsPerContainer as string),
        totalPackages: totals.totalPackages + (parseInt(item.packagesPerCarton as string) * parseInt(item.cartonsPerContainer as string)),
      }
    }, {
      totalProducts: 0,
      totalItems: 0,
      totalCost: 0,
      totalCostJOD: 0,
      shippingCost: 0,
      customsFees: 0,
      salesTax: 0,
      totalProfit: 0,
      totalWeight: 0,
      totalCartons: 0,
      totalPackages: 0,
    })
  }

  const printHeader = (printWindow: Window) => {
    printWindow.document.write(`
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ccc;">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rabsin%20logo-WkMxi91yvrgdWv766tzFg2GtZt2EBI.png" alt="Rabsin Logo" width="40" height="40" style="border-radius: 50%;" />
        <h1 style="font-size: 24px; font-weight: bold; color: #2D5744;">Rabsin</h1>
      </div>
    `);
  };

  const printProductSummary = () => {
    if (productSummaryRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Rabsin - Product Summary</title>');
        printWindow.document.write(`
          <style>
            body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.3; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals td { font-weight: bold; }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printHeader(printWindow);
        printWindow.document.write('<h2>Product Summary</h2>');

        const table = productSummaryRef.current.querySelector('table');
        if (table) {
          printWindow.document.write(table.outerHTML);
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const printProductDetails = (item: ContainerItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow && item.results) {
      const sellingPrice = calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType);
      const cartonsToSellCount = cartonsToSell[item.id] || 0;
      const profit = (sellingPrice - item.results.totalCostPerCarton) * cartonsToSellCount;

      printWindow.document.write('<html><head><title>Rabsin - Product Details</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
      printWindow.document.write('</head><body>');
      printHeader(printWindow);
      printWindow.document.write(`
        <h2>${item.productName}</h2>
        <p>Type of Packaging: ${item.typeOfPackaging}</p>
        <p>Weight per Carton: ${item.weightPerCarton} kg</p>
        <p>Total Weight per Product: ${(parseFloat(item.weightPerCarton as string) * parseInt(item.packagesPerCarton as string)).toFixed(2)} kg</p>
        <p>Quantity per Package: ${item.quantityPerPackage}</p>
        <p>Packages per Carton: ${item.packagesPerCarton}</p>
        <p>Cartons per Container: ${item.cartonsPerContainer}</p>
        <p>Price per Carton: $${item.pricePerCarton.toFixed(2)}</p>
        <h3>Results</h3>
        <p>Buyer Type: ${item.buyerType}</p>
        <p>Total Cartons: ${item.cartonsPerContainer}</p>
        <p>Available Cartons: ${item.cartonsPerContainer - cartonsToSellCount}</p>
        <p>Cartons to Sell: ${cartonsToSellCount}</p>
        <p>Cost per Carton: $${item.results.totalCostPerCarton.toFixed(2)} (JOD ${item.results.totalCostPerCartonJOD.toFixed(2)})</p>
        <p>Selling Price per Carton: $${sellingPrice.toFixed(2)} (JOD ${(sellingPrice * 0.71).toFixed(2)})</p>
        <p>Total Cost of Cartons to Sell: $${(item.results.totalCostPerCarton * cartonsToSellCount).toFixed(2)} (JOD ${(item.results.totalCostPerCartonJOD * cartonsToSellCount).toFixed(2)})</p>
        <p>Total Selling Price: $${(sellingPrice * cartonsToSellCount).toFixed(2)} (JOD ${(sellingPrice * cartonsToSell[item.id] * 0.71).toFixed(2)})</p>
        <p>Profit: $${profit.toFixed(2)} (JOD ${(profit * 0.71).toFixed(2)})</p>
      `);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  const printAllProducts = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Rabsin - All Products Details</title>');
      printWindow.document.write(`
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .product { margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          h1 { font-size: 18px; }
          h2 { font-size: 16px; }
          h3 { font-size: 14px; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printHeader(printWindow);
      printWindow.document.write('<h1>All Products in Container</h1>');
      items.forEach((item, index) => {
        if (item.results) {
          printWindow.document.write(`
            <div class="product">
              <h2>Product ${index + 1}: ${item.productName}</h2>
              <p>Type of Packaging: ${item.typeOfPackaging}</p>
              <p>Weight per Carton: ${item.weightPerCarton} kg</p>
              <p>Quantity per Package: ${item.quantityPerPackage}</p>
              <p>Packages per Carton: ${item.packagesPerCarton}</p>
              <p>Cartons per Container: ${item.cartonsPerContainer}</p>
              <p>Price per Carton: $${item.pricePerCarton.toFixed(2)}</p>
              <h3>Results</h3>
              <p>Total Items: ${item.results.totalItemsPerContainer.toLocaleString()}</p>
              <p>Total Weight: ${(parseFloat(item.weightPerCarton as string) * parseInt(item.cartonsPerContainer as string)).toFixed(2)} kg</p>
              <p>Cost per Item: $${item.results.totalCostPerItem.toFixed(4)} (JOD ${item.results.totalCostPerItemJOD.toFixed(4)})</p>
              <p>Total Cost: $${item.results.totalCostPerContainer.toFixed(2)} (JOD ${item.results.totalCostPerContainerJOD.toFixed(2)})</p>
            </div>
          `);
        }
      });
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  const printContainerSummary = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const totals = getTotalCosts();
      printWindow.document.write('<html><head><title>Rabsin - Container Summary</title>');
      printWindow.document.write(`
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          h1 { font-size: 18px; }
          .summary-item { margin-bottom: 5px; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printHeader(printWindow);
      printWindow.document.write('<h1>Container Summary</h1>');
      printWindow.document.write(`
        <div>
          <p class="summary-item"><strong>Total Products:</strong> ${totals.totalProducts}</p>
          <p class="summary-item"><strong>Total Cartons:</strong> ${totals.totalCartons}</p>
          <p class="summary-item"><strong>Total Packages:</strong> ${totals.totalPackages.toLocaleString()}</p>
          <p class="summary-item"><strong>Total Sticks:</strong> ${totals.totalItems.toLocaleString()}</p>
          <p class="summary-item"><strong>Total Container Weight:</strong> ${totals.totalWeight.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</p>
          <p class="summary-item"><strong>Total Shipping Cost:</strong> $${totals.shippingCost.toFixed(2)}</p>
          <p class="summary-item"><strong>Total Customs Fees:</strong> $${totals.customsFees.toFixed(2)}</p>
          <p class="summary-item"><strong>Total Sales Tax:</strong> $${totals.salesTax.toFixed(2)}</p>
          <p class="summary-item"><strong>Total Container Cost:</strong> $${totals.totalCost.toFixed(2)} (JOD ${totals.totalCostJOD.toFixed(2)})</p>
          <p class="summary-item"><strong>Total Container Profit:</strong> $${totals.totalProfit.toFixed(2)} (JOD ${(totals.totalProfit * 0.71).toFixed(2)})</p>
        </div>
      `);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

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

  const PRODUCT_OPTIONS = [
    "Luxury glass box (56 pieces)",
    "Economical wooden box (64 pieces)",
    "50-piece tea packs (100 grams)",
    "Tea in 15-piece packs (30 grams)",
    "Instant coffee (30 pieces, 60 grams)",
    "Instant coffee (15 pieces, 30 grams)",
    "500-piece tea"
  ]

  interface ContainerItem extends ProductDetails {
    id: string;
    weightPerCarton: number | '';
    quantityPerPackage: number | '';
    packagesPerCarton: number | '';
    cartonsPerContainer: number | '';
    pricePerCarton: number | '';
    salesTaxPercentage: number | '';
    buyerType: 'bulk' | 'distributor' | 'retail';
    results?: CalculationResults;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping & Customs Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shippingCost">Shipping Cost per Container ($)</Label>
              <Input
                id="shippingCost"
                type="number"
                step="0.01"
                value={shipping.shippingCostPerShipment || ''}
                onChange={(e) => setShipping({ ...shipping, shippingCostPerShipment: e.target.value ? parseFloat(e.target.value) : 0 })}
              />
            </div>
            <div>
              <Label htmlFor="customsFees">Customs Fees per Container ($)</Label>
              <Input
                id="customsFees"
                type="number"
                step="0.01"
                value={shipping.customsFeesPerShipment || ''}
                onChange={(e) => setShipping({ ...shipping, customsFeesPerShipment: e.target.value ? parseFloat(e.target.value) : 0 })}
              />
            </div>
            <Button 
              onClick={recalculateShippingCosts} 
              disabled={items.length === 0}
              className="w-full"
            >
              Recalculate Costs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ExcelUploader onUpload={handleExcelUpload} />
          </CardContent>
        </Card>

        {items.length > 0 && items.some(item => item.results) && (
          <Card>
            <CardHeader>
              <CardTitle>Container Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const totals = getTotalCosts()
                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Products:</span>
                      <span>{totals.totalProducts}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Cartons:</span>
                      <span>{totals.totalCartons}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Packages:</span>
                      <span>{totals.totalPackages.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Sticks:</span>
                      <span>{totals.totalItems.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Shipping Cost:</span>
                      <span>${totals.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Total Customs Fees:</span>
                      <span>${totals.customsFees.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <span className="font-bold">Total Container Cost:</span>
                      <span className="font-bold">
                        ${totals.totalCost.toFixed(2)}
                        <span className="text-gray-500 ml-2">JOD {totals.totalCostJOD.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">Total Container Profit:</span>
                      <span className="font-bold">
                        ${totals.totalProfit.toFixed(2)}
                        <span className="text-gray-500 ml-2">JOD {(totals.totalProfit * 0.71).toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">Total Container Weight:</span>
                      <span className="font-bold">{totals.totalWeight.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</span>
                    </div>
                  </div>
                )
              })()}
              <Button onClick={printContainerSummary} className="mt-4 w-full flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" />
                Print Container Summary
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {items.length > 0 && items.some(item => item.results) && (
        <div ref={productSummaryRef}>
          <ProductSummary items={items.filter(item => item.results !== undefined)} showSerialNumbers={true} />
        </div>
      )}

      <DocumentGenerator items={items} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Products in Container</h2>
          <div className="flex gap-2">
            <Button onClick={printAllProducts} className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print All Products
            </Button>
            <Button onClick={addItem} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        </div>

        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Product {index + 1}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => printProductDetails(item)}
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`productName-${item.id}`}>Product Name</Label>
                  <Select
                    value={item.productName}
                    onValueChange={(value) => updateItem(item.id, { productName: value })}
                  >
                    <SelectTrigger id={`productName-${item.id}`}>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`typeOfPackaging-${item.id}`}>Type of Packaging</Label>
                  <Input
                    id={`typeOfPackaging-${item.id}`}
                    value={item.typeOfPackaging || 'Carton'}
                    onChange={(e) => updateItem(item.id, { typeOfPackaging: e.target.value })}
                    placeholder="Carton"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`weightPerCarton-${item.id}`}>Weight per Carton (kg)</Label>
                  <Input
                    id={`weightPerCarton-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.weightPerCarton}
                    onChange={(e) => updateItem(item.id, { weightPerCarton: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor={`quantityPerPackage-${item.id}`}>Quantity of Sticks</Label>
                  <Input
                    id={`quantityPerPackage-${item.id}`}
                    type="number"
                    value={item.quantityPerPackage}
                    onChange={(e) => updateItem(item.id, { quantityPerPackage: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor={`packagesPerCarton-${item.id}`}>Packages per Carton</Label>
                  <Input
                    id={`packagesPerCarton-${item.id}`}
                    type="number"
                    value={item.packagesPerCarton}
                    onChange={(e) => updateItem(item.id, { packagesPerCarton: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor={`cartonsPerContainer-${item.id}`}>Cartons per Container</Label>
                  <Input
                    id={`cartonsPerContainer-${item.id}`}
                    type="number"
                    value={item.cartonsPerContainer}
                    onChange={(e) => updateItem(item.id, { cartonsPerContainer: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor={`pricePerCarton-${item.id}`}>Price per Carton ($)</Label>
                  <Input
                    id={`pricePerCarton-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.pricePerCarton}
                    onChange={(e) => updateItem(item.id, { pricePerCarton: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {item.results && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-semibold">Product Results</h3>
                  <div className="space-y-2">
                    <Label htmlFor={`buyerType-${item.id}`}>Buyer Type</Label>
                    <Select
                      value={item.buyerType}
                      onValueChange={(value: 'bulk' | 'distributor' | 'retail') => updateItem(item.id, { buyerType: value })}
                    >
                      <SelectTrigger id={`buyerType-${item.id}`}>
                        <SelectValue placeholder="Select buyer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulk">Bulk Trader Buyer</SelectItem>
                        <SelectItem value="distributor">Distributor Buyer</SelectItem>
                        <SelectItem value="retail">Retail Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cartonsToSell-${item.id}`}>Cartons to Sell</Label>
                    <Input
                      id={`cartonsToSell-${item.id}`}
                      type="number"
                      min="0"
                      max={parseInt(item.cartonsPerContainer as string)}
                      value={cartonsToSell[item.id] || 0}
                      onChange={(e) => setCartonsToSell({ ...cartonsToSell, [item.id]: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">USD</TableHead>
                        <TableHead className="text-right">JOD</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Cartons</TableCell>
                        <TableCell className="text-right" colSpan={2}>{item.cartonsPerContainer}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Weight</TableCell>
                        <TableCell className="text-right" colSpan={2}>{(parseFloat(item.weightPerCarton as string) * parseInt(item.cartonsPerContainer as string)).toFixed(2)} kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Available Cartons</TableCell>
                        <TableCell className="text-right" colSpan={2}>{parseInt(item.cartonsPerContainer as string) - (cartonsToSell[item.id] || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cartons to Sell</TableCell>
                        <TableCell className="text-right" colSpan={2}>{cartonsToSell[item.id] || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sell Price per Stick</TableCell>
                        <TableCell className="text-right">
                          ${(calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) / (parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string))).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {((calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) / (parseInt(item.quantityPerPackage as string) * parseInt(item.packagesPerCarton as string))) * 0.71).toFixed(4)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cost per Stick</TableCell>
                        <TableCell className="text-right">${item.results.totalCostPerItem.toFixed(4)}</TableCell>
                        <TableCell className="text-right">JOD {item.results.totalCostPerItemJOD.toFixed(4)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sell Per Carton</TableCell>
                        <TableCell className="text-right">
                          ${calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {(calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) * 0.71).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cost Per Carton</TableCell>
                        <TableCell className="text-right">${item.results.totalCostPerCarton.toFixed(2)}</TableCell>
                        <TableCell className="text-right">JOD {item.results.totalCostPerCartonJOD.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cost Per Package</TableCell>
                        <TableCell className="text-right">
                          ${item.results ? (item.results.totalCostPerCarton / parseInt(item.packagesPerCarton as string)).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {item.results ? ((item.results.totalCostPerCarton / parseInt(item.packagesPerCarton as string)) * 0.71).toFixed(2):'0.00'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sell Per Package</TableCell>
                        <TableCell className="text-right">
                          ${item.results ? (calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) / parseInt(item.packagesPerCarton as string)).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {item.results ? ((calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) / parseInt(item.packagesPerCarton as string)) *0.71).toFixed(2) : '0.00'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Selling Price</TableCell>
                        <TableCell className="text-right">
                          ${(calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) * (cartonsToSell[item.id] || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {(calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) * (cartonsToSell[item.id] || 0) * 0.71).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Profit</TableCell>
                        <TableCell className="text-right">
                          ${((calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) - item.results.totalCostPerCarton) * (cartonsToSell[item.id] || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          JOD {((calculateSellingPrice(item.results.totalCostPerCarton, item.buyerType) - item.results.totalCostPerCarton) * (cartonsToSell[item.id] || 0) * 0.71).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {items.length > 0 && (
          <Button onClick={calculateAllCosts} className="w-full">
            Calculate All Costs
          </Button>
        )}
      </div>
    </div>
  )
}

export default MultiItemAnalysis;

