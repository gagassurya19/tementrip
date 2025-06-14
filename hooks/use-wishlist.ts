import { useUser } from '@/contexts/user-context'
import { useRouter } from 'next/navigation'

export function useWishlist() {
  const { 
    bookmarks, 
    addBookmark, 
    removeBookmark, 
    clearAllBookmarks, 
    isBookmarked, 
    getBookmarkByPlaceId,
    isAuthenticated 
  } = useUser()
  const router = useRouter()

  const toggleBookmark = (destination: any) => {
    if (!isAuthenticated) {
      router.push('/login')
      return false
    }

    if (isBookmarked(destination.placeId)) {
      const bookmark = getBookmarkByPlaceId(destination.placeId)
      if (bookmark) {
        removeBookmark(bookmark.id)
        return false // removed
      }
    } else {
      addBookmark(destination)
      return true // added
    }
    return false
  }

  const clearAll = () => {
    return new Promise<boolean>((resolve) => {
      if (window.confirm('Apakah Anda yakin ingin menghapus semua bookmark?')) {
        clearAllBookmarks()
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  const getBookmarkCount = () => bookmarks.length

  const getBookmarksByCity = (city: string) => {
    return bookmarks.filter(bookmark => 
      bookmark.city.toLowerCase().includes(city.toLowerCase())
    )
  }

  const searchBookmarks = (query: string) => {
    const searchTerm = query.toLowerCase()
    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.city.toLowerCase().includes(searchTerm) ||
      bookmark.state.toLowerCase().includes(searchTerm)
    )
  }

  const exportBookmarks = () => {
    const data = JSON.stringify(bookmarks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teman-trip-wishlist-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    bookmarks,
    isBookmarked,
    getBookmarkByPlaceId,
    getBookmarkCount,
    getBookmarksByCity,
    searchBookmarks,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    clearAll,
    exportBookmarks,
    isAuthenticated
  }
} 