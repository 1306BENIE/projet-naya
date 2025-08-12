// import { motion } from 'framer-motion';
// import InputField from './InputField';

// const Expediteur = ({ formData, handleInputChange, formErrors, user }) => {
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
//         Détails de l'Expéditeur
//       </motion.h3>

//       {user && (
//         <motion.div variants={itemVariants} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//           <p className="text-blue-800 font-medium">
//             <span className="font-bold">Utilisateur connecté:</span> {user.fullName} ({user.clientCode})
//           </p>
//           <p className="text-blue-700">Vos informations ont été pré-remplies</p>
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Nom complet"
//             name="nomExp"  
//             value={formData.nomExp} 
//             onChange={handleInputChange}
//             placeholder="Nom complet"
//             required
//             error={formErrors.nomExp} 
//           />
//         </motion.div> 
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Téléphone"
//             name="numExp"
//             value={formData.numExp}
//             onChange={handleInputChange}
//             placeholder="+225 0X XX XX XX XX"
//             type="tel"
//             required
//             error={formErrors.numExp}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants} className="md:col-span-2">
//           <InputField
//             label="Adresse de l'expéditeur"
//             name="adresseExp"
//             value={formData.adresseExp}
//             onChange={handleInputChange}
//             placeholder="Adresse complète (rue, numéro, ville)"
//             type="textarea"
//             required
//             error={formErrors.adresseExp}
//           />
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Expediteur;




import { motion } from 'framer-motion';
import InputField from './InputField';

const Expediteur = ({ formData, handleInputChange, formErrors, user }) => {
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
        Détails de l'Expéditeur
      </motion.h3>

      {user && (
        <motion.div variants={itemVariants} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">
            <span className="font-bold">Utilisateur connecté:</span> {user.fullName} ({user.clientCode})
          </p>
          <p className="text-blue-700">Vos informations ont été pré-remplies</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <InputField
            label="Nom complet"
            name="nomExp"
            value={formData.nomExp}
            onChange={handleInputChange}
            placeholder="Nom complet"
            required
            error={formErrors.nomExp}
            disabled={!!user} // Désactive le champ si l'utilisateur est connecté
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Téléphone"
            name="numExp"
            value={formData.numExp}
            onChange={handleInputChange}
            placeholder="0X XXX XXX XX XX"
            type="tel"
            required
            error={formErrors.numExp}
            disabled={!!user} // Désactive le champ si l'utilisateur est connecté
          />
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <InputField
            label="Adresse de l'expéditeur"
            name="adresseExp"
            value={formData.adresseExp}
            onChange={handleInputChange}
            placeholder="Adresse complète (rue, numéro, ville)"
            type="textarea"
            required
            error={formErrors.adresseExp}
            disabled={!!user} // Désactive le champ si l'utilisateur est connecté
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Expediteur;