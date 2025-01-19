import { MultiItemAnalysis } from '../components/MultiItemAnalysis'
import { Header } from '../components/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto p-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Container Cost Analysis</h2>
        <MultiItemAnalysis />
      </main>
    </>
  )
}

