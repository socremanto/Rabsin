'use client'

import { useState } from 'react'
import { ProductDetails, ShippingDetails, CalculationResults } from '../utils/types'
import { calculateCosts } from '../utils/calculations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CostAnalysisForm() {
  const [product, setProduct] = useState<ProductDetails>({
    typeOfPackaging: '',
    productName: '',
    weightPerCarton: 0,
    quantityPerPackage: 0,
    packagesPerCarton: 0,
    cartonsPerContainer: 0,
    pricePerCarton: 0,
  })

  const [shipping, setShipping] = useState<ShippingDetails>({
    shippingCostPerShipment: 0,
    customsFeesPerShipment: 0,
    salesTaxPercentage: 0,
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const calculatedResults = calculateCosts(product, shipping)
    setResults(calculatedResults)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="typeOfPackaging">Type of Packaging</Label>
                <Input
                  id="typeOfPackaging"
                  value={product.typeOfPackaging}
                  onChange={(e) => setProduct({ ...product, typeOfPackaging: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Select
                  value={product.productName}
                  onValueChange={(value) => setProduct({ ...product, productName: value })}
                >
                  <SelectTrigger id="productName">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Luxury glass box (56 pieces)">Luxury glass box (56 pieces)</SelectItem>
                    <SelectItem value="Economical wooden box (64 pieces)">Economical wooden box (64 pieces)</SelectItem>
                    <SelectItem value="50-piece tea packs (100 grams)">50-piece tea packs (100 grams)</SelectItem>
                    <SelectItem value="Tea in 15-piece packs (30 grams)">Tea in 15-piece packs (30 grams)</SelectItem>
                    <SelectItem value="Instant coffee (30 pieces, 60 grams)">Instant coffee (30 pieces, 60 grams)</SelectItem>
                    <SelectItem value="Instant coffee (15 pieces, 30 grams)">Instant coffee (15 pieces, 30 grams)</SelectItem>
                    <SelectItem value="500-piece tea">500-piece tea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weightPerCarton">Weight per Carton (kg)</Label>
                <Input
                  id="weightPerCarton"
                  type="number"
                  step="0.01"
                  value={product.weightPerCarton}
                  onChange={(e) => setProduct({ ...product, weightPerCarton: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantityPerPackage">Quantity per Package</Label>
                <Input
                  id="quantityPerPackage"
                  type="number"
                  value={product.quantityPerPackage}
                  onChange={(e) => setProduct({ ...product, quantityPerPackage: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="packagesPerCarton">Number of Packages per Carton</Label>
                <Input
                  id="packagesPerCarton"
                  type="number"
                  value={product.packagesPerCarton}
                  onChange={(e) => setProduct({ ...product, packagesPerCarton: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cartonsPerContainer">Number of Cartons per Container</Label>
                <Input
                  id="cartonsPerContainer"
                  type="number"
                  value={product.cartonsPerContainer}
                  onChange={(e) => setProduct({ ...product, cartonsPerContainer: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePerCarton">Price per Carton ($)</Label>
                <Input
                  id="pricePerCarton"
                  type="number"
                  step="0.01"
                  value={product.pricePerCarton}
                  onChange={(e) => setProduct({ ...product, pricePerCarton: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="shippingCost">Shipping Cost per Shipment ($)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  value={shipping.shippingCostPerShipment}
                  onChange={(e) => setShipping({ ...shipping, shippingCostPerShipment: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customsFees">Customs Fees per Shipment ($)</Label>
                <Input
                  id="customsFees"
                  type="number"
                  step="0.01"
                  value={shipping.customsFeesPerShipment}
                  onChange={(e) => setShipping({ ...shipping, customsFeesPerShipment: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="salesTax">Sales Tax (%)</Label>
                <Input
                  id="salesTax"
                  type="number"
                  step="0.01"
                  value={shipping.salesTaxPercentage}
                  onChange={(e) => setShipping({ ...shipping, salesTaxPercentage: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Calculate Costs</Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Total Items per Carton:</span>
                <span>{results.totalItemsPerCarton.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Total Items per Container:</span>
                <span>{results.totalItemsPerContainer.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Base Cost per Item:</span>
                <span>${results.costPerItem.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Shipping Cost per Item:</span>
                <span>${results.shippingCostPerItem.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Customs Fees per Item:</span>
                <span>${results.customsFeesPerItem.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Sales Tax per Item:</span>
                <span>${results.salesTaxPerItem.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <span className="font-bold">Total Cost per Item:</span>
                <span className="font-bold">${results.totalCostPerItem.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Total Cost per Carton:</span>
                <span className="font-bold">${results.totalCostPerCarton.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold">Total Cost per Container:</span>
                <span className="font-bold">${results.totalCostPerContainer.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

