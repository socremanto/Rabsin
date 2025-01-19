import Papa from 'papaparse';

export interface TeaProduct {
  name: string;
  type: string;
  totalItems: number;
  costPerProduct: number;
  shippingAndCustoms: number;
}

export async function fetchAndProcessData(): Promise<TeaProduct[]> {
  const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Corrected_Total_Items_and_Cost_per_Product_Analysis%20(1)-QphuAFJ28Yp1jt5KCnF98AKGvp3VZG.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData: TeaProduct[] = results.data.map((row: any) => ({
          name: row['Product Name'] || '',
          type: row['Type'] || '',
          totalItems: parseInt(row['Total Items'] || '0', 10),
          costPerProduct: parseFloat(row['Cost Per Product'] || '0'),
          shippingAndCustoms: parseFloat(row['Shipping Cost & Customs'] || '0'),
        }));
        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function calculateTotalCost(product: TeaProduct): number {
  return product.totalItems * product.costPerProduct + product.shippingAndCustoms;
}

export function calculateCostPerItem(product: TeaProduct): number {
  return (calculateTotalCost(product) / product.totalItems);
}

