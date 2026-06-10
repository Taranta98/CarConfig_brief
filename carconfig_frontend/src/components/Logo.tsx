import { cn } from "@/lib/utils"
import type { ImgHTMLAttributes } from "react"

const LOGO_SRC = "/Logo-removebg-preview.png"

type LogoProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** theme: black in light mode, white in dark mode */
  variant?: "theme" | "white"
}

const Logo = ({
  alt = "Car Config",
  className,
  variant = "theme",
  ...props
}: LogoProps) => {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={cn(
        "object-contain",
        variant === "theme" && "brightness-0 dark:brightness-100",
        className
      )}
      {...props}
    />
  )
}

export default Logo
