import { useEffect, useState } from 'react'

import {
  CalendarClockIcon,
  MenuIcon,
  SunIcon,
  MoonIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import MenuDropdown from '@/components/shadcn-studio/blocks/menu-dropdown'
import MenuNavigation from '@/components/shadcn-studio/blocks/menu-navigation'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'
import { cn } from '@/lib/utils'
import BistroLogo from '@/assets/svg/bistro-logo'
import { Link } from 'react-router'

type HeaderProps = {
  navigationData: NavigationSection[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ---------------- INIT THEME ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null

    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = prefersDark ? 'dark' : 'light'

      setTheme(initial)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  /* ---------------- TOGGLE ---------------- */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-50 h-17.5 w-full border-b transition-all duration-300',
        {
          'bg-background shadow-md': isScrolled
        },
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/Logo.png" alt="CarConfig" className="w-10 h-10" />
          <span className="text-primary text-[20px] font-semibold">
            CarConfig
          </span>
        </Link>

        {/* NAVIGATION */}
        <MenuNavigation
          navigationData={navigationData}
          className="max-lg:hidden [&_[data-slot=navigation-menu-list]]:gap-1"
        />

        {/* ACTIONS */}
        <div className="flex items-center gap-3">

          {/* DARK MODE BUTTON */}
          <Button
            size="icon"
            variant="outline"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}

            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* BOOK BUTTON */}
          <Button
            className="rounded-full max-sm:hidden"
            render={<a href="#" />}
            nativeButton={false}
          >
           Accedi
          </Button>

          {/* MOBILE ACTIONS */}
          <div className="flex gap-3">

            <Button
              size="icon"
              className="rounded-full sm:hidden"
              render={<a href="#" />}
              nativeButton={false}
            >
              <CalendarClockIcon />
              <span className="sr-only">Accedi</span>
            </Button>

            <MenuDropdown
              align="end"
              navigationData={navigationData}
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full lg:hidden"
                >
                  <MenuIcon />
                  <span className="sr-only">Menu</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header