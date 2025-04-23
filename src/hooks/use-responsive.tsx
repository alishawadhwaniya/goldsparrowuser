import * as React from "react"

// Match breakpoints from theme.ts and add xs breakpoint
const BREAKPOINTS = {
  xs: 400,  // Added extra small breakpoint
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536 // Added 2xl breakpoint for larger screens
}

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export function useBreakpoint(breakpoint: Breakpoint) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
    const onChange = () => {
      setMatches(mql.matches)
    }

    mql.addEventListener("change", onChange)
    setMatches(mql.matches) // Set initial value

    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return matches
}

// Keep the original useIsMobile for backward compatibility
export function useIsMobile() {
  const matches = useBreakpoint('md')
  return !matches
}

// More complex hook for multiple breakpoints
export function useResponsive() {
  const isXs = useBreakpoint('xs')
  const isSm = useBreakpoint('sm')
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')
  const isXl = useBreakpoint('xl')
  const is2Xl = useBreakpoint('2xl')

  return {
    isExtraSmall: !isXs,       // Below 400px
    isMobile: !isMd,           // Below 768px
    isTablet: isMd && !isLg,   // Between 768px and 1024px
    isDesktop: isLg,           // 1024px and above
    isLargeDesktop: isXl,      // 1280px and above
    isExtraLargeDesktop: is2Xl, // 1536px and above

    // Current breakpoint name
    current: !isXs ? 'xxs' : !isSm ? 'xs' : !isMd ? 'sm' : !isLg ? 'md' : !isXl ? 'lg' : !is2Xl ? 'xl' : '2xl'
  }
}

// New hook for specific device size ranges
export function useDeviceSize() {
  const responsive = useResponsive()

  return {
    isSmallPhone: responsive.isExtraSmall, // Below 400px (very small phones)
    isPhone: !responsive.isExtraSmall && responsive.isMobile, // 400px-767px (regular phones)
    isTablet: responsive.isTablet, // 768px-1023px (tablets)
    isLaptop: responsive.isDesktop && !responsive.isLargeDesktop, // 1024px-1279px (laptops)
    isDesktop: responsive.isLargeDesktop && !responsive.isExtraLargeDesktop, // 1280px-1535px (desktops)
    isLargeDisplay: responsive.isExtraLargeDesktop, // 1536px and above (large displays)
    currentSize: responsive.current
  }
}