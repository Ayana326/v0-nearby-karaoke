"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Icon } from "leaflet"
import { useKaraoke } from "./karaoke-provider"
import KaraokeList from "./karaoke-list"
import { Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PriceCalculator from "./price-calculator"

import "leaflet/dist/leaflet.css"

// マーカーアイコンの設定
const userIcon = new Icon({
  iconUrl: "/placeholder.svg?height=41&width=41",
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const karaokeIcon = new Icon({
  iconUrl: "/placeholder.svg?height=25&width=25",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [1, -20],
})

// マップの中心を現在地に設定するコンポーネント
function SetViewOnUserLocation({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, 15)
  }, [coords, map])
  return null
}

export default function KaraokeMap() {
  const { userLocation, karaokePlaces, loading, error, selectedPlace, setSelectedPlace, sortBy, setSortBy } =
    useKaraoke()
  const [activeTab, setActiveTab] = useState("map")

  // 地図の初期設定
  const defaultCenter: [number, number] = [35.658034, 139.701636] // 渋谷駅
  const mapCenter = userLocation || defaultCenter

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
          <div className="h-full rounded-lg overflow-hidden border">
            <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation && (
                <>
                  <SetViewOnUserLocation coords={userLocation} />
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                      <div className="text-center">
                        <MapPin className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <strong>現在地</strong>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {karaokePlaces.map((place) => (
                <Marker
                  key={place.id}
                  position={place.position}
                  icon={karaokeIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedPlace(place)
                    },
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-bold">{place.name}</h3>
                      <p className="text-gray-600">{place.address}</p>
                      <p className="mt-1">
                        <span className="font-bold text-purple-600">{place.price}円</span>/30分
                      </p>
                      {place.calculatedPrice && (
                        <p className="mt-1">
                          <span className="font-bold text-green-600">{place.calculatedPrice}円</span>
                          <span className="text-xs"> (総額)</span>
                        </p>
                      )}
                      {place.distance && (
                        <p className="text-gray-600">
                          現在地から約
                          {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
                        </p>
                      )}
                      <div className="mt-2">
                        <Button size="sm" className="w-full" onClick={() => setActiveTab("list")}>
                          詳細を見る
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </TabsContent>
        <TabsContent value="list" className="h-full overflow-auto">
          <KaraokeList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
