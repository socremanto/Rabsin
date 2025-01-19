const USD_TO_JOD_RATE = 0.710;

import { ProductDetails, ShippingDetails, CalculationResults } from './types';

export interface CalculationResults {
  totalItemsPerCarton: number;
  totalItemsPerContainer: number;
  costPerItem: number;
  shippingCostPerItem: number;
  customsFeesPerItem: number;
  salesTaxPerItem: number;
  totalCostPerItem: number;
  totalCostPerCarton: number;
  totalCostPerContainer: number;
  totalCostPerItemJOD: number;
  totalCostPerCartonJOD: number;
  totalCostPerContainerJOD: number;
}

export function calculateCosts(
  product: ProductDetails,
  shipping: ShippingDetails
): CalculationResults {
  // Calculate total items
  const totalItemsPerCarton = product.quantityPerPackage * product.packagesPerCarton;
  const totalItemsPerContainer = totalItemsPerCarton * product.cartonsPerContainer;

  // Calculate base costs
  const costPerItem = product.pricePerCarton / totalItemsPerCarton;
  
  // Calculate shipping and customs per item
  const shippingCostPerItem = shipping.shippingCostPerShipment / totalItemsPerContainer;
  const customsFeesPerItem = shipping.customsFeesPerShipment / totalItemsPerContainer;
  
  // Calculate sales tax (only on product cost, not shipping or customs)
  const salesTaxPerItem = costPerItem * (product.salesTaxPercentage / 100);

  // Calculate total cost per item
  const totalCostPerItem = costPerItem + shippingCostPerItem + customsFeesPerItem + salesTaxPerItem;

  // Calculate total costs per carton and container
  const totalCostPerCarton = totalCostPerItem * totalItemsPerCarton;
  const totalCostPerContainer = totalCostPerItem * totalItemsPerContainer;

  // Calculate JOD prices
  const totalCostPerItemJOD = totalCostPerItem * USD_TO_JOD_RATE;
  const totalCostPerCartonJOD = totalCostPerCarton * USD_TO_JOD_RATE;
  const totalCostPerContainerJOD = totalCostPerContainer * USD_TO_JOD_RATE;

  return {
    totalItemsPerCarton,
    totalItemsPerContainer,
    costPerItem,
    shippingCostPerItem,
    customsFeesPerItem,
    salesTaxPerItem,
    totalCostPerItem,
    totalCostPerCarton,
    totalCostPerContainer,
    totalCostPerItemJOD,
    totalCostPerCartonJOD,
    totalCostPerContainerJOD,
  };
}

