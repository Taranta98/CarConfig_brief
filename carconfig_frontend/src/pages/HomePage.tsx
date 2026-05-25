import Header from '@/components/shadcn-studio/blocks/hero-section-41/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-41/hero-section-41'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'
import React from 'react'

export const vehicles = [
  {
    id: 1,
    name: 'Nissan Qashqai',
    model: 'Qashqai MY24',
    image:
      'https://www-europe.nissan-cdn.net/content/dam/Nissan/nissan_europe/Configurator/Qashqai-my24/configurator-webp/QQMC-ICE-N-Connecta.png.webp',
    co2_emissions: 142,
    base_price: 28900
  },
  {
    id: 2,
    name: 'Nissan Juke',
    model: 'Juke MY24',
    image:
      'https://www-europe.nissan-cdn.net/content/dam/Nissan/it/vehicles/juke-my24-assets-webp/24TDIEU_PS_JUKEMC_ICE_N-Design_RCF_001.webp',
    co2_emissions: 135,
    base_price: 24900
  },
  {
    id: 3,
    name: 'Hyundai Kona',
    model: 'Kona EV',
    image:
      'https://s7g10.scene7.com/is/image/hyundaiautoever/SX2_EV_calculator_asset_4x3:4x3?wid=960&hei=720&fmt=png-alpha&fit=wrap,1',
    co2_emissions: 0,
    base_price: 35900
  },
  {
    id: 4,
    name: 'Hyundai Tucson',
    model: 'Tucson HEV',
    image:
      'https://get-moba.com/app/uploads/2024/04/hyundai-tucson-hev-front-view-removebg-preview-1.png',
    co2_emissions: 121,
    base_price: 33900
  }
]



const HomePage = () => {





  return (
        <div className='overflow-x-hidden'>
      {/* Header Section */}
  

      {/* Main Content */}
      <main className='flex flex-col pt-17.5'>
        <HeroSection vehicles={vehicles} />
      </main>
    </div>
  )
}

export default HomePage