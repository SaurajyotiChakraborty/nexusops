'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareDeploymentProps {
    url: string
    projectName: string
    variant?: 'ghost' | 'outline' | 'default'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
}

export function ShareDeploymentMenu({ url, projectName, variant = 'ghost', size = 'icon', className }: ShareDeploymentProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Ensure URL has protocol
    const shareUrl = url.startsWith('http') ? url : `https://${url}`
    const shareText = `Check out my new project "${projectName}" deployed on NexusOps!`

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
                setOpen(false)
            }, 1500)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
    }

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <Button 
                variant={variant} 
                size={size} 
                className={className} 
                title="Share Deployment"
                onClick={() => setOpen(!open)}
            >
                <Share2 className="w-4 h-4" />
            </Button>

            {open && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-56 origin-bottom-right rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-border focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-sm font-semibold border-b border-border">
                        Share Project
                    </div>
                    <div className="py-1">
                        <button
                            onClick={handleCopy}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Copied to clipboard' : 'Copy live URL'}</span>
                        </button>
                    </div>
                    <div className="border-t border-border py-1">
                        <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                            <span>Share on X (Twitter)</span>
                        </a>
                        <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                            <span>Share on LinkedIn</span>
                        </a>
                        <a
                            href={shareLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                            <span>Share on WhatsApp</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
