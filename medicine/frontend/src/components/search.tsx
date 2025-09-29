"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { searchMedicine, Medicine } from "../../medicine";
import { useRouter } from "next/navigation";


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
  onQueryChange?: (query: string) => void
}

export function TrendySearch({ onSearch, onQueryChange }: TrendySearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const router = useRouter()

  const filteredSuggestions = MEDICINE_LIST.filter((item) => item.item_name.toLowerCase().includes(query.toLowerCase()))

  const allSuggestions = query.length > 0 ? filteredSuggestions : MEDICINE_LIST

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
  }, []);


  useEffect(() => {
      if (!query.trim()) {
          setMedicines
      }
  })


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
          onSearch?.(selectedQuery, selectedFilter)
        } else if (query.trim()) {
          handleSearch()
        }
        break
      case "Escape":
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const handleSearch = async () => {
      if (!query.trim()) return
      try {
          console.log("searching for : " + query)
          const results = await searchMedicine(query)
          console.log("search results : ", results)
          setMedicines(results)
          setIsOpen(false)

          router.replace(`/search?item_name=${encodeURIComponent(query)}`, undefined)
      } catch (err) {
          console.error("검색 실패 : ", err)
      }
    }


  const handleSuggestionSelect = (text: string) => {
    setQuery(text)
    setIsOpen(false)
    onSearch?.(text, selectedFilter)
  }

  // const handleQueryChange = (newQuery: string) => {
  //   setQuery(newQuery)
  //   setIsOpen(true)
  //   setActiveIndex(-1)
  //   onQueryChange?.(newQuery)
  // }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">검색 범위:</span>
          <div className="flex gap-1">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className={cn(
                  "px-3 py-1 rounded-full texttext-xs font-medium transition-all duration-200",
                  selectedFilter === option.id
                    ? "bg-yellow-200 texttext-yellow-800 border border-yellow-300"
                    : "bg-gray-100 texttext-gray-600 hover:bg-gray-200 border border-gray-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>


        {/* 검색창 */}
      <div className="relative">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder="약품이나 마켓을 검색해보세요!"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 pr-20 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-yellow-200/50 focus:border-yellow-300 shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl focus:shadow-xl placeholder:text-gray-400"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-600 w-5 h-5" />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md"
          >
            검색
          </Button>
        </div>
      </div>



        {/* 검색 결과 표시 */}
        {!isOpen && query.length > 0 && (
          <div className="mt-8 space-y-8">
            {(selectedFilter === "all" || selectedFilter === "medicine") && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  🔎 "{query}" 검색 결과
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicines.length > 0 ? (
                    medicines.map((medicine, index) => (
                      <Card
                        key={index}
                        className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer
                          border border-yellow-200 hover:border-yellow-300
                          bg-gradient-to-br from-yellow-50 to-amber-50"
                        onClick={() => handleSuggestionSelect(medicine.item_name)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-yellow-900">{medicine.item_name}</h4>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            {medicine.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">용량: {medicine.detail}</p>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">검색 결과가 없습니다</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}




        {/* medicine List */}
      {!isOpen && query.length === 0 && (
        <div className="mt-8 space-y-8">
          {/* Medicine List */}
          {(selectedFilter === "all" || selectedFilter === "medicine") && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                💊 이런 약들이 있어요
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEDICINE_LIST.map((medicine, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer
                     border border-yellow-200 hover:border-yellow-300
                     bg-gradient-to-br from-yellow-50 to-amber-50"
                    onClick={() => handleSuggestionSelect(medicine.item_name)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-yellow-900">{medicine.item_name}</h4>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        {medicine.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">용량: {medicine.detail}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Board List */}
          {(selectedFilter === "all" || selectedFilter === "board") && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">📋 최근 게시글</h3>
              <div className="space-y-3">
                {BOARD_LIST.map((post, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer
                     border border-orange-200 hover:border-orange-300
                     bg-gradient-to-r from-orange-50 to-amber-50"
                    onClick={() => handleSuggestionSelect(post.title)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-orange-900 flex-1">{post.title}</h4>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full ml-2">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>작성자: {post.author}</span>
                      <div className="flex items-center gap-4">
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

      {isOpen && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-yellow-200/30 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="p-6">
            {query.length === 0 && (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">최근 검색어</h3>
                  <div className="flex flex-wrap gap-2">
                    {MEDICINE_LIST.slice(0, 6).map((medicine, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(medicine.item_name)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-200/50"
                      >
                        {medicine.item_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">추천 검색어</h3>
                  <div className="flex flex-wrap gap-2">{/* Placeholder for recommended searches */}</div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">주의사항 검색</h3>
                  <div className="flex flex-wrap gap-2">{/* Placeholder for precaution searches */}</div>
                </div>
              </>
            )}

            {query.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">"{query}" 관련 검색어</h3>
                {filteredSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredSuggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(item.item_name)}
                        className={cn(
                          "px-4 py-2 bg-white hover:bg-yellow-50 texttext-gray-700 hover:texttext-yellow-800 rounded-full texttext-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-yellow-300",
                          activeIndex === index && "bg-yellow-100 border-yellow-400",
                        )}
                      >
                        {item.item_name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">검색 결과가 없습니다</p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
