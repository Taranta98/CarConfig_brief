import { cn } from "@/lib/utils"
import type { ImgHTMLAttributes } from "react"

const LOGO_LIGHT_SRC = "/Logo_Nero.png"
const LOGO_DARK_SRC = "/Logo_Bianco.png"

type LogoProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** theme: black in light mode, white in dark mode */
  variant?: "theme" | "white"
}

const Logo = ({
  alt = "CARCONFIG",
  className,
  variant = "theme",
  ...props
}: LogoProps) => {
  if (variant === "white") {
    return (
      <img
        src={LOGO_DARK_SRC}
        alt={alt}
        className={cn("object-contain", className)}
        {...props}
      />
    )
  }

  return (
    <>
      <img
        src={LOGO_LIGHT_SRC}
        alt={alt}
        className={cn("object-contain dark:hidden", className)}
        {...props}
      />
      <img
        src={LOGO_DARK_SRC}
        alt={alt}
        className={cn("hidden object-contain dark:block", className)}
        {...props}
      />
    </>
  )
}

export default Logo
