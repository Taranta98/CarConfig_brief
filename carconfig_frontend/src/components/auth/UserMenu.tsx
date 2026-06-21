import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthService } from "@/features/Auth/auth.service"
import { useAuthStore } from "@/features/Auth/auth.store"
import { getUserInitials } from "@/lib/userInitials"
import { LogOutIcon, SettingsIcon, LayoutListIcon } from "lucide-react"
import { Link, useNavigate } from "react-router"

const UserMenu = () => {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const initials = getUserInitials(user)

  async function handleLogout() {
    await AuthService.logout()
    navigate("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Menu utente"
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem render={<Link to="/settings" />}>
          <SettingsIcon />
          Profilo
        </DropdownMenuItem>
       
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
