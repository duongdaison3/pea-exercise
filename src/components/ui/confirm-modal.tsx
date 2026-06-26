import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react"

export type ConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'info',
  isLoading = false
}: ConfirmModalProps) {
  const isDanger = type === 'danger'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) onClose()
    }}>
      <DialogContent showCloseButton={true} className="sm:max-w-md p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3 rounded-full ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} ring-8 ${isDanger ? 'ring-red-50/50' : 'ring-blue-50/50'} mb-2`}>
            {isDanger ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </div>
          
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-2 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row w-full gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              className={`w-full font-semibold ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20 shadow-md text-white' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 shadow-md text-white'}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
