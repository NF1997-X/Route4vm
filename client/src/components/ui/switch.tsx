import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center !rounded-full border-0 backdrop-blur-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#34C759] data-[state=checked]:shadow-[0_0_20px_rgba(52,199,89,0.3)] data-[state=unchecked]:bg-gray-300/60 dark:data-[state=unchecked]:bg-gray-700/60",
      className
    )}
    {...props}
    ref={ref}
    style={{ borderRadius: '9999px' }}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[27px] w-[27px] !rounded-full bg-white backdrop-blur-xl shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06),inset_0_0_0_0.5px_rgba(0,0,0,0.04)] ring-0 transition-all duration-300 ease-out data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
      )}
      style={{ borderRadius: '9999px' }}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
