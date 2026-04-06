
import {motion} from 'framer-motion'

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <motion.div
        className="h-12 w-12 border-4 border-ink border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </div>
  );
}

export default LoadingSpinner
