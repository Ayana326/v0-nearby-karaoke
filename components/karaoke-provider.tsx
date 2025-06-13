"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

// カラオケ店の型定義
export type KaraokePlace = {
  id: string
  name: string
  address: string
  price: number // 30分あたりの基本料金（一般料金）
  memberDiscountRate: number // 会員割引率（0.0～1.0）
  freeTimePriceWeekday: number | null // 平日フリータイム料金（nullの場合はフリータイムなし）
  freeTimePriceWeekend: number | null // 休日フリータイム料金（nullの場合はフリータイムなし）
  studentDiscountRate: number // 学割割引率（0.0～1.0）
  distance?: number // メートル単位
  walkingTime?: number // 徒歩時間（分）
  position: [number, number] // [緯度, 経度]
  rating: number
  openNow: boolean
  calculatedPrices?: {
    regular: number // 一般料金
    student: number // 学生料金
    member: number // 会員料金
  }
}

// モックデータ（実際のアプリではAPIから取得）
const mockKaraokePlaces: KaraokePlace[] = [
  {
    id: "1",
    name: "カラオケ ビッグエコー 渋谷センター街店",
    address: "東京都渋谷区宇田川町25-5",
    price: 400, // 30分あたり
    memberDiscountRate: 0.1, // 会員10%オフ
    freeTimePriceWeekday: 1500, // 平日フリータイム
    freeTimePriceWeekend: 2000, // 休日フリータイム
    studentDiscountRate: 0.2, // 学割20%オフ
    position: [35.660232, 139.698152],
    rating: 4.2,
    openNow: true,
  },
  {
    id: "2",
    name: "カラオケ館 渋谷本店",
    address: "東京都渋谷区宇田川町23-4",
    price: 350,
    memberDiscountRate: 0.15, // 会員15%オフ
    freeTimePriceWeekday: 1400,
    freeTimePriceWeekend: 1900,
    studentDiscountRate: 0.3, // 学割30%オフ
    position: [35.661301, 139.697753],
    rating: 4.0,
    openNow: true,
  },
  {
    id: "3",
    name: "カラオケの鉄人 渋谷道玄坂店",
    address: "東京都渋谷区道玄坂2-29-8",
    price: 300,
    memberDiscountRate: 0.2, // 会員20%オフ
    freeTimePriceWeekday: 1300,
    freeTimePriceWeekend: 1800,
    studentDiscountRate: 0.2,
    position: [35.659069, 139.696512],
    rating: 4.3,
    openNow: true,
  },
  {
    id: "4",
    name: "ジョイカラ 渋谷店",
    address: "東京都渋谷区宇田川町36-6",
    price: 450,
    memberDiscountRate: 0.05, // 会員5%オフ
    freeTimePriceWeekday: 1600,
    freeTimePriceWeekend: 2200,
    studentDiscountRate: 0.1, // 学割10%オフ
    position: [35.662432, 139.695872],
    rating: 3.9,
    openNow: false,
  },
  {
    id: "5",
    name: "カラオケパセラ 渋谷店",
    address: "東京都渋谷区宇田川町26-5",
    price: 500,
    memberDiscountRate: 0.15, // 会員15%オフ
    freeTimePriceWeekday: 1800,
    freeTimePriceWeekend: 2500,
    studentDiscountRate: 0.25, // 学割25%オフ
    position: [35.660789, 139.699324],
    rating: 4.5,
    openNow: true,
  },
]

type KaraokeContextType = {
  userLocation: [number, number] | null
  karaokePlaces: KaraokePlace[]
  loading: boolean
  error: string | null
  selectedPlace: KaraokePlace | null
  setSelectedPlace: (place: KaraokePlace | null) => void
  sortBy: "distance" | "price" | "calculatedPrice"
  setSortBy: (sort: "distance" | "price" | "calculatedPrice") => void
  stayDuration: number // 滞在希望時間（分）
  setStayDuration: (duration: number) => void
  isStudent: boolean // 学生かどうか
  setIsStudent: (isStudent: boolean) => void
  isMember: boolean // 会員かどうか
  setIsMember: (isMember: boolean) => void
  isWeekend: boolean // 休日かどうか
  calculatePrices: () => void // 料金計算関数
  priceType: "regular" | "student" | "member" // 表示する料金タイプ
  setPriceType: (type: "regular" | "student" | "member") => void
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined)

export function KaraokeProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [karaokePlaces, setKaraokePlaces] = useState<KaraokePlace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<KaraokePlace | null>(null)
  const [sortBy, setSortBy] = useState<"distance" | "price" | "calculatedPrice">("distance")
  const [stayDuration, setStayDuration] = useState<number>(120) // デフォルト2時間
  const [isStudent, setIsStudent] = useState<boolean>(false)
  const [isMember, setIsMember] = useState<boolean>(false)
  const [priceType, setPriceType] = useState<"regular" | "student" | "member">("regular")

  // 現在の曜日が休日（土日）かどうかを判定
  const today = new Date()
  const isWeekend = today.getDay() === 0 || today.getDay() === 6 // 0が日曜、6が土曜

  // 位置情報の取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
        },
        (err) => {
          setError("位置情報の取得に失敗しました。位置情報へのアクセスを許可してください。")
          setLoading(false)
          // デモ用にデフォルト位置を設定（渋谷駅）
          setUserLocation([35.658034, 139.701636])
        },
      )
    } else {
      setError("お使いのブラウザは位置情報をサポートしていません。")
      setLoading(false)
      // デモ用にデフォルト位置を設定（渋谷駅）
      setUserLocation([35.658034, 139.701636])
    }
  }, [])

  // カラオケ店データの取得と距離計算
  useEffect(() => {
    if (userLocation) {
      // 実際のアプリではここでAPIリクエストを行う
      // 今回はモックデータを使用
      const placesWithDistanceAndTime = mockKaraokePlaces.map((place) => {
        const distance = calculateDistance(userLocation[0], userLocation[1], place.position[0], place.position[1])
        const walkingTime = calculateWalkingTime(distance)

        return {
          ...place,
          distance,
          walkingTime,
        }
      })

      setKaraokePlaces(placesWithDistanceAndTime)
      setLoading(false)
    }
  }, [userLocation])

  // 条件に基づいて各カラオケ店の予想料金を計算
  const calculatePrices = useCallback(() => {
    setKaraokePlaces((currentPlaces) => {
      if (currentPlaces.length === 0) return currentPlaces

      return currentPlaces.map((place) => {
        // フリータイム料金（平日/休日に応じて）
        const freeTimePrice = isWeekend ? place.freeTimePriceWeekend : place.freeTimePriceWeekday

        // 30分ごとの料金計算（一般料金）
        const timeBasedPrice = Math.ceil(stayDuration / 30) * place.price

        // フリータイムと30分ごとの料金を比較して安い方を選択（一般料金）
        const regularPrice = freeTimePrice !== null && freeTimePrice < timeBasedPrice ? freeTimePrice : timeBasedPrice

        // 学生料金計算
        const studentPrice = Math.round(regularPrice * (1 - place.studentDiscountRate))

        // 会員料金計算
        const memberPrice = Math.round(regularPrice * (1 - place.memberDiscountRate))

        return {
          ...place,
          calculatedPrices: {
            regular: regularPrice,
            student: studentPrice,
            member: memberPrice,
          },
        }
      })
    })
  }, [stayDuration, isWeekend])

  // 滞在時間が変更されたら料金を再計算
  useEffect(() => {
    if (karaokePlaces.length > 0) {
      calculatePrices()
    }
  }, [stayDuration])

  // 距離計算関数（ヘイバーサイン公式）
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // 地球の半径（メートル）
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c

    return Math.round(d) // メートル単位で四捨五入
  }

  // 徒歩時間計算関数（平均歩行速度を時速4kmとして計算）
  function calculateWalkingTime(distanceInMeters: number): number {
    const walkingSpeedMetersPerMinute = 4000 / 60 // 時速4kmを分速に変換
    return Math.ceil(distanceInMeters / walkingSpeedMetersPerMinute) // 切り上げて分単位で返す
  }

  return (
    <KaraokeContext.Provider
      value={{
        userLocation,
        karaokePlaces,
        loading,
        error,
        selectedPlace,
        setSelectedPlace,
        sortBy,
        setSortBy,
        stayDuration,
        setStayDuration,
        isStudent,
        setIsStudent,
        isMember,
        setIsMember,
        isWeekend,
        calculatePrices,
        priceType,
        setPriceType,
      }}
    >
      {children}
    </KaraokeContext.Provider>
  )
}

export function useKaraoke() {
  const context = useContext(KaraokeContext)
  if (context === undefined) {
    throw new Error("useKaraoke must be used within a KaraokeProvider")
  }
  return context
}
