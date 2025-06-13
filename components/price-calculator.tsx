"use client"

import { useState } from "react"
import { useKaraoke } from "./karaoke-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calculator, Clock } from "lucide-react"

export default function PriceCalculator() {
  const { stayDuration, setStayDuration, isStudent, setIsStudent, isWeekend, setSortBy } = useKaraoke()
  const [localDuration, setLocalDuration] = useState(stayDuration)
  const [localIsStudent, setLocalIsStudent] = useState(isStudent)

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

          <div className="flex items-center justify-between">
            <Label htmlFor="student-mode" className="cursor-pointer">
              学生割引を適用する
            </Label>
            <Switch id="student-mode" checked={localIsStudent} onCheckedChange={setLocalIsStudent} />
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
