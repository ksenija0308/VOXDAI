import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-[#e9ebef] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#717182]",
          actionButton:
            "group-[.toast]:bg-[#0B3B2E] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#f3f3f5] group-[.toast]:text-[#717182]",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200",
          success: "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
