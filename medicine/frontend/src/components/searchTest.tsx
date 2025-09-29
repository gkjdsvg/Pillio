"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { searchMedicine, Medicine } from "../../medicine"
import { useRouter } from "next/navigation"

const MEDICINE_LIST = [
  { item_name: "쿠티아핀정", category: "정신건강의학과", detail: "25mg, 100mg, 200mg" },
  { item_name: "페리돌주", category: "정신건강의학과", detail: "5mg/ml" },
  { item_name: "아리피프라졸", category: "정신건강의학과", detail: "5mg, 10mg, 15mg" },
  { item_name: "올란자핀", category: "정신건강의학과", detail: "2.5mg, 5mg, 10mg" },
  { item_name: "리스페리돈", category: "정신건강의학과", detail: "1mg, 2mg, 3mg" },
  { item_name: "할로페리돌", category: "정신건강의학과", detail: "0.5mg, 1mg, 5mg" },
]

const BOARD_LIST = [
  { title: "쿠티아핀정 복용 후기", author: "약사김○○", replies: 12, likes: 8, category: "복용후기" },
  { title: "페리돌주 부작용 질문", author: "환자박○○", replies: 5, likes: 3, category: "질문답변" },
  { title: "정신건강의학과 약물 정리", author: "의사이○○", replies: 23, likes: 15, category: "정보공유" },
  { title: "약물 상호작용 주의사항", author: "약사최○○", replies: 8, likes: 12, category: "주의사항" },
  { title: "노인 환자 복용법 문의", author: "간병인정○○", replies: 7, likes: 4, category: "질문답변" },
  { title: "임산부 약물 안전성", author: "산부인과의사○○", replies: 18, likes: 22, category: "정보공유" },
]

const FILTER_OPTIONS = [
  { id: "all", label: "전체", description: "약품 + 게시판" },
  { id: "medicine", label: "약품만", description: "의약품 정보만" },
  { id: "board", label: "게시판", description: "커뮤니티 게시글" },
]

interface TrendySearchProps {
  onSearch?: (query: string, filter?: string) => void
}

export function TrendySearch({ onSearch }: TrendySearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filteredSuggestions = MEDICINE_LIST.filter((item) =>
    item.item_name.toLowerCase().includes(query.toLowerCase()),
  )

  const allSuggestions = query.length > 0 ? filteredSuggestions : MEDICINE_LIST

  const toggleFavorite = (name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name],
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0) {
          const selectedQuery = allSuggestions[activeIndex].item_name
          setQuery(selectedQuery)
          setIsOpen(false)
          handleSearch(selectedQuery)
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      case "Escape":
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery ?? query
    if (!q.trim()) return
    try {
      const results = await searchMedicine(q)
      setMedicines(results)
      setIsOpen(false)
      onSearch?.(q, selectedFilter)
      router.replace(`?item_name=${encodeURIComponent(q)}`, undefined)
    } catch (err) {
      console.error("검색 실패 : ", err)
    }
  }

  const handleSuggestionSelect = (text: string) => {
    setQuery(text)
    setIsOpen(false)
    handleSearch(text)
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      {/* 필터 */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-500" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilter(opt.id)}
            className={cn(
              "px-3 py-1.5 rounded-full texttext-sm font-medium transition-all duration-200",
              selectedFilter === opt.id
                ? "bg-yellow-200 texttext-yellow-900 border border-yellow-300"
                : "bg-gray-100 texttext-gray-600 hover:bg-gray-200 border border-gray-200",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="💊 약품명이나 게시글 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-24 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-yellow-200/50
            focus:border-yellow-300 shadow-lg rounded-2xl transition-all duration-200
            hover:shadow-xl focus:shadow-xl placeholder:text-gray-400"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-600" />
        <Button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-11 px-6
            bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500
            text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md"
        >
          검색
        </Button>

        {/* 드롭다운 */}
        {isOpen && (
          <Card
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-sm border border-yellow-200/30 shadow-2xl rounded-2xl z-50"
          >
            {allSuggestions.map((item, idx) => (
              <div
                key={item.item_name}
                className={cn(
                  "px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-50",
                  activeIndex === idx && "bg-yellow-100",
                )}
                onClick={() => handleSuggestionSelect(item.item_name)}
              >
                {item.item_name}
              </div>
            ))}
            {allSuggestions.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-2">검색 결과 없음</p>
            )}
          </Card>
        )}
      </div>

      {/* 검색 결과 또는 기본 리스트 */}
      {!isOpen && (
          <div className="space-y-12">
            {/* 약품 */}
            {(selectedFilter === "all" || selectedFilter === "medicine") && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">💊 약품 리스트</h3>
                    <div className="space-y-4">
                      {(query ? medicines : MEDICINE_LIST).map((med, idx) => (
                        <Card
                          key={idx}
                          className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer
                            border border-yellow-200 hover:border-yellow-300
                            bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl"
                          onClick={() => handleSuggestionSelect(med.item_name)}
                        >
                          {/* 상단: 제목 + 카테고리 */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{med.item_name}</h4>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              {med.category}
                            </span>
                          </div>

                          {/* 중간: 용량 + 주의사항 */}
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>💊 {med.detail}</p>
                            <p className="text-gray-600 text-xs truncate">
                              ⚠️ 복용 전 반드시 의사/약사와 상담하세요.
                            </p>
                          </div>
                        </Card>
                      ))}

                      {(query && medicines.length === 0) && (
                        <div className="py-12 text-center text-gray-500">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                )}


          {/* 게시글 */}
          {(!query && selectedFilter === "all" || selectedFilter === "board") && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">📋 최근 게시글</h3>
              <div className="space-y-4">
                {BOARD_LIST.map((post, idx) => (
                  <Card
                    key={idx}
                    className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer
                      border border-orange-200 hover:border-orange-300
                      bg-gradient-to-r from-orange-50 to-amber-50"
                    onClick={() => handleSuggestionSelect(post.title)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-orange-900 flex-1">{post.title}</h4>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full ml-2">{post.category}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>작성자: {post.author}</span>
                      <div className="flex gap-4">
                        <span>💬 {post.replies}</span>
                        <span>👍 {post.likes}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
