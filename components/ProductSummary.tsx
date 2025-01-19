import { useRef } from 'react'
import { ContainerItem } from '../utils/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface ProductSummaryProps {
  items: ContainerItem[]
  showSerialNumbers?: boolean
}

export function ProductSummary({ items, showSerialNumbers = false }: ProductSummaryProps) {
  const tableRef = useRef<HTMLTableElement>(null)

  const calculateGrandTotals = () => {
    return items.reduce((totals, item) => {
      if (!item.results) return totals;
      const totalSticks = item.quantityPerPackage * item.packagesPerCarton * item.cartonsPerContainer;
      const totalWeight = item.weightPerCarton * item.cartonsPerContainer;
      return {
        totalSticks: totals.totalSticks + totalSticks,
        totalCartons: totals.totalCartons + item.cartonsPerContainer,
        totalPackages: totals.totalPackages + (item.packagesPerCarton * item.cartonsPerContainer),
        totalWeight: totals.totalWeight + totalWeight,
        totalCost: totals.totalCost + item.results.totalCostPerContainer,
      };
    }, {
      totalSticks: 0,
      totalCartons: 0,
      totalPackages: 0,
      totalWeight: 0,
      totalCost: 0,
    });
  };

  const grandTotals = calculateGrandTotals();

  const printProductSummary = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && tableRef.current) {
      printWindow.document.write('<html><head><title>Rabsin - Product Summary</title>');
      printWindow.document.write(`
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { display: flex; align-items: center; margin-bottom: 20px; }
          .header img { width: 50px; height: 50px; margin-right: 10px; }
          .header h1 { margin: 0; color: #2D5744; }
          .grand-total { font-weight: bold; background-color: #e6f3ff; }
          .jod-amount { color: #666; font-size: 0.9em; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      
      // Add header with logo
      printWindow.document.write(`
        <div class="header">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rabsin%20logo-WkMxi91yvrgdWv766tzFg2GtZt2EBI.png" alt="Rabsin Logo" />
          <h1>Rabsin Product Summary</h1>
        </div>
      `);

      // Add the table
      printWindow.document.write(tableRef.current.outerHTML);

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Product Summary</CardTitle>
        <Button onClick={printProductSummary} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Summary
        </Button>
      </CardHeader>
      <CardContent>
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              {showSerialNumbers && <TableHead>No.</TableHead>}
              <TableHead>Product Name</TableHead>
              <TableHead>Total Sticks</TableHead>
              <TableHead>Total Cartons</TableHead>
              <TableHead>Packages Per Carton</TableHead>
              <TableHead>Total Weight (Kg)</TableHead>
              <TableHead>Price per Carton</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Cost per Stick</TableHead>
              <TableHead>Cost per Package</TableHead>
              <TableHead>% Of Container Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              if (!item.results) return null;
              const totalSticks = item.quantityPerPackage * item.packagesPerCarton * item.cartonsPerContainer;
              const totalWeight = item.weightPerCarton * item.cartonsPerContainer;
              const totalCost = item.results.totalCostPerContainer;
              const costPerStick = totalCost / totalSticks;
              const costPerPackage = totalCost / (item.packagesPerCarton * item.cartonsPerContainer);
              const containerCost = items.reduce((acc, i) => acc + (i.results ? i.results.totalCostPerContainer : 0), 0);
              const percentOfContainerCost = (totalCost / containerCost) * 100;

              return (
                <TableRow key={index}>
                  {showSerialNumbers && <TableCell>{index + 1}</TableCell>}
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{totalSticks.toLocaleString()}</TableCell>
                  <TableCell>{item.cartonsPerContainer}</TableCell>
                  <TableCell>{item.packagesPerCarton}</TableCell>
                  <TableCell>{totalWeight.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell>
                    ${item.results.totalCostPerCarton.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    <br />
                    <span className="text-gray-500 text-sm">{(item.results.totalCostPerCarton * 0.71).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})}</span>
                  </TableCell>
                  <TableCell>
                    ${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    <br />
                    <span className="text-gray-500 text-sm">{(totalCost * 0.71).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})}</span>
                  </TableCell>
                  <TableCell>
                    ${costPerStick.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}
                    <br />
                    <span className="text-gray-500 text-sm">{(costPerStick * 0.71).toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5})}</span>
                  </TableCell>
                  <TableCell>
                    ${costPerPackage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    <br />
                    <span className="text-gray-500 text-sm">{(costPerPackage * 0.71).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})}</span>
                  </TableCell>
                  <TableCell>{percentOfContainerCost.toFixed(2)}%</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-bold bg-muted">
              <TableCell colSpan={showSerialNumbers ? 2 : 1}>Grand Totals</TableCell>
              <TableCell className="font-bold">{grandTotals.totalSticks.toLocaleString()}</TableCell>
              <TableCell className="font-bold">{grandTotals.totalCartons.toLocaleString()}</TableCell>
              <TableCell className="font-bold">{grandTotals.totalPackages.toLocaleString()}</TableCell>
              <TableCell className="font-bold">{grandTotals.totalWeight.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              <TableCell className="font-bold">-</TableCell>
              <TableCell>
                <span className="font-bold">${grandTotals.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <br />
                <span className="text-gray-500 text-sm font-bold">{(grandTotals.totalCost * 0.71).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})}</span>
              </TableCell>
              <TableCell className="font-bold">-</TableCell>
              <TableCell className="font-bold">-</TableCell>
              <TableCell className="font-bold">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ProductSummary;

