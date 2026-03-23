'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useApi } from '@/lib/api'
import { useUserProfile } from '@/components/auth/user-profile-context'
import {
    User,
    Bell,
    LinkIcon,
    Github,
    Check,
    Loader2,
    AlertTriangle,
    Unlink,
    CheckCircle,
    XCircle,
    Trash2,
    Camera,
} from 'lucide-react'

// ---------- Types ----------
interface UserProfile {
    id: string
    name: string | null
    email: string
    imageUrl: string | null
    clerkId: string
}

interface Connection {
    provider: string
    createdAt: string
    expiresAt: string | null
}

type ToastType = 'success' | 'error'
interface Toast {
    id: number
    message: string
    type: ToastType
}

const NOTIF_KEY = 'nexusops_notif_prefs'

function loadNotifPrefs() {
    if (typeof window === 'undefined') return { deployments: true, aiops: true }
    try {
        const stored = localStorage.getItem(NOTIF_KEY)
        if (stored) return JSON.parse(stored)
    } catch { }
    return { deployments: true, aiops: true }
}

// ---------- Toast ----------
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    onClick={() => onRemove(t.id)}
                    className={`
                        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer
                        text-sm font-medium border animate-in slide-in-from-bottom-2 duration-300
                        ${t.type === 'success'
                            ? 'bg-success/10 border-success/30 text-success dark:bg-success/20'
                            : 'bg-danger/10 border-danger/30 text-danger dark:bg-danger/20'}
                    `}
                >
                    {t.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />}
                    {t.message}
                </div>
            ))}
        </div>
    )
}

// ---------- Clickable Avatar ----------
function EditableAvatar({
    imageUrl,
    name,
    previewUrl,
    onImageSelect,
    onImageError,
}: {
    imageUrl?: string | null
    name?: string | null
    previewUrl: string | null
    onImageSelect: (dataUrl: string) => void
    onImageError: (message: string) => void
}) {
    const fileRef = useRef<HTMLInputElement>(null)
    const displaySrc = previewUrl ?? imageUrl ?? null
    const initials = name
        ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size is <= 500KB
        if (file.size > 500 * 1024) {
            onImageError('Profile image must be less than 500KB.')
            if (fileRef.current) fileRef.current.value = ''
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => { onImageSelect(reader.result as string) }
        reader.readAsDataURL(file)
        if (fileRef.current) fileRef.current.value = ''
    }

    return (
        <div className="relative group w-20 h-20 shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
            {displaySrc ? (
                <img
                    src={displaySrc}
                    alt={name ?? 'Avatar'}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-all"
                />
            ) : (
                <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center text-white text-2xl font-bold ring-2 ring-border group-hover:ring-primary transition-all">
                    {initials}
                </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
        </div>
    )
}

// ---------- Skeleton ----------
function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-border p-6 space-y-4 animate-pulse">
            <div className="h-5 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-16 rounded-full w-16 bg-muted" />
            <div className="h-10 rounded-lg bg-muted" />
        </div>
    )
}

// ---------- Bitbucket Icon ----------
function BitbucketIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
        </svg>
    )
}

// ---------- Main ----------
export default function SettingsPage() {
    const { user: clerkUser } = useUser()
    const { signOut } = useClerk()
    const api = useApi()
    const { profile: contextProfile, updateProfile: updateContextProfile } = useUserProfile()

    // Local profile state (mirrors context but editable before save)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [nameInput, setNameInput] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null) // base64 preview before save
    const [profileLoading, setProfileLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)

    // Connections
    const [connections, setConnections] = useState<Connection[]>([])
    const [connectionsLoading, setConnectionsLoading] = useState(true)
    const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
    const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null)

    // Notifications
    const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs)

    // Delete
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Toasts
    const [toasts, setToasts] = useState<Toast[]>([])
    const toastRef = useRef(0)

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = ++toastRef.current
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }, [])

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // Populate local state from context when it loads
    useEffect(() => {
        if (contextProfile) {
            setProfile(contextProfile)
            setNameInput(contextProfile.name ?? '')
            setProfileLoading(false)
        }
    }, [contextProfile])

    // Fallback: fetch directly if context didn't load yet
    useEffect(() => {
        if (!contextProfile) {
            api.get<UserProfile>('/auth/me')
                .then((data) => {
                    setProfile(data)
                    setNameInput(data.name ?? '')
                })
                .catch(() => {})
                .finally(() => setProfileLoading(false))
        }
    }, [])

    // Load connections
    const loadConnections = useCallback(() => {
        setConnectionsLoading(true)
        api.get<Connection[]>('/auth/connections')
            .then(setConnections)
            .catch(() => showToast('Failed to load connections', 'error'))
            .finally(() => setConnectionsLoading(false))
    }, [api, showToast])

    useEffect(() => { loadConnections() }, [loadConnections])

    // Save profile (name + optional image)
    const handleSaveProfile = async () => {
        setSavingProfile(true)
        try {
            const payload: { name: string; imageUrl?: string } = { name: nameInput }
            if (imagePreview) payload.imageUrl = imagePreview

            const updated = await api.patch<UserProfile>('/auth/me', payload)
            setProfile(updated)
            setImagePreview(null) // clear preview; real image is now saved
            // Sync to global context instantly
            updateContextProfile({ name: updated.name, imageUrl: updated.imageUrl })
            showToast('Profile updated successfully', 'success')
        } catch (e: any) {
            showToast(e.message ?? 'Failed to save profile', 'error')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleConnect = async (provider: string) => {
        setConnectingProvider(provider)
        try {
            const { url } = await api.get<{ url: string; state: string }>(`/auth/connect/${provider}`)
            window.location.href = url
        } catch (e: any) {
            showToast(e.message ?? `Failed to connect ${provider}`, 'error')
            setConnectingProvider(null)
        }
    }

    const handleDisconnect = async (provider: string) => {
        setDisconnectingProvider(provider)
        try {
            await api.delete(`/auth/disconnect/${provider}`)
            await loadConnections()
            showToast(`${capitalize(provider)} disconnected`, 'success')
        } catch (e: any) {
            showToast(e.message ?? `Failed to disconnect ${provider}`, 'error')
        } finally {
            setDisconnectingProvider(null)
        }
    }

    const toggleNotif = (key: 'deployments' | 'aiops') => {
        const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
        setNotifPrefs(updated)
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            await api.delete('/auth/me')
            await signOut()
        } catch (e: any) {
            showToast(e.message ?? 'Failed to delete account', 'error')
            setDeleting(false)
            setDeleteConfirm(false)
        }
    }

    const isConnected = (p: string) => connections.some((c) => c.provider === p)
    const connectedAt = (p: string) => connections.find((c) => c.provider === p)?.createdAt

    // Detect if there are unsaved changes
    const hasChanges = (
        nameInput !== (profile?.name ?? '') ||
        imagePreview !== null
    )

    const providers = [
        {
            key: 'github',
            label: 'GitHub',
            description: 'Import and deploy from GitHub repositories',
            icon: <Github className="w-5 h-5" />,
        },
        {
            key: 'bitbucket',
            label: 'Bitbucket',
            description: 'Import and deploy from Bitbucket repositories',
            icon: <BitbucketIcon className="w-5 h-5" />,
        },
    ]

    return (
        <DashboardLayout>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <div className="max-w-2xl mx-auto space-y-6 pb-12">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
                </div>

                {/* ── Profile ── */}
                {profileLoading ? (
                    <CardSkeleton />
                ) : (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Profile
                            </CardTitle>
                            <CardDescription>Update your display name and photo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Clickable avatar + fields side by side */}
                            <div className="flex items-start gap-5">
                                <div className="flex flex-col items-center gap-1.5">
                                    <EditableAvatar
                                        imageUrl={profile?.imageUrl ?? clerkUser?.imageUrl}
                                        name={nameInput || profile?.name || clerkUser?.fullName}
                                        previewUrl={imagePreview}
                                        onImageSelect={setImagePreview}
                                        onImageError={(msg) => showToast(msg, 'error')}
                                    />
                                    <span className="text-[11px] text-muted-foreground text-center">
                                        Click to change
                                    </span>
                                </div>

                                <div className="flex-1 space-y-3 pt-1">
                                    <div className="space-y-1.5 flex flex-col justify-center h-full">
                                        <label className="text-sm font-medium">Display Name</label>
                                        <Input
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>
                            </div>

                            {imagePreview && (
                                <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1">
                                    <span>⚠</span> New photo selected — click Save Changes to apply.
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                {imagePreview && (
                                    <button
                                        onClick={() => setImagePreview(null)}
                                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                                    >
                                        Remove new photo
                                    </button>
                                )}
                                <div className="ml-auto">
                                    <Button
                                        variant="accent"
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile || !hasChanges}
                                        className="gap-2"
                                    >
                                        {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {savingProfile ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Connected Accounts ── */}
                {connectionsLoading ? (
                    <CardSkeleton />
                ) : (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                Connected Accounts
                            </CardTitle>
                            <CardDescription>Link Git providers to import and deploy repositories</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {providers.map((p) => {
                                const connected = isConnected(p.key)
                                const connAt = connectedAt(p.key)
                                const isConnecting = connectingProvider === p.key
                                const isDisconnecting = disconnectingProvider === p.key

                                return (
                                    <div
                                        key={p.key}
                                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="text-foreground/70 shrink-0">{p.icon}</div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm">{p.label}</p>
                                                {connected && connAt ? (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        Connected since {new Date(connAt).toLocaleDateString()}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">{p.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {connected ? (
                                                <>
                                                    <Badge variant="success" className="gap-1 text-xs hidden sm:flex">
                                                        <Check className="w-3 h-3" />
                                                        Connected
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5 text-xs"
                                                        onClick={() => handleDisconnect(p.key)}
                                                        disabled={isDisconnecting}
                                                    >
                                                        {isDisconnecting
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <Unlink className="w-3 h-3" />}
                                                        {isDisconnecting ? 'Removing…' : 'Disconnect'}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 text-xs"
                                                    onClick={() => handleConnect(p.key)}
                                                    disabled={isConnecting}
                                                >
                                                    {isConnecting
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <LinkIcon className="w-3 h-3" />}
                                                    {isConnecting ? 'Redirecting…' : 'Connect'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* ── Notifications ── */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Choose which in-app notifications you receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                key: 'deployments' as const,
                                label: 'Deployment updates',
                                description: 'Get notified when deployments succeed or fail',
                            },
                            {
                                key: 'aiops' as const,
                                label: 'AI Ops recommendations',
                                description: 'Receive intelligent infrastructure insights',
                            },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">{item.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                </div>
                                <Switch
                                    checked={notifPrefs[item.key]}
                                    onCheckedChange={() => toggleNotif(item.key)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* ── Danger Zone ── */}
                <Card className="shadow-sm border-danger/25">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-danger">
                            <AlertTriangle className="w-4 h-4" />
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!deleteConfirm ? (
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">Delete Account</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Permanently remove your account and all associated data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1.5 shrink-0"
                                    onClick={() => setDeleteConfirm(true)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                                    <p className="text-sm font-semibold text-danger flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        Are you absolutely sure?
                                    </p>
                                    <p className="text-xs text-danger/80 mt-1">
                                        All your projects, deployments, services, and data will be permanently erased. You will be signed out immediately.
                                    </p>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)} disabled={deleting}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="gap-1.5"
                                    >
                                        {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        {deleting ? 'Deleting…' : 'Yes, delete my account'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
