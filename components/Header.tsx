import Image from 'next/image'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rabsin%20logo-WkMxi91yvrgdWv766tzFg2GtZt2EBI.png"
            alt="Rabsin Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-[#2D5744]">Rabsin</h1>
        </div>
      </div>
    </header>
  )
}

