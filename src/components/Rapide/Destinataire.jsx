// import { motion } from 'framer-motion';
// import InputField from './InputField';

// const Destinataire = ({ formData, handleInputChange, formErrors }) => {
//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         type: "spring",
//         stiffness: 120,
//         damping: 15
//       }
//     }
//   };

//   return (
//     <motion.div 
//       className="space-y-6"
//       initial="hidden"
//       animate="visible"
//       variants={{
//         visible: {
//           transition: { staggerChildren: 0.1 }
//         }
//       }}
//     >
//       <motion.h3
//         variants={itemVariants}
//         className="text-2xl font-bold text-gray-800 pb-3 border-b-2 border-purple-200 mb-6"
//       >
//         Détails du Destinataire
//       </motion.h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Nom complet"
//             name="nomDest"
//             value={formData.nomDest}
//             onChange={handleInputChange}
//             placeholder="Nom complet"
//             required
//             error={formErrors.nomDest}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Téléphone"
//             name="numDest"
//             value={formData.numDest}
//             onChange={handleInputChange}
//             placeholder="+225 0X XX XX XX XX"
//             type="tel"
//             required
//             error={formErrors.numDest}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants} className="md:col-span-2">
//           <InputField
//             label="Adresse Complète"
//             name="adresseDest"
//             value={formData.adresseDest}
//             onChange={handleInputChange}
//             placeholder="Commune, Quartier, Rue, Immeuble, Numéro de porte..."
//             type="textarea"
//             required
//             error={formErrors.adresseDest}
//           />
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Destinataire;






import { motion } from 'framer-motion';
import InputField from './InputField';

const Destinataire = ({ formData, handleInputChange, formErrors }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.h3
        variants={itemVariants}
        className="text-2xl font-bold text-gray-800 pb-3 border-b-2 border-purple-200 mb-6"
      >
        Détails du Destinataire
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <InputField
            label="Nom complet"
            name="nomDest"
            value={formData.nomDest}
            onChange={handleInputChange}
            placeholder="Nom complet"
            required
            error={formErrors.nomDest}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Téléphone"
            name="numDest"
            value={formData.numDest}
            onChange={handleInputChange}
            placeholder="0X XXX XXX XX XX"
            type="tel"
            required
            error={formErrors.numDest}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <InputField
            label="Adresse Complète"
            name="adresseDest"
            value={formData.adresseDest}
            onChange={handleInputChange}
            placeholder="Commune, Quartier, Rue, Immeuble, Numéro de porte..."
            type="textarea"
            required
            error={formErrors.adresseDest}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Destinataire;
