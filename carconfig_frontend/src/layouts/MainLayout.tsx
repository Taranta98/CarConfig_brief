
import Header from "@/components/shadcn-studio/blocks/hero-section-41/header"
import type { NavigationSection } from "@/components/shadcn-studio/blocks/menu-navigation"

import { Outlet } from "react-router"


  const navigationData: NavigationSection[] = [
  {
    title: 'About Us',
    href: '#'
  },
  {
    title: 'Testimonials',
    href: '#'
  },
  {
    title: 'Contact us',
    href: '#'
  },
  {
    title: 'Offers',
    href: '#'
  }
]

const WebsiteLayout = () => {


  return (
    <>
      <Header navigationData={navigationData} />
      <Outlet />
       
     
    </>
  )
}

export default WebsiteLayout