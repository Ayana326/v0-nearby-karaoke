"use client"

import { useState, useRef, useEffect } from "react"
import { useKaraoke } from "./karaoke-provider"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PriceCalculator from "./price-calculator"
import KaraokeList from "./karaoke-list"
import SimpleMap from "./simple-map"

export default function KaraokeMap() {
  const { userLocation, loading, error, sortBy, setSortBy } = useKaraoke()
  const [activeTab, setActiveTab] = useState("map")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 600 })

  // Update map dimensions when container size changes
  useEffect(() => {
    if (!mapContainerRef.current) return

    const updateDimensions = () => {
      if (mapContainerRef.current) {
        setMapDimensions({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight,
        })
      }
    }

    // Initial update
    updateDimensions()

    // Add resize observer
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
        <p className="text-lg">位置情報を取得中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">エラー</p>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            再試行
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-bold mb-2">最寄りのカラオケ店を探す</h2>
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant={sortBy === "distance" ? "default" : "outline"}
            onClick={() => setSortBy("distance")}
            className="flex-1"
          >
            距離順
          </Button>
          <Button
            variant={sortBy === "price" ? "default" : "outline"}
            onClick={() => setSortBy("price")}
            className="flex-1"
          >
            基本料金順
          </Button>
          <Button
            variant={sortBy === "calculatedPrice" ? "default" : "outline"}
            onClick={() => setSortBy("calculatedPrice")}
            className="flex-1"
          >
            総額順
          </Button>
        </div>

        {/* 料金計算フォームを追加 */}
        <PriceCalculator />
      </div>

      <Tabs defaultValue="map" className="flex-1" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="map">地図表示</TabsTrigger>
          <TabsTrigger value="list">リスト表示</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="h-full">
          <div ref={mapContainerRef} className="h-full rounded-lg overflow-hidden border">
            <SimpleMap width={mapDimensions.width} height={mapDimensions.height} />
          </div>
        </TabsContent>
        <TabsContent value="list" className="h-full overflow-auto">
          <KaraokeList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
