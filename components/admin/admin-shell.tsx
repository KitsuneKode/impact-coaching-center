"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, useContext, useState, type ReactNode } from "react"
import { useConvexAuth, useQuery } from "convex/react"
import { IconLayoutDashboard, IconUsers, IconSpeakerphone } from "@tabler/icons-react"
import { convexConfigured } from "@/app/providers"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { Button, ButtonLink } from "@/components/ui/button"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminMessage, AdminLoading, AdminUnavailable, AdminErrorBoundary } from "./states"
const RoleContext=createContext<"staff"|"owner">("staff")
export const useAdminRole=()=>useContext(RoleContext)
export function AdminShell({children}:{children:ReactNode}) {
 if(!convexConfigured)return <AdminUnavailable/>
 return <AdminErrorBoundary><ProtectedShell>{children}</ProtectedShell></AdminErrorBoundary>
}
function ProtectedShell({children}:{children:ReactNode}) {
 const pathname=usePathname()
 const {isAuthenticated,isLoading}=useConvexAuth()
 const person=useQuery(api.auth.getCurrentPerson,isAuthenticated?{}:"skip")
 const [leaving,setLeaving]=useState(false)
 const [error,setError]=useState(false)
 async function signOut(){setLeaving(true);setError(false);try{const result=await authClient.signOut();if(result.error)throw new Error("signout");window.location.assign("/sign-in")}catch{setError(true)}}
 if(leaving)return <AdminMessage title={error?"Could not sign out":"Signing out…"}>{error&&<><p>Check your connection and try again.</p><Button className="mt-4" onClick={signOut}>Retry sign out</Button></>}</AdminMessage>
 if(isLoading||(isAuthenticated&&person===undefined))return <AdminLoading/>
 if(!isAuthenticated)return <AdminMessage title="Sign in to your workspace"><p>Use the mobile number registered for your ICT access.</p><ButtonLink className="mt-6" href={`/sign-in?next=${encodeURIComponent(pathname)}`}>Sign in</ButtonLink></AdminMessage>
 if(!person||(person.role!=="staff"&&person.role!=="owner"))return <AdminMessage title="Access required"><p>This account does not have staff access. Ask the owner to review your access.</p><Button variant="secondary" className="mt-6" onClick={signOut}>Sign out</Button></AdminMessage>
 return <RoleContext.Provider value={person.role}><TooltipProvider><SidebarProvider><Sidebar><SidebarHeader className="p-5"><Link href="/admin" className="text-lg font-medium">ICT workspace</Link><p className="text-sm text-muted-foreground">{person.role==="owner"?"Owner":"Staff · read only"}</p></SidebarHeader><SidebarContent><AdminNavigation/></SidebarContent><SidebarFooter className="p-4"><ButtonLink href="/" variant="ghost">View website</ButtonLink><Button variant="secondary" onClick={signOut}>Sign out</Button></SidebarFooter></Sidebar><SidebarInset><header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4"><SidebarTrigger className="size-11"/><span className="text-sm text-muted-foreground">Impact Career Tutorials</span></header><div className="min-w-0 flex-1 p-4 md:p-8"><AdminErrorBoundary key={pathname}>{children}</AdminErrorBoundary></div></SidebarInset></SidebarProvider></TooltipProvider></RoleContext.Provider>
}
function AdminNavigation(){const path=usePathname();const {setOpenMobile}=useSidebar();return <nav aria-label="Workspace" className="p-3"><SidebarMenu>{[{href:"/admin",label:"Today",icon:IconLayoutDashboard},{href:"/admin/leads",label:"Enquiries",icon:IconUsers},{href:"/admin/promotions",label:"Promotions",icon:IconSpeakerphone}].map(item=><SidebarMenuItem key={item.href}><SidebarMenuButton className="min-h-11" isActive={path===item.href} render={<Link href={item.href} onClick={()=>setOpenMobile(false)}/> }><item.icon aria-hidden="true"/><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></nav>}
