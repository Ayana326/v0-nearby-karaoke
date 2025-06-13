"use client"

import { useState, useRef, useEffect } from "react"
import { useKaraoke } from "./karaoke-provider"
import { MapPin, Navigation } from "lucide-react"

interface SimpleMapProps {
  width: number
  height: number
}

export default function SimpleMap({ width, height }: SimpleMapProps) {
  const { userLocation, karaokePlaces, selectedPlace, setSelectedPlace } = useKaraoke()
  const mapRef = useRef<HTMLDivElement>(null)
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null)

  // Calculate relative positions based on user location
  const calculatePositions = () => {
    if (!userLocation || !mapRef.current) return {}

    const [userLat, userLng] = userLocation
    const mapWidth = mapRef.current.clientWidth
    const mapHeight = mapRef.current.clientHeight
    const padding = 50 // Padding from edges

    // Find min/max coordinates to determine map bounds
    let minLat = userLat
    let maxLat = userLat
    let minLng = userLng
    let maxLng = userLng

    karaokePlaces.forEach((place) => {
      const [lat, lng] = place.position
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
    })

    // Add some padding to bounds
    const latPadding = (maxLat - minLat) * 0.2 || 0.005
    const lngPadding = (maxLng - minLng) * 0.2 || 0.005

    minLat -= latPadding
    maxLat += latPadding
    minLng -= lngPadding
    maxLng += lngPadding

    const latRange = maxLat - minLat
    const lngRange = maxLng - minLng

    // Calculate positions for each place
    const positions: Record<string, { x: number; y: number }> = {}

    // Position for user
    positions["user"] = {
      x: ((userLng - minLng) / lngRange) * (mapWidth - padding * 2) + padding,
      y: ((maxLat - userLat) / latRange) * (mapHeight - padding * 2) + padding,
    }

    // Positions for karaoke places
    karaokePlaces.forEach((place) => {
      const [lat, lng] = place.position
      positions[place.id] = {
        x: ((lng - minLng) / lngRange) * (mapWidth - padding * 2) + padding,
        y: ((maxLat - lat) / latRange) * (mapHeight - padding * 2) + padding,
      }
    })

    return positions
  }

  const positions = calculatePositions()

  // Recalculate positions when window resizes
  useEffect(() => {
    const handleResize = () => {
      calculatePositions()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [userLocation, karaokePlaces])

  // Get price color based on calculated price
  const getPriceColor = (place: (typeof karaokePlaces)[0]) => {
    if (!place.calculatedPrice) return "text-purple-600"

    const prices = karaokePlaces.filter((p) => p.calculatedPrice).map((p) => p.calculatedPrice as number)

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice

    if (place.calculatedPrice === minPrice) return "text-green-600"
    if (range === 0) return "text-purple-600"

    const ratio = (place.calculatedPrice - minPrice) / range
    if (ratio < 0.33) return "text-green-500"
    if (ratio < 0.66) return "text-yellow-500"
    return "text-red-500"
  }

  if (!positions || Object.keys(positions).length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p>マップデータを読み込み中...</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full bg-blue-50 rounded-lg overflow-hidden"
      style={{ width, height }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array(16)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border border-blue-100"></div>
          ))}
      </div>

      {/* User location */}
      {positions["user"] && (
        <div
          className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: positions["user"].x,
            top: positions["user"].y,
          }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center animate-pulse">
            <Navigation className="h-3 w-3 text-white" />
          </div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
            現在地
          </div>
        </div>
      )}

      {/* Karaoke places */}
      {karaokePlaces.map((place) => {
        if (!positions[place.id]) return null

        const isSelected = selectedPlace?.id === place.id
        const isHovered = hoveredPlace === place.id
        const priceColor = getPriceColor(place)

        return (
          <div
            key={place.id}
            className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all duration-200 ${isSelected || isHovered ? "z-30 scale-110" : ""}`}
            style={{
              left: positions[place.id].x,
              top: positions[place.id].y,
            }}
            onClick={() => setSelectedPlace(place)}
            onMouseEnter={() => setHoveredPlace(place.id)}
            onMouseLeave={() => setHoveredPlace(null)}
          >
            <div
              className={`w-6 h-6 rounded-full ${isSelected ? "bg-purple-600" : "bg-white"} border-2 border-purple-600 flex items-center justify-center`}
            >
              <MapPin className={`h-3 w-3 ${isSelected ? "text-white" : "text-purple-600"}`} />
            </div>

            {(isSelected || isHovered) && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs z-40 w-48">
                <p className="font-bold text-sm truncate">{place.name}</p>
                <p className="text-gray-600 truncate">{place.address}</p>
                <div className="flex justify-between mt-1">
                  <span>{place.price}円/30分</span>
                  {place.calculatedPrice && <span className={priceColor}>{place.calculatedPrice}円</span>}
                </div>
                {place.distance && (
                  <p className="text-gray-600 mt-1">
                    約{place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Distance lines from user to places */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {karaokePlaces.map((place) => {
          if (!positions[place.id] || !positions["user"]) return null

          const isSelected = selectedPlace?.id === place.id
          const isHovered = hoveredPlace === place.id

          return (
            <line
              key={place.id}
              x1={positions["user"].x}
              y1={positions["user"].y}
              x2={positions[place.id].x}
              y2={positions[place.id].y}
              stroke={isSelected || isHovered ? "#9333ea" : "#e2e8f0"}
              strokeWidth={isSelected || isHovered ? 2 : 1}
              strokeDasharray={isSelected || isHovered ? "" : "4,4"}
            />
          )
        })}
      </svg>

      {/* Map legend */}
      <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white mr-1"></div>
          <span>現在地</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-purple-600 mr-1"></div>
          <span>カラオケ店</span>
        </div>
      </div>
    </div>
  )
}
