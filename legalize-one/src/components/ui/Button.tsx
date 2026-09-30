import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'gold' | 'white' | 'outline' | 'outline-light' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-700 shadow-[0_10px_24px_-12px_rgb(11_49_88/0.7)]',
  gold: 'bg-gradient-to-b from-gold-400 to-gold-500 text-navy-950 hover:from-gold-400 hover:to-gold-400 shadow-[0_10px_24px_-12px_rgb(217_180_122/0.9)]',
  white: 'bg-white text-navy-950 hover:bg-sand',
  outline: 'border border-navy-950/15 bg-white text-navy-800 hover:border-navy-800/40 hover:bg-sand',
  'outline-light': 'border border-white/25 text-white hover:bg-white/10',
  ghost: 'text-navy-800 hover:bg-sand',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2.5',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

function classes({ variant = 'primary', size = 'md', className }: Omit<BaseProps, 'children'>) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

export function Button({ variant, size, className, children, ...rest }: BaseProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={classes({ variant, size, className })} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({ variant, size, className, children, ...rest }: BaseProps & LinkProps) {
  return (
    <Link className={classes({ variant, size, className })} {...rest}>
      {children}
    </Link>
  )
}

export function ButtonAnchor({ variant, size, className, children, ...rest }: BaseProps & ComponentPropsWithoutRef<'a'>) {
  return (
    <a className={classes({ variant, size, className })} {...rest}>
      {children}
    </a>
  )
}
