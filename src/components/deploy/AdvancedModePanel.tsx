'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Cpu,
    MemoryStick,
    Layers,
    Plus,
    Trash2,
    FileCode,
    Settings2,
    KeyRound,
    GitCompare,
} from 'lucide-react'

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[450px] bg-muted/30 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground animate-pulse">Loading editor...</p>
        </div>
    ),
})

const DiffEditor = dynamic(
    () => import('@monaco-editor/react').then(mod => mod.DiffEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[350px] bg-muted/30 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground animate-pulse">Loading diff viewer...</p>
            </div>
        ),
    }
)

interface EnvVar {
    id: string
    key: string
    value: string
}

const DEFAULT_YAML = `# Deployment Configuration
apiVersion: v1
kind: Deployment
metadata:
  name: my-app
  namespace: default

spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app

  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
`

const PREVIOUS_YAML = `# Deployment Configuration (Previous)
apiVersion: v1
kind: Deployment
metadata:
  name: my-app
  namespace: default

spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app

  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:v1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
`

export function AdvancedModePanel() {
    // YAML editor state
    const [yamlConfig, setYamlConfig] = useState(DEFAULT_YAML)

    // Resource controls state
    const [cpu, setCpu] = useState('500')
    const [memory, setMemory] = useState('512')
    const [replicas, setReplicas] = useState('1')

    // Environment variables state
    const [envVars, setEnvVars] = useState<EnvVar[]>([
        { id: '1', key: 'NODE_ENV', value: 'production' },
        { id: '2', key: 'PORT', value: '3000' },
    ])

    const addEnvVar = useCallback(() => {
        setEnvVars((prev) => [
            ...prev,
            { id: crypto.randomUUID(), key: '', value: '' },
        ])
    }, [])

    const removeEnvVar = useCallback((id: string) => {
        setEnvVars((prev) => prev.filter((v) => v.id !== id))
    }, [])

    const updateEnvVar = useCallback(
        (id: string, field: 'key' | 'value', val: string) => {
            setEnvVars((prev) =>
                prev.map((v) =>
                    v.id === id ? { ...v, [field]: val } : v
                )
            )
        },
        []
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-warning/50 to-transparent" />
                <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                    Advanced Configuration
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-warning/50 to-transparent" />
            </div>

            {/* 1 — YAML Editor */}
            <Card className="border-warning/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileCode className="h-4 w-4 text-warning" />
                        Deployment YAML
                    </CardTitle>
                    <CardDescription>
                        Edit the raw deployment configuration in YAML format
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg overflow-hidden border">
                        <Editor
                            height="450px"
                            language="yaml"
                            theme="vs-dark"
                            value={yamlConfig}
                            onChange={(val) => setYamlConfig(val ?? '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                tabSize: 2,
                                renderLineHighlight: 'all',
                                padding: { top: 12, bottom: 12 },
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2 — Resource Controls */}
            <Card className="border-warning/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Settings2 className="h-4 w-4 text-warning" />
                        Resource Allocation
                    </CardTitle>
                    <CardDescription>
                        Manually configure CPU, memory, and replica count
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="cpu"
                                className="flex items-center gap-1.5"
                            >
                                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                                CPU (millicores)
                            </Label>
                            <Input
                                id="cpu"
                                type="number"
                                value={cpu}
                                onChange={(e) => setCpu(e.target.value)}
                                min={50}
                                max={4000}
                                step={50}
                                placeholder="500"
                            />
                            <p className="text-xs text-muted-foreground">
                                50–4000m (1000m = 1 vCPU)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="memory"
                                className="flex items-center gap-1.5"
                            >
                                <MemoryStick className="h-3.5 w-3.5 text-muted-foreground" />
                                Memory (MB)
                            </Label>
                            <Input
                                id="memory"
                                type="number"
                                value={memory}
                                onChange={(e) => setMemory(e.target.value)}
                                min={64}
                                max={8192}
                                step={64}
                                placeholder="512"
                            />
                            <p className="text-xs text-muted-foreground">
                                64–8192 MB
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="replicas"
                                className="flex items-center gap-1.5"
                            >
                                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                Replicas
                            </Label>
                            <Input
                                id="replicas"
                                type="number"
                                value={replicas}
                                onChange={(e) => setReplicas(e.target.value)}
                                min={1}
                                max={10}
                                step={1}
                                placeholder="1"
                            />
                            <p className="text-xs text-muted-foreground">
                                1–10 instances
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3 — Environment Variables */}
            <Card className="border-warning/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <KeyRound className="h-4 w-4 text-warning" />
                                Environment Variables
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Define key-value pairs for your deployment
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addEnvVar}
                            className="gap-1"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Variable
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {envVars.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No environment variables defined. Click "Add
                            Variable" to get started.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_1fr_40px] gap-2 px-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Key
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Value
                                </span>
                                <span />
                            </div>
                            {/* Rows */}
                            {envVars.map((envVar) => (
                                <div
                                    key={envVar.id}
                                    className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center"
                                >
                                    <Input
                                        value={envVar.key}
                                        onChange={(e) =>
                                            updateEnvVar(
                                                envVar.id,
                                                'key',
                                                e.target.value
                                            )
                                        }
                                        placeholder="KEY_NAME"
                                        className="font-mono text-sm"
                                    />
                                    <Input
                                        value={envVar.value}
                                        onChange={(e) =>
                                            updateEnvVar(
                                                envVar.id,
                                                'value',
                                                e.target.value
                                            )
                                        }
                                        placeholder="value"
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeEnvVar(envVar.id)
                                        }
                                        className="h-9 w-9 text-muted-foreground hover:text-danger"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 4 — Rollback Diff Viewer */}
            <Card className="border-warning/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <GitCompare className="h-4 w-4 text-warning" />
                        Rollback Diff Viewer
                    </CardTitle>
                    <CardDescription>
                        Compare current configuration against the previous
                        deployment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg overflow-hidden border">
                        <DiffEditor
                            height="350px"
                            language="yaml"
                            theme="vs-dark"
                            original={PREVIOUS_YAML}
                            modified={yamlConfig}
                            options={{
                                readOnly: true,
                                renderSideBySide: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                                padding: { top: 12, bottom: 12 },
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
