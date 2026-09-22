"use client"
import { Component, type ReactNode } from "react"
import { Button, ButtonLink } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminMessage({title,children}:{title:string;children:ReactNode}) {
 return <section className="mx-auto w-full max-w-160 p-6 py-16"><h1 className="text-2xl font-medium">{title}</h1><div className="mt-4 text-muted-foreground">{children}</div></section>
}
export function AdminLoading(){return <div aria-live="polite" aria-busy="true" className="space-y-4 p-6"><p>Loading workspace…</p><Skeleton className="h-10 w-48"/><Skeleton className="h-40 w-full"/></div>}
export function AdminUnavailable(){return <AdminMessage title="Workspace unavailable"><p>The workspace connection is not configured for this site. Please contact the site administrator.</p><ButtonLink href="/" variant="secondary" className="mt-6">Back to the website</ButtonLink></AdminMessage>}
export class AdminErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed ? <AdminMessage title="Could not load this workspace"><p>Your request could not be completed. Reload to reconnect and try again.</p><Button className="mt-6" onClick={()=>window.location.reload()}>Reload workspace</Button></AdminMessage>:this.props.children}
}
export function AdminHeading({title,description,children}:{title:string;description:string;children?:ReactNode}) {
 return <header className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-medium tracking-tight">{title}</h1><p className="mt-2 max-w-160 text-sm text-muted-foreground">{description}</p></div>{children}</header>
}
export function CursorControls({canPrevious,canNext,pending,onPrevious,onNext,onRestart}:{canPrevious:boolean;canNext:boolean;pending:boolean;onPrevious:()=>void;onNext:()=>void;onRestart:()=>void}){
 return <nav aria-label="Record pages" className="mt-6 flex flex-wrap items-center gap-2"><Button variant="secondary" disabled={pending||!canPrevious} onClick={onPrevious}>Previous</Button><Button variant="secondary" disabled={pending||!canNext} onClick={onNext}>Next</Button><Button variant="ghost" onClick={onRestart}>Start again</Button>{!pending&&!canNext&&<span className="text-sm text-muted-foreground">End of results</span>}</nav>
}
