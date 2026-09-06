import { CheckCircle, XCircle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

export default function ToastStack(): JSX.Element {
  const { toast, hideToast } = useStore()
  const icons = {
    success: <CheckCircle size={15} style={{ color: 'var(--success)' }} />,
    error: <XCircle size={15} style={{ color: 'var(--danger)' }} />,
    info: <Info size={15} style={{ color: 'var(--accent-light)' }} />
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={hideToast}
        >
          {icons[toast.type]}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
