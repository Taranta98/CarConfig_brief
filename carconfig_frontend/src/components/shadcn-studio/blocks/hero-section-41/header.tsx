import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'

import { ArrowRight, MenuIcon, MoonIcon, SunIcon } from 'lucide-react'

import Logo from '@/components/Logo'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserMenu from '@/components/auth/UserMenu'
import { useAuthStore } from '@/features/Auth/auth.store'
import { scrollToTop } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router'

type NavItem = {
  key: string
  title: string
  href: string
}

type HeaderProps = {
  className?: string
}

function getResolvedTheme(theme: string) {
  if (theme === 'dark' || theme === 'light') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const Header = ({ className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = Boolean(token)
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const isDark = getResolvedTheme(theme) === 'dark'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { key: 'models', title: 'Modelli', href: '/' },
      { key: 'configuration', title: 'Configuratore', href: '/configuration' },
    ]

    if (isLoggedIn) {
      items.push({
        key: 'my-configurations',
        title: 'Le mie configurazioni',
        href: '/my-configurations',
      })
    }

    if (isAdmin) {
      items.push({
        key: 'admin',
        title: 'Area admin',
        href: '/admin',
      })
    }

    return items
  }, [isLoggedIn, isAdmin])

  const isNavActive = useCallback(
    (href: string) => {
      if (href === '/') return location.pathname === '/'
      return location.pathname.startsWith(href)
    },
    [location.pathname]
  )

  const handleModelsClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (location.pathname !== '/') return
      event.preventDefault()
      scrollToTop()
    },
    [location.pathname]
  )

  const navLinkClass = (active: boolean) =>
    cn(
      'relative whitespace-nowrap px-1 py-4 text-[13px] font-medium uppercase tracking-[0.1em] transition-colors',
      active
        ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground after:content-[""]'
        : 'text-muted-foreground hover:text-foreground'
    )

  const renderNavLink = (item: NavItem, className?: string) => (
    <Link
      key={item.key}
      to={item.href}
      onClick={item.key === 'models' ? handleModelsClick : undefined}
      className={cn(navLinkClass(isNavActive(item.href)), className)}
    >
      {item.title}
    </Link>
  )

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-lg'
          : 'border-b border-border/50 bg-background/85 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            to="/"
            onClick={handleModelsClick}
            className="group flex min-w-0 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Logo className="size-10 shrink-0 sm:size-11" alt="" aria-hidden />
            <span className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-[15px] font-semibold leading-none tracking-tight">
                Car Config
              </span>
              <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Configuratore online
              </span>
            </span>
          </Link>
        </div>

        <nav
          aria-label="Navigazione principale"
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) => renderNavLink(item))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
          >
            {isDark ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
            <span className="sr-only">Cambia tema</span>
          </Button>

          {!isLoggedIn && (
            <Button
              size="sm"
              className="hidden rounded-full px-4 sm:inline-flex"
              render={<Link to="/configuration" />}
              nativeButton={false}
            >
              Inizia configurazione
              <ArrowRight className="size-3.5" />
            </Button>
          )}

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-full text-muted-foreground hover:text-foreground sm:inline-flex"
              render={<Link to="/auth/login" />}
              nativeButton={false}
            >
              Accedi
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full border-border/60"
              >
                <MenuIcon className="size-4" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {!isLoggedIn && (
                <>
                  <DropdownMenuItem
                    render={<Link to="/configuration" />}
                    className="font-medium"
                  >
                    Inizia configurazione
                    <ArrowRight className="ms-auto size-3.5" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  render={
                    <Link
                      to={item.href}
                      onClick={
                        item.key === 'models' ? handleModelsClick : undefined
                      }
                    />
                  }
                  className={cn(isNavActive(item.href) && 'bg-muted font-medium')}
                >
                  {item.title}
                </DropdownMenuItem>
              ))}
              {!isLoggedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link to="/auth/login" />}>
                    Accedi
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link to="/auth/register" />}>
                    Registrati
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
