'use client'

import LinkImport from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

const Link = (LinkImport.default || LinkImport) as unknown as typeof LinkImport.default

export const CustomTabComponentClient: React.FC<{
  path: string
}> = ({ path }) => {
  const params = useParams()

  const baseRoute = (params.segments.slice(0, 4) as string[]).join('/')

  return <Link href={`${baseRoute}${path}`}>Custom Tab Component</Link>
}
