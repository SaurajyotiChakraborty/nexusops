'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useApi } from '@/lib/api'

export interface UserProfile {
    id: string
    name: string | null
    email: string
    imageUrl: string | null
    clerkId: string
}

interface UserProfileContextType {
    profile: UserProfile | null
    loading: boolean
    updateProfile: (data: Partial<UserProfile>) => void
    refetch: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType>({
    profile: null,
    loading: true,
    updateProfile: () => { },
    refetch: async () => { },
})

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        if (!isSignedIn) { setLoading(false); return }
        try {
            const data = await api.get<UserProfile>('/auth/me')
            setProfile(data)
        } catch {
            // swallow silently — auth may not be ready yet
        } finally {
            setLoading(false)
        }
    }, [api, isSignedIn])

    useEffect(() => {
        if (isLoaded) fetchProfile()
    }, [isLoaded, fetchProfile])

    const updateProfile = useCallback((data: Partial<UserProfile>) => {
        setProfile((prev) => prev ? { ...prev, ...data } : prev)
    }, [])

    return (
        <UserProfileContext.Provider value={{ profile, loading, updateProfile, refetch: fetchProfile }}>
            {children}
        </UserProfileContext.Provider>
    )
}

export function useUserProfile() {
    return useContext(UserProfileContext)
}
