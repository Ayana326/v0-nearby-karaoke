"use client"

import { useState } from "react"
import { useKaraoke } from "./karaoke-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calculator, Clock, BadgePercent } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PriceCalculator() {
  const {
    stayDuration,
    setStayDuration,
    isStudent,
    setIsStudent,
    isMember,
    setIsMember,
    isWeekend,
    setSortBy,
    priceType,
    setPriceType,
  } = useKaraoke()

  const [localDuration, setLocalDuration] = useState(stayDuration)
  const [localIsStudent, setLocalIsStudent] = useState(isStudent)
  const [localIsMember, setLocalIsMember] = useState(isMember)
  const [localPriceType, setLocalPriceType] = useState<"regular" | "student" | "member">(priceType)

  // 時間を「時間:分」形式で表示
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}時間${mins > 0 ? ` ${mins}分` : ""}`
  }

  // 適用ボタンがクリックされたときの処理
  const handleApply = () => {
    setStayDuration(localDuration)
    setIsStudent(localIsStudent)
    setIsMember(localIsMember)
    setPriceType(localPriceType)
    setSortBy("calculatedPrice") // 計算された料金でソート
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          料金計算
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="duration" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                滞在時間
              </Label>
              <span className="text-sm font-medium">{formatDuration(localDuration)}</span>
            </div>
            <Slider
              id="duration"
              min={30}
              max={360}
              step={30}
              value={[localDuration]}
              onValueChange={(value) => setLocalDuration(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>30分</span>
              <span>6時間</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center mb-2">
              <BadgePercent className="mr-2 h-4 w-4" />
              割引オプション
            </Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="student-mode" className="cursor-pointer">
                学生割引を適用する
              </Label>
              <Switch
                id="student-mode"
                checked={localIsStudent}
                onCheckedChange={(checked) => {
                  setLocalIsStudent(checked)
                  if (checked) setLocalIsMember(false) // 学生と会員は同時に選択できない
                  if (checked) setLocalPriceType("student")
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="member-mode" className="cursor-pointer">
                会員割引を適用する
              </Label>
              <Switch
                id="member-mode"
                checked={localIsMember}
                onCheckedChange={(checked) => {
                  setLocalIsMember(checked)
                  if (checked) setLocalIsStudent(false) // 会員と学生は同時に選択できない
                  if (checked) setLocalPriceType("member")
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">表示する料金タイプ</Label>
            <RadioGroup
              value={localPriceType}
              onValueChange={(value) => setLocalPriceType(value as "regular" | "student" | "member")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="regular" id="regular" />
                <Label htmlFor="regular" className="text-sm">
                  一般
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="text-sm">
                  学生
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member" className="text-sm">
                  会員
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
            {isWeekend ? "本日は休日料金が適用されます" : "本日は平日料金が適用されます"}
          </div>

          <Button onClick={handleApply} className="w-full">
            条件を適用して最安値を検索
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
