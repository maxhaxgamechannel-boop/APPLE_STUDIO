import { useEffect } from 'react'
import { Hero } from '@/components/home/Hero'
import { ProLineup } from '@/components/home/ProLineup'
import { DuoShowcase } from '@/components/home/DuoShowcase'
import { Ecosystem } from '@/components/home/Ecosystem'
import { Featured } from '@/components/home/Featured'
import { Benefits } from '@/components/home/Benefits'

export default function Home() {
  useEffect(() => {
    document.title = 'APPLE STUDIO — техника Apple в 3D'
  }, [])
  return (
    <>
      <Hero />
      <ProLineup />
      <DuoShowcase />
      <Ecosystem />
      <Featured />
      <Benefits />
    </>
  )
}
