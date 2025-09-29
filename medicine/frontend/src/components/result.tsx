"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Star, Eye, Pill, MessageSquare, User, Calendar, Heart, Share2 } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  category: string
  views: number
  rating?: number
  publishedAt: string
  type: "medicine" | "board"
  // 약품 전용 필드
  dosage?: string
  manufacturer?: string
  ingredients?: string
  // 게시판 전용 필드
  author?: string
  replies?: number
  likes?: number
}

const MOCK_RESULTS: SearchResult[] = [
  // 약품 데이터
  {
    id: "1",
    title: "쿠티아핀정 25mg",
    description: "조현병, 양극성장애의 조증 및 우울증 치료에 사용되는 비정형 항정신병약물입니다.",
    url: "#",
    category: "항정신병약",
    views: 15420,
    rating: 4.8,
    publishedAt: "2024-01-15",
    type: "medicine",
    dosage: "25mg, 100mg, 200mg",
    manufacturer: "한국얀센",
    ingredients: "쿠에티아핀푸마르산염",
  },
  {
    id: "2",
    title: "페리돌주 5mg/ml",
    description: "조현병, 조증, 정신운동성 흥분상태 치료에 사용되는 정형 항정신병약물입니다.",
    url: "#",
    category: "항정신병약",
    views: 8930,
    rating: 4.6,
    publishedAt: "2024-01-12",
    type: "medicine",
    dosage: "5mg/ml 주사제",
    manufacturer: "한국얀센",
    ingredients: "할로페리돌",
  },
  // 게시판 데이터
  {
    id: "3",
    title: "쿠티아핀정 복용 후 체중증가 경험담",
    description: "쿠티아핀정을 복용한 지 3개월째인데 체중이 많이 늘었어요. 같은 경험 있으신 분들 조언 부탁드립니다.",
    url: "#",
    category: "부작용 상담",
    views: 12350,
    publishedAt: "2024-01-10",
    type: "board",
    author: "건강지킴이",
    replies: 23,
    likes: 45,
  },
  {
    id: "4",
    title: "노인 환자 항정신병약 복용 시 주의사항",
    description: "80세 어머니가 치매로 항정신병약을 복용하게 되었는데, 노인분들이 특히 주의해야 할 점들이 있을까요?",
    url: "#",
    category: "복용 상담",
    views: 6780,
    publishedAt: "2024-01-08",
    type: "board",
    author: "효자아들",
    replies: 18,
    likes: 32,
  },
]

interface SearchResultsProps {
  query: string
  isVisible: boolean
  filter: string
}

export function SearchResults({ query, isVisible, filter }: SearchResultsProps) {
  if (!isVisible || !query.trim()) return null

  const filteredResults = MOCK_RESULTS.filter((result) => {
    const matchesQuery =
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase())

    if (!matchesQuery) return false

    if (filter === "medicine") return result.type === "medicine"
    if (filter === "board") return result.type === "board"
    return true // "all" filter
  })

  const formatViews = (views: number) => {
    if (views >= 10000) return `${(views / 1000).toFixed(1)}k`
    return views.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1일 전"
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`
    return `${Math.ceil(diffDays / 30)}개월 전`
  }

  const renderMedicineResult = (result: SearchResult) => (
    <Card
      key={result.id}
      className="p-6 hover:shadow-lg transition-all duration-200 border-2 border-blue-100 hover:border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900 hover:text-blue-700 transition-colors cursor-pointer">
                {result.title}
              </h3>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">{result.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">용량:</span>
                <span className="text-gray-800">{result.dosage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">제조사:</span>
                <span className="text-gray-800">{result.manufacturer}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">성분:</span>
                <span className="text-gray-800">{result.ingredients}</span>
              </div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer flex-shrink-0" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-blue-100">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {result.category}
            </Badge>
            {result.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{result.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{formatViews(result.views)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(result.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderBoardResult = (result: SearchResult) => (
    <Card
      key={result.id}
      className="p-6 hover:shadow-lg transition-all duration-200 border-2 border-green-100 hover:border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900 hover:text-green-700 transition-colors cursor-pointer">
                {result.title}
              </h3>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">{result.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{result.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>댓글 {result.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>좋아요 {result.likes}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ExternalLink className="w-5 h-5 text-green-500 hover:text-green-700 transition-colors cursor-pointer" />
            <Share2 className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-green-100">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
              {result.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{formatViews(result.views)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(result.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 animate-in slide-in-from-top-4 duration-300">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          "{query}"에 대한 검색 결과 {filteredResults.length}개
          {filter !== "all" && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              {filter === "medicine" ? "약품만" : "게시판만"}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((result) =>
            result.type === "medicine" ? renderMedicineResult(result) : renderBoardResult(result),
          )
        ) : (
          <Card className="p-8 text-center border-2 border-primary/10 bg-card">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">
                "{query}"와 관련된 결과를 찾을 수 없습니다.
                <br />
                다른 검색어를 시도해보세요.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
