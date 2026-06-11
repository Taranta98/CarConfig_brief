import { useCallback, useEffect, useMemo, useState } from 'react'

import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react'

import Logo from '@/components/Logo'
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
import {
  COME_FUNZIONA_SECTION_ID,
  scrollToSection,
  scrollToTop,
} from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { Link, useLocation, useNavigate } from 'react-router'

type NavItem =
  | { key: string; title: string; type: 'link'; href: string }
  | { key: string; title: string; type: 'action'; onClick: () => void }

type HeaderProps = {
  className?: string
}

const Header = ({ className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = Boolean(token)
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null

    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      const initial = prefersDark ? 'dark' : 'light'

      setTheme(initial)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const goToHome = useCallback(() => {
    if (location.pathname === '/') {
      navigate('/', { replace: true })
      scrollToTop()
      return
    }

    navigate('/')
  }, [location.pathname, navigate])

  const goToComeFunziona = useCallback(() => {
    if (location.pathname === '/') {
      if (document.getElementById(COME_FUNZIONA_SECTION_ID)) {
        navigate(
          { pathname: '/', hash: COME_FUNZIONA_SECTION_ID },
          { replace: true }
        )
        requestAnimationFrame(() => scrollToSection(COME_FUNZIONA_SECTION_ID))
      } else {
        navigate('/', {
          state: { scrollTo: COME_FUNZIONA_SECTION_ID },
          replace: true,
        })
      }
      return
    }

    navigate('/', { state: { scrollTo: COME_FUNZIONA_SECTION_ID } })
  }, [location.pathname, navigate])

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { key: 'home', title: 'Home', type: 'action', onClick: goToHome },
      {
        key: 'how-it-works',
        title: 'Come funziona',
        type: 'action',
        onClick: goToComeFunziona,
      },
    ]

    if (isLoggedIn) {
      items.push(
        {
          key: 'configuration',
          title: 'Configuratore',
          type: 'link',
          href: '/configuration',
        },
        {
          key: 'my-configurations',
          title: 'Le mie configurazioni',
          type: 'link',
          href: '/my-configurations',
        }
      )
    }

    if (isAdmin) {
      items.push({
        key: 'admin',
        title: 'Pannello admin',
        type: 'link',
        href: '/admin',
      })
    }

    return items
  }, [isLoggedIn, isAdmin, goToHome, goToComeFunziona])

  const isNavActive = (href: string) => location.pathname === href

  const isHomeActive =
    location.pathname === '/' &&
    location.hash !== `#${COME_FUNZIONA_SECTION_ID}`

  const isComeFunzionaActive =
    location.pathname === '/' &&
    location.hash === `#${COME_FUNZIONA_SECTION_ID}`

  const navLinkClass = (active: boolean) =>
    cn(
      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'bg-primary/10 text-foreground'
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
    )

  const renderNavItem = (item: NavItem, className?: string) => {
    if (item.type === 'action') {
      const active =
        (item.key === 'home' && isHomeActive) ||
        (item.key === 'how-it-works' && isComeFunzionaActive)
      return (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className={cn(navLinkClass(active), className)}
        >
          {item.title}
        </button>
      )
    }

    return (
      <Link
        key={item.key}
        to={item.href}
        className={cn(navLinkClass(isNavActive(item.href)), className)}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md'
          : 'border-b border-border/40 bg-background/70 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex h-17.5 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          to="/"
          onClick={(event) => {
            event.preventDefault()
            goToHome()
          }}
          className="group flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex size-16 items-center justify-center rounded-xl border border-border/60 bg-card/80 shadow-sm transition-colors group-hover:border-primary/30">
            <Logo className="size-12" alt="" aria-hidden />
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-base font-semibold leading-tight tracking-tight">
              Car Config
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigazione principale"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button
            size="icon"
            variant="outline"
            className="size-9 rounded-full border-border/60 bg-background/80"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
            <span className="sr-only">Cambia tema</span>
          </Button>

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden rounded-full sm:inline-flex"
                render={<Link to="/auth/login" />}
                nativeButton={false}
              >
                Accedi
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hidden rounded-full border-border/60 sm:inline-flex"
                render={<Link to="/auth/register" />}
                nativeButton={false}
              >
                Registrati
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full border-border/60 bg-background/80"
              >
                <MenuIcon className="size-4" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) =>
                item.type === 'action' ? (
                  <DropdownMenuItem
                    key={item.key}
                    onClick={item.onClick}
                    className={cn(
                      ((item.key === 'home' && isHomeActive) ||
                        (item.key === 'how-it-works' && isComeFunzionaActive)) &&
                        'bg-muted'
                    )}
                  >
                    {item.title}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={item.key}
                    render={<Link to={item.href} />}
                    className={cn(isNavActive(item.href) && 'bg-muted')}
                  >
                    {item.title}
                  </DropdownMenuItem>
                )
              )}
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
