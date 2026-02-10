'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useApi } from '@/lib/api'
import {
    Rocket,
    FolderGit2,
    ArrowRight,
    Github,
    GitBranch,
    RefreshCw,
    Link as LinkIcon,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react'

interface Repo {
    id: string | number
    name: string
    full_name: string
    clone_url: string
    default_branch: string
    updated_at?: string
    provider: 'github' | 'bitbucket' | 'manual'
}

interface Connection {
    provider: string
    createdAt: string
    expiresAt?: string
}

export default function DeployPage() {
    const api = useApi()
    const router = useRouter()

    const [step, setStep] = useState<'method' | 'repo' | 'configure' | 'deploy'>('method')
    const [method, setMethod] = useState<'manual' | 'github' | 'bitbucket'>('manual')

    const [repos, setRepos] = useState<Repo[]>([])
    const [isLoadingRepos, setIsLoadingRepos] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
    const [manualUrl, setManualUrl] = useState('')
    const [connections, setConnections] = useState<Connection[]>([])
    const [repoError, setRepoError] = useState<string | null>(null)
    const [branch, setBranch] = useState('main')
    const [isDetectingBranch, setIsDetectingBranch] = useState(false)

    const [projectDetails, setProjectDetails] = useState({
        name: '',
        framework: 'NEXTJS',
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: '.next'
    })
    const [deployLogs, setDeployLogs] = useState<string[]>([])

    // Check connection status on mount
    useEffect(() => {
        checkConnections()
    }, [])

    const checkConnections = async () => {
        try {
            const conns = await api.get<Connection[]>('/auth/connections')
            setConnections(conns)
        } catch (error) {
            console.error('Failed to fetch connections', error)
        }
    }

    const isConnected = (provider: string) => {
        return connections.some(c => c.provider === provider)
    }

    const handleConnect = async (provider: 'github' | 'bitbucket') => {
        try {
            const { url, state } = await api.get<{ url: string; state: string }>(`/auth/connect/${provider}`)

            // Open OAuth popup
            const width = 600
            const height = 700
            const left = window.screen.width / 2 - width / 2
            const top = window.screen.height / 2 - height / 2

            const popup = window.open(
                url,
                `Connect ${provider}`,
                `width=${width},height=${height},left=${left},top=${top}`
            )

            // Poll for popup close or message
            const checkPopup = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkPopup)
                    // Refresh connections and try fetching repos again
                    checkConnections().then(() => {
                        if (isConnected(provider)) {
                            fetchRepos(provider)
                        }
                    })
                }
            }, 500)

        } catch (error) {
            console.error(`Failed to initiate ${provider} connection`, error)
            alert(`Failed to connect to ${provider}. Please try again.`)
        }
    }

    const fetchRepos = async (provider: 'github' | 'bitbucket') => {
        setIsLoadingRepos(true)
        setRepos([])
        setRepoError(null)
        try {
            const res = await api.get<any>(`/projects/${provider}/repos`)

            if (res.error) {
                setRepoError(res.error)
                return
            }

            setRepos(res)
        } catch (error: any) {
            console.error(`Failed to fetch ${provider} repos`, error)
            setRepoError(error.message || 'Failed to fetch repositories')
        } finally {
            setIsLoadingRepos(false)
        }
    }

    const handleMethodSelect = (m: 'manual' | 'github' | 'bitbucket') => {
        setMethod(m)
        if (m === 'manual') {
            setStep('repo')
        } else {
            setStep('repo')
            if (isConnected(m)) {
                fetchRepos(m)
            } else {
                setRepoError(`${m} account not connected`)
            }
        }
    }

    const handleRepoSelect = async (repo: Repo) => {
        setSelectedRepo(repo)
        setProjectDetails(prev => ({
            ...prev,
            name: repo.name
        }))

        // Auto-detect branch
        await detectBranch(repo.clone_url)
    }

    const detectBranch = async (repoUrl: string) => {
        setIsDetectingBranch(true)
        try {
            const result = await api.post<{ defaultBranch: string }>('/projects/detect-branch', { repoUrl })
            setBranch(result.defaultBranch)
        } catch (error) {
            console.error('Failed to detect branch:', error)
            setBranch('main') // Fallback
        } finally {
            setIsDetectingBranch(false)
            setStep('configure')
        }
    }

    const handleManualSubmit = () => {
        if (!manualUrl) return
        setSelectedRepo({
            id: 'manual',
            name: manualUrl.split('/').pop()?.replace('.git', '') || 'my-project',
            full_name: manualUrl,
            clone_url: manualUrl,
            default_branch: 'main',
            provider: 'manual'
        })
        setProjectDetails(prev => ({
            ...prev,
            name: manualUrl.split('/').pop()?.replace('.git', '') || 'my-project'
        }))
        setStep('configure')
    }

    const handleDeploy = async () => {
        setStep('deploy')
        setDeployLogs((prev) => [...prev, 'Starting deployment process...'])

        try {
            setDeployLogs((prev) => [...prev, 'Creating project...'])

            const project = await api.post<any>('/projects', {
                name: projectDetails.name,
                repositoryUrl: selectedRepo?.clone_url,
                framework: projectDetails.framework,
                buildCommand: projectDetails.buildCommand,
                installCommand: projectDetails.installCommand,
            })

            setDeployLogs((prev) => [...prev, 'Project created successfully!', 'Initiating build...'])

            const deployment = await api.post<any>('/deployments', {
                projectId: project.id,
                branch: branch,
                commitMessage: 'Initial deployment',
            })

            setDeployLogs((prev) => [...prev, 'Deployment queued!', 'Redirecting to deployment status...'])

            setTimeout(() => {
                router.push(`/deployments/${deployment.id}`)
            }, 1500)

        } catch (error) {
            console.error(error)
            setDeployLogs((prev) => [...prev, 'Deployment failed! Check console for details.'])
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Deploy a New Project</h1>
                    <p className="text-muted-foreground">
                        Connect your repository and deploy in seconds
                    </p>
                </div>

                {(step === 'method' || step === 'repo') && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                variant={method === 'github' ? 'accent' : 'outline'}
                                className="h-24 flex-col gap-2 relative"
                                onClick={() => handleMethodSelect('github')}
                            >
                                <Github className="w-8 h-8" />
                                GitHub
                                {isConnected('github') && (
                                    <Check className="w-4 h-4 absolute top-2 right-2 text-green-500" />
                                )}
                            </Button>
                            <Button
                                variant={method === 'bitbucket' ? 'accent' : 'outline'}
                                className="h-24 flex-col gap-2 relative"
                                onClick={() => handleMethodSelect('bitbucket')}
                            >
                                <GitBranch className="w-8 h-8" />
                                Bitbucket
                                {isConnected('bitbucket') && (
                                    <Check className="w-4 h-4 absolute top-2 right-2 text-green-500" />
                                )}
                            </Button>
                            <Button
                                variant={method === 'manual' ? 'accent' : 'outline'}
                                className="h-24 flex-col gap-2"
                                onClick={() => handleMethodSelect('manual')}
                            >
                                <LinkIcon className="w-8 h-8" />
                                Git URL
                            </Button>
                        </div>

                        <Card className="min-h-[300px]">
                            <CardHeader>
                                <CardTitle>
                                    {method === 'manual' ? 'Import Git Repository' : `Select ${method === 'github' ? 'GitHub' : 'Bitbucket'} Repository`}
                                </CardTitle>
                                <CardDescription>
                                    {method === 'manual'
                                        ? 'Enter the URL of your public Git repository'
                                        : 'Choose a repository from your linked account'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {method === 'manual' ? (
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="https://github.com/username/repo.git"
                                            value={manualUrl}
                                            onChange={(e) => setManualUrl(e.target.value)}
                                        />
                                        <Button
                                            variant="accent"
                                            className="w-full gap-2"
                                            disabled={!manualUrl}
                                            onClick={handleManualSubmit}
                                        >
                                            Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Branch</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={branch}
                                                    onChange={(e) => setBranch(e.target.value)}
                                                    className="flex-1 px-3 py-2 border rounded-md"
                                                    placeholder="main"
                                                />
                                                {isDetectingBranch && (
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Auto-detected: {branch}
                                            </p>
                                        </div>

                                        {repoError ? (
                                            <div className="text-center py-12 space-y-4">
                                                <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
                                                <p className="text-muted-foreground">{repoError}</p>
                                                <Button variant="accent" onClick={() => handleConnect(method as any)}>
                                                    Connect {method === 'github' ? 'GitHub' : 'Bitbucket'}
                                                </Button>
                                            </div>
                                        ) : isLoadingRepos ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                                                <p>Fetching repositories...</p>
                                            </div>
                                        ) : repos.length > 0 ? (
                                            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
                                                {repos.map(repo => (
                                                    <div
                                                        key={repo.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                                        onClick={() => handleRepoSelect(repo)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{repo.full_name}</span>
                                                                <span className="text-xs text-muted-foreground">{repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'Unknown date'}</span>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="ghost">Select</Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 space-y-4">
                                                <p className="text-muted-foreground">No repositories found.</p>
                                                <Button variant="outline" onClick={() => fetchRepos(method as any)}>
                                                    Retry
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {step === 'configure' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Configuration</CardTitle>
                                <CardDescription>
                                    Configuring <strong>{selectedRepo?.name}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Project Name</label>
                                    <Input
                                        placeholder="my-project"
                                        value={projectDetails.name}
                                        onChange={(e) => setProjectDetails({ ...projectDetails, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Framework</label>
                                    <Input
                                        value={projectDetails.framework}
                                        onChange={(e) => setProjectDetails({ ...projectDetails, framework: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Build Command</label>
                                        <Input
                                            value={projectDetails.buildCommand}
                                            onChange={(e) => setProjectDetails({ ...projectDetails, buildCommand: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Install Command</label>
                                        <Input
                                            value={projectDetails.installCommand}
                                            onChange={(e) => setProjectDetails({ ...projectDetails, installCommand: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep('repo')}>Back</Button>
                            <Button variant="accent" className="flex-1 gap-2" onClick={handleDeploy}>
                                <Rocket className="w-4 h-4" />
                                Deploy
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'deploy' && (
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                        <CardContent className="py-12 text-center space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full gradient-accent flex items-center justify-center animate-pulse">
                                <Rocket className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Deploying...</h2>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 max-w-md mx-auto font-mono text-sm text-left">
                                {deployLogs.map((log, i) => (
                                    <p key={i} className="text-primary">✓ {log}</p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
