"use client"

import {
  IconCurrentLocation,
  IconMapPin,
  IconNavigation,
  IconPhone,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button, ButtonAnchor } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useContent } from "@/i18n/content"
import { centres, contact, formatPhone, place } from "@/lib/brand"
import { byDistance, directionsUrl } from "@/lib/centres"
import { contactHref } from "@/lib/contact"
import { cn } from "@/lib/utils"

type State =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "denied" }
  | { kind: "failed" }
  | { kind: "found"; rows: ReturnType<typeof byDistance> }

/**
 * Both centres, and on request the one nearest the reader. Location is asked
 * for only when they tap the button, and never leaves the browser.
 */
export function CentreFinder() {
  const t = useTranslations("Centres")
  const { phrase } = useContent()
  const [state, setState] = useState<State>({ kind: "idle" })

  const rows =
    state.kind === "found"
      ? state.rows
      : centres.map((centre) => ({ centre, km: null as number | null }))
  const mapCentre = rows.find((row) => row.centre.at)?.centre.at

  function locate() {
    if (!("geolocation" in navigator)) return setState({ kind: "failed" })
    setState({ kind: "locating" })
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          kind: "found",
          rows: byDistance(centres, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        }),
      (error) =>
        setState({
          kind: error.code === error.PERMISSION_DENIED ? "denied" : "failed",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 }
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          variant="secondary"
          onClick={locate}
          disabled={state.kind === "locating"}
        >
          {state.kind === "locating" ? (
            <Spinner />
          ) : (
            <IconCurrentLocation stroke={1.6} aria-hidden />
          )}
          {state.kind === "locating" ? t("locating") : t("find")}
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {state.kind === "denied"
            ? t("denied")
            : state.kind === "failed"
              ? t("failed")
              : null}
        </p>
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(({ centre, km }, index) => {
          const nearest = state.kind === "found" && index === 0 && km !== null
          return (
            <li
              key={centre.id}
              className={cn(
                "flex flex-col rounded-card border bg-card p-6 shadow-frame transition-[border-color,box-shadow] duration-300",
                nearest ? "border-foreground/40 shadow-lift" : "border-border"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">{phrase(centre.town)}</h3>
                {nearest ? (
                  <span className="rounded-control bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                    {t("nearest")}
                  </span>
                ) : null}
                {centre.main ? (
                  <span className="rounded-control bg-secondary px-2 py-0.5 text-xs">
                    {t("main")}
                  </span>
                ) : null}
                {centre.at ? null : (
                  <span className="rounded-control bg-highlight/35 px-2 py-0.5 text-xs">
                    {t("soon")}
                  </span>
                )}
              </div>

              {centre.at ? (
                <>
                  <address className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground not-italic">
                    {centre.at.street}, {phrase(centre.town)}, {place.region}{" "}
                    {centre.at.pin}
                  </address>
                  {km !== null ? (
                    <p className="tnum mt-2 text-sm font-bold">
                      {t("away", {
                        km: km < 10 ? km.toFixed(1) : Math.round(km),
                      })}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <ButtonAnchor
                      href={directionsUrl(centre.at)}
                      target="_blank"
                      size="md"
                    >
                      <IconNavigation stroke={1.6} aria-hidden />
                      {t("directions")}
                    </ButtonAnchor>
                    <ButtonAnchor
                      href={contactHref({ kind: "call" })}
                      variant="secondary"
                      size="md"
                    >
                      <IconPhone stroke={1.6} aria-hidden />
                      {t("call")}
                    </ButtonAnchor>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {t("pendingNote")}
                  </p>
                  <div className="mt-auto pt-5">
                    <ButtonAnchor
                      href={contactHref({ kind: "call" })}
                      variant="secondary"
                      size="md"
                    >
                      <IconPhone stroke={1.6} aria-hidden />
                      <span className="tnum">
                        {formatPhone(contact.phones[0])}
                      </span>
                    </ButtonAnchor>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>

      {mapCentre ? (
        <div className="mt-4 overflow-hidden rounded-card border border-border bg-card shadow-frame">
          <div className="relative aspect-[16/7] bg-surface">
            <iframe
              key={`${mapCentre.lat},${mapCentre.lng}`}
              title={t("mapTitle", {
                town: phrase(rows.find((r) => r.centre.at)!.centre.town),
              })}
              src={`https://www.google.com/maps?q=${mapCentre.lat},${mapCentre.lng}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="absolute inset-0 size-full border-0 grayscale-[0.2]"
            />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconMapPin size={16} stroke={1.6} aria-hidden />
              {mapCentre.street}
            </p>
            <a
              href={mapCentre.maps}
              target="_blank"
              rel="noreferrer noopener"
              className="link shrink-0 text-sm"
            >
              {t("maps")}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
