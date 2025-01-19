import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CostAnalysisResultsProps {
  results: {
    costPerCarton: string;
    totalCostPerCarton: string;
    costPerItemWithShipping: string;
    salesTaxPerItem: string;
    totalCostPerItem: string;
  };
}

export function CostAnalysisResults({ results }: CostAnalysisResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>Cost per Carton: ${results.costPerCarton}</li>
          <li>Total Cost per Carton (including shipping and customs): ${results.totalCostPerCarton}</li>
          <li>Cost per Item (including shipping and customs): ${results.costPerItemWithShipping}</li>
          <li>Sales Tax per Item: ${results.salesTaxPerItem}</li>
          <li>Total Cost per Item: ${results.totalCostPerItem}</li>
        </ul>
      </CardContent>
    </Card>
  );
}

