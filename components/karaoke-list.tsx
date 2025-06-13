"use client"

import { useState } from "react"
import { type KaraokePlace, useKaraoke } from "./karaoke-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, Ticket } from "lucide-react"

export default function KaraokeList() {
  const { karaokePlaces, selectedPlace, setSelectedPlace, sortBy, stayDuration, isStudent, isWeekend } = useKaraoke()
  const [expandedId, setExpandedId] = useState<string | null>(selectedPlace?.id || null)

  // 並び替え
  const sortedPlaces = [...karaokePlaces].sort((a, b) => {
    if (sortBy === "distance") {
      return (a.distance || 0) - (b.distance || 0)
    } else if (sortBy === "price") {
      return a.price - b.price
    } else {
      // calculatedPrice でソート
      return (a.calculatedPrice || 0) - (b.calculatedPrice || 0)
    }
  })

  const handleCardClick = (place: KaraokePlace) => {
    setSelectedPlace(place)
    setExpandedId(expandedId === place.id ? null : place.id)
  }

  return (
    <div className="space-y-4">
      {sortedPlaces.map((place) => (
        <Card
          key={place.id}
          className={`cursor-pointer transition-all ${expandedId === place.id ? "border-purple-500 shadow-md" : ""}`}
          onClick={() => handleCardClick(place)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{place.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {place.address}
                </CardDescription>
              </div>
              <Badge variant={place.openNow ? "default" : "outline"} className={place.openNow ? "bg-green-500" : ""}>
                {place.openNow ? "営業中" : "営業時間外"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{place.rating}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-purple-600">{place.price}円</span>
                <span className="text-sm text-gray-500">/30分</span>
              </div>
            </div>

            {/* 計算された料金情報を表示 */}
            {place.calculatedPrice && (
              <div className="mt-2 p-2 bg-purple-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Ticket className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm">
                      {formatDuration(stayDuration)}
                      {isStudent && "（学割適用）"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">{place.calculatedPrice}円</span>
                    <span className="text-xs text-gray-500 ml-1">{isWeekend ? "(休日)" : "(平日)"}</span>
                  </div>
                </div>
                {isStudent && (
                  <div className="text-xs text-gray-600 mt-1">
                    学割: {Math.round(place.studentDiscountRate * 100)}%オフ
                  </div>
                )}
                {place.freeTimePriceWeekday !== null && (
                  <div className="text-xs text-gray-600 mt-1">
                    フリータイム: {isWeekend ? place.freeTimePriceWeekend : place.freeTimePriceWeekday}円
                  </div>
                )}
              </div>
            )}

            {place.distance && (
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                現在地から約{place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
              </div>
            )}
          </CardContent>
          {expandedId === place.id && (
            <CardFooter className="flex-col items-start pt-0">
              <div className="w-full border-t my-2"></div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" size="sm" className="w-full">
                  電話する
                </Button>
                <Button size="sm" className="w-full">
                  予約する
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}

// 時間を「時間:分」形式で表示する関数
function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}時間${mins > 0 ? ` ${mins}分` : ""}`
}
