import { TeaProduct, calculateTotalCost, calculateCostPerItem } from '../utils/dataProcessing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryStatisticsProps {
  products: TeaProduct[];
}

export function SummaryStatistics({ products }: SummaryStatisticsProps) {
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, product) => sum + product.totalItems, 0);
  const totalCost = products.reduce((sum, product) => sum + calculateTotalCost(product), 0);
  const averageCostPerItem = totalCost / totalItems;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Cost Per Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averageCostPerItem.toFixed(4)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

