import { motion, AnimatePresence } from 'framer-motion';

const SelectedLocationsDisplay = ({ selectedLocations, removeLocation }) => {
  const tagVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="mt-4 flex flex-wrap gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {selectedLocations.map((location) => (
          <motion.div
            key={location.id}
            variants={tagVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center shadow-sm text-sm font-medium"
          >
            <span>{location.displayName}</span>
            <span className="ml-2 font-semibold">{location.price} FCFA</span>
            <motion.button
              type="button"
              onClick={() => removeLocation(location.id)}
              className="ml-2 text-orange-600 hover:text-orange-900 transition-colors"
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.8 }}
              aria-label={`Supprimer ${location.displayName}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SelectedLocationsDisplay;


// const SelectedLocationsDisplay = ({ selectedLocations, removeLocation }) => {
//     const tagVariants = {
//       hidden: { scale: 0, opacity: 0 },
//       visible: {
//         scale: 1,
//         opacity: 1,
//         transition: { type: "spring", stiffness: 300, damping: 20 }
//       },
//       exit: {
//         scale: 0,
//         opacity: 0,
//         transition: { duration: 0.2 }
//       }
//     };
  
//     return (
//       <motion.div className="mt-4 flex flex-wrap gap-3" variants={{
//         visible: {
//           transition: {
//             staggerChildren: 0.05
//           }
//         }
//       }}>
//         <AnimatePresence>
//           {selectedLocations.map((location) => (
//             <motion.div
//               key={location.id}
//               variants={tagVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="bg-orange-100 text-orange-800 px-4 py-2 
//               rounded-full flex items-center shadow-sm text-sm font-medium"
//             >
//               <span>{location.displayName}</span>
//               <span className="ml-2 font-semibold">{location.price} FCFA</span>
//               <motion.button
//                 type="button"
//                 onClick={() => removeLocation(location.id)}
//                 className="ml-2 text-orange-600 hover:text-orange-900 transition-colors"
//                 whileHover={{ scale: 1.2, rotate: 90 }}
//                 whileTap={{ scale: 0.8 }}
//                 aria-label={`Supprimer ${location.displayName}`}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </motion.button>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </motion.div>
//     );
//   };