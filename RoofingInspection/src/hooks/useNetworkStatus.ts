import { useState, useEffect } from "react"
import { networkService } from "../services/NetworkService"

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(networkService.isConnected)

  useEffect(() => {
    // Subscribe to our singleton service
    const unsubscribe = networkService.subscribe((status) => {
      setIsConnected(status)
    })
    return () => unsubscribe()
  }, [])

  return isConnected
}