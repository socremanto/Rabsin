'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContainerItem } from '../utils/types'

interface ExcelUploaderProps {
  onUpload: (items: ContainerItem[]) => void
}

export function ExcelUploader({ onUpload }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const items: ContainerItem[] = jsonData.map((row: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      typeOfPackaging: row['Type of Packaging'] || '',
      productName: row['Product Name'] || '',
      weightPerCarton: row['Weight per Carton (kg)'] || '',
      quantityPerPackage: row['Quantity of Sticks'] || '',
      packagesPerCarton: row['Packages per Carton'] || '',
      cartonsPerContainer: row['Cartons per Container'] || '',
      pricePerCarton: row['Price per Carton ($)'] || '',
      salesTaxPercentage: row['Sales Tax (%)'] || '',
      buyerType: 'bulk', // Default to bulk buyer type
    }))

    onUpload(items)
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="max-w-xs"
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload Products
      </Button>
    </div>
  )
}

