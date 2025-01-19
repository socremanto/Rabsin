export interface ProductDetails {
  typeOfPackaging: string;
  productName: string;
  weightPerCarton: number;
  quantityPerPackage: number;
  packagesPerCarton: number;
  cartonsPerContainer: number;
  pricePerCarton: number;
}

export interface ShippingDetails {
  shippingCostPerShipment: number;
  customsFeesPerShipment: number;
  salesTaxPercentage: number;
}

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
}

export interface ContainerItem extends ProductDetails {
  id: string;
  results?: CalculationResults;
}

