import { useEffect, useState } from 'react'

import { SearchClient } from 'app/search/client'
import { Session } from 'services/session'

const useSearch = (searchQuery, prevSearchQuery) => {
  const [searchResults, setSearchResults] = useState({ hits: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      const performSearch = async () => {
        setIsDirty(true)
        if (searchQuery === '') {
          setIsDirty(false)
          setSearchResults({ hits: [] })
          return
        }
        if (
          searchQuery.length < 3 &&
          searchQuery.length > prevSearchQuery.length
        ) {
          setIsDirty(false)
          return
        }

        const { warehouse } = Session.get()

        setIsLoading(true)
        const result = await SearchClient.search({
          query: searchQuery,
          warehouse,
          analytics: false,
        })
        setSearchResults(result)
        setIsLoading(false)
      }

      performSearch()
    }, 200)

    return () => clearTimeout(handler)
  }, [searchQuery])

  return { searchResults, isLoading, isDirty }
}

export { useSearch }
