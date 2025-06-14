"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { 
  Bookmark, 
  BookmarkX, 
  MapPin, 
  Star, 
  Search, 
  Calendar,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  MoreVertical
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function BookmarksPage() {
  const { user, isAuthenticated, bookmarks, removeBookmark, isLoading } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("dateAdded")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              Please login to view your bookmarks
            </p>
            <Button onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const filteredBookmarks = bookmarks
    .filter((bookmark) => {
      if (!searchTerm) return true
      return bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             bookmark.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
             bookmark.state.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dateAdded":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        case "name":
          return a.title.localeCompare(b.title)
        case "location":
          return a.city.localeCompare(b.city)
        default:
          return 0
      }
    })

  const handleRemoveBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId)
  }

  const handleShare = (bookmark: any) => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        text: `Check out ${bookmark.title} in ${bookmark.city}, ${bookmark.state}`,
        url: `/destinations/${bookmark.placeId}`
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/destinations/${bookmark.placeId}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Wishlist Saya</h1>
            <p className="text-muted-foreground">
              {bookmarks.length > 0 
                ? `${bookmarks.length} destinasi yang telah Anda simpan`
                : "Belum ada destinasi yang disimpan"
              }
            </p>
          </div>
          
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button size="sm" onClick={() => router.push("/itinerary")}>
                <Calendar className="h-4 w-4 mr-2" />
                Buat Itinerary
              </Button>
            </div>
          )}
        </div>

        {bookmarks.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold mb-4">Wishlist Anda Masih Kosong</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Mulai jelajahi destinasi wisata menarik dan simpan yang Anda sukai untuk perjalanan mendatang
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/destinations")} size="lg" className="bg-brand-primary hover:bg-brand-primaryHover">
                <Search className="h-5 w-5 mr-2" />
                Jelajahi Destinasi
              </Button>
              <div className="text-sm text-muted-foreground">
                atau <Link href="/itinerary" className="text-primary hover:underline">buat itinerary baru</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <form onSubmit={(e) => { e.preventDefault() }} className="flex flex-1 lg:flex-1">
                <Input 
                  type="text" 
                  placeholder="Cari dalam wishlist..." 
                  className="pr-12 rounded-r-none rounded-l-2xl h-14 text-lg bg-[#F6F6F6] border-0 flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-14 w-14 rounded-l-none rounded-r-2xl bg-brand-primary hover:bg-brand-primaryHover">
                  <Search className="h-8 w-8" />
                </Button>
              </form>

              <div className="flex gap-2 lg:flex-shrink-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-14">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded">Terbaru Disimpan</SelectItem>
                    <SelectItem value="name">Nama A-Z</SelectItem>
                    <SelectItem value="location">Lokasi A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-lg border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none h-14 px-4"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none h-14 px-4"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {searchTerm ? (
                  `Menampilkan ${filteredBookmarks.length} dari ${bookmarks.length} destinasi untuk "${searchTerm}"`
                ) : (
                  `Menampilkan ${filteredBookmarks.length} destinasi`
                )}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>

            {/* Bookmarks Content */}
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">Tidak ada hasil ditemukan</h3>
                <p className="text-muted-foreground text-sm">
                  Coba ubah kata kunci pencarian
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Reset Pencarian
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="group hover:shadow-lg transition-all duration-200">
                    <div className="relative">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={bookmark.imageUrl || "/placeholder.svg"}
                          alt={bookmark.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShare(bookmark)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Bagikan
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemoveBookmark(bookmark.id)}
                                className="text-red-600"
                              >
                                <BookmarkX className="h-4 w-4 mr-2" />
                                Hapus dari Wishlist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/80 text-black">
                            <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                            Disimpan
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{bookmark.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {bookmark.city}, {bookmark.state}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Disimpan {new Date(bookmark.dateAdded).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <Link href={`/destinations/${bookmark.placeId}`}>
                            <Button variant="outline" size="sm">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={bookmark.imageUrl || "/placeholder.svg"}
                            alt={bookmark.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-xl mb-1">{bookmark.title}</h3>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {bookmark.city}, {bookmark.state}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                                Disimpan {new Date(bookmark.dateAdded).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(bookmark)}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Bagikan
                              </Button>
                              <Link href={`/destinations/${bookmark.placeId}`}>
                                <Button size="sm">
                                  Lihat Detail
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBookmark(bookmark.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <BookmarkX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Action Bar */}
            {filteredBookmarks.length > 0 && (
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Siap untuk berpetualang?</h3>
                  <p className="text-muted-foreground mb-4">
                    Buat itinerary dari destinasi favorit Anda atau lanjutkan mencari inspirasi
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" onClick={() => router.push("/itinerary")}>
                      <Calendar className="h-5 w-5 mr-2" />
                      Buat Itinerary dari Wishlist
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => router.push("/destinations")}>
                      <Search className="h-5 w-5 mr-2" />
                      Cari Destinasi Lain
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
