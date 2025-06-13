import KaraokeMap from "@/components/karaoke-map"
import { KaraokeProvider } from "@/components/karaoke-provider"

export default function Home() {
  return (
    <KaraokeProvider>
      <div className="flex flex-col min-h-screen">
        <header className="bg-purple-700 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">カラオケファインダー</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4">
          <KaraokeMap />
        </main>
        <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} カラオケファインダー</p>
        </footer>
      </div>
    </KaraokeProvider>
  )
}
