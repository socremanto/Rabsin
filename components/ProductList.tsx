import { useState } from 'react';
import { TeaProduct, calculateTotalCost, calculateCostPerItem } from '../utils/dataProcessing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface ProductListProps {
  products: TeaProduct[];
}

export function ProductList({ products }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total Items</TableHead>
            <TableHead>Cost Per Product</TableHead>
            <TableHead>Shipping & Customs</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Cost Per Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product, index) => (
            <TableRow key={index}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.type}</TableCell>
              <TableCell>{product.totalItems.toLocaleString()}</TableCell>
              <TableCell>${product.costPerProduct.toFixed(2)}</TableCell>
              <TableCell>${product.shippingAndCustoms.toLocaleString()}</TableCell>
              <TableCell>${calculateTotalCost(product).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell>${calculateCostPerItem(product).toFixed(4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

