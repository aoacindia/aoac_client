import { Metadata } from "next"
import { Suspense } from "react"
import { SearchResults } from "@/components/search/SearchResults"

export const metadata: Metadata = {
  title: "Search Products | AOAC",
  description:
    "Search for organic* products from Allahabad Organic Agricultural Company Private Limited",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search…</div>}>
      <SearchResults />
    </Suspense>
  )
}
