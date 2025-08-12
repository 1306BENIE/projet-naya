// import { motion } from 'framer-motion';
// import InputField from './InputField';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";

// const Colis = ({ 
//   formData,
//   handleInputChange,
//   formErrors,
//   dateLivraison,
//   setDateLivraison,
//   heureLivraison,
//   setHeureLivraison,
//   heuresLivraison // Ajout de la prop pour les heures de livraison
// }) => {

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
//         Détails du Colis
//       </motion.h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Description du Colis" 
//             name="nomColis" 
//             value={formData.nomColis} 
//             onChange={handleInputChange}
//             placeholder="Ex: Documents importants, Téléphone, Vêtements..." 
//             required 
//             error={formErrors.nomColis}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Type de Colis" 
//             name="typeColis" 
//             value={formData.typeColis} 
//             onChange={handleInputChange}
//             type="select"
//           >
//             <option value="Plis">Plis</option>
//             <option value="léger">Colis léger</option>
//             <option value="moyen">Colis moyen</option>
//             <option value="lourd">Colis lourd</option>
//           </InputField>
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Nombre de Colis" 
//             name="nombreColis" 
//             value={formData.nombreColis} 
//             onChange={handleInputChange}
//             type="number" 
//             min={1} 
//             required 
//             error={formErrors.nombreColis}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Poids (kg) (facultatif)" 
//             name="poids" 
//             value={formData.poids} 
//             onChange={handleInputChange}
//             placeholder="Ex: 2.5" 
//             type="number" 
//             min={0}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Dimensions (L x l x H cm) (facultatif)" 
//             name="dimensions" 
//             value={formData.dimensions} 
//             onChange={handleInputChange}
//             placeholder="Ex: 30x20x15"
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Valeur Déclarée (FCFA) (facultatif)" 
//             name="valeurColis" 
//             value={formData.valeurColis} 
//             onChange={handleInputChange}
//             placeholder="Ex: 15000" 
//             type="number" 
//             min={0} 
//             error={formErrors.valeurColis}
//           />
//         </motion.div>
        
//         <motion.div variants={itemVariants} className="md:col-span-2">
//           <label htmlFor="assurance" className="flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               id="assurance"
//               name="assurance"
//               checked={formData.assurance}
//               onChange={handleInputChange}
//               className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
//             />
//             <span className="ml-3 text-base font-medium text-gray-700">
//               Assurance (1% de la valeur déclarée, min. 500 FCFA)
//             </span>
//           </label>
//         </motion.div>
//       </div>
      
//       {/* Section pour la date et l'heure de livraison */}
//       <div className="mt-8 pt-6 border-t border-gray-200">
//         <motion.h3
//           variants={itemVariants}
//           className="text-2xl font-bold text-gray-800 pb-3 border-b-2 border-purple-200 mb-6"
//         >
//           Préférences de Livraison
//         </motion.h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <motion.div variants={itemVariants}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Date de Livraison <span className="text-red-500">*</span>
//             </label>
//             <DatePicker
//               selected={dateLivraison}
//               onChange={date => setDateLivraison(date)}
//               minDate={new Date()}
//               dateFormat="dd/MM/yyyy"
//               className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-100 ${formErrors.dateLivraison ? 'border-red-500' : 'border-gray-300'}`}
//             />
//             {formErrors.dateLivraison && (
//               <motion.p 
//                 initial={{ opacity: 0, height: 0 }} 
//                 animate={{ opacity: 1, height: "auto" }} 
//                 className="mt-2 text-sm text-red-600"
//               >
//                 {formErrors.dateLivraison}
//               </motion.p>
//             )}
//           </motion.div>

//           <motion.div variants={itemVariants}>
//             <InputField
//               label="Heure de Livraison" 
//               name="heureLivraison" 
//               value={heureLivraison} 
//               onChange={e => setHeureLivraison(e.target.value)}
//               type="select" 
//               required 
//               error={formErrors.heureLivraison}
//             >
//               {/* Utilisation de la prop heuresLivraison passée depuis ModalForm */}
//               {heuresLivraison.map(heure => (
//                 <option key={heure} value={heure}>{heure}</option>
//               ))}
//             </InputField>
//           </motion.div>

//           <motion.div variants={itemVariants} className="md:col-span-2">
//             <InputField
//               label="Instructions Spéciales (facultatif)" 
//               name="instructions" 
//               value={formData.instructions} 
//               onChange={handleInputChange}
//               placeholder="Ex: Livrer à la réception, contacter avant d'arriver..." 
//               type="textarea" 
//             />
//           </motion.div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default Colis;


import { motion } from 'framer-motion';
import InputField from './InputField';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const Colis = ({
  formData,
  handleInputChange,
  formErrors,
  dateLivraison,
  setDateLivraison,
  heureLivraison,
  setHeureLivraison,
  heuresLivraison
}) => {

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
        Détails du Colis
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <InputField
            label="Description du Colis"
            name="nomColis"
            value={formData.nomColis}
            onChange={handleInputChange}
            placeholder="Ex: Documents importants, Téléphone, Vêtements..."
            required
            error={formErrors.nomColis}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Type de Colis"
            name="typeColis"
            value={formData.typeColis}
            onChange={handleInputChange}
            type="select"
            error={formErrors.typeColis}
          >
            <option value="">Sélectionnez un type</option>
            <option value="Plis">Plis</option>
            <option value="léger">Colis léger</option>
            <option value="moyen">Colis moyen</option>
            <option value="lourd">Colis lourd</option>
          </InputField>
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Nombre de Colis"
            name="nombreColis"
            value={formData.nombreColis}
            onChange={handleInputChange}
            type="number"
            min={1}
            required
            error={formErrors.nombreColis}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Poids (kg) (facultatif)"
            name="poids"
            value={formData.poids}
            onChange={handleInputChange}
            placeholder="Ex: 2.5"
            type="number"
            min={0}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Dimensions (L x l x H cm) (facultatif)"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleInputChange}
            placeholder="Ex: 30x20x15"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Valeur Déclarée (FCFA) (facultatif)"
            name="valeurColis"
            value={formData.valeurColis}
            onChange={handleInputChange}
            placeholder="Ex: 15000"
            type="number"
            min={0}
            error={formErrors.valeurColis}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 flex items-start mt-4">
          <label htmlFor="assurance" className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              id="assurance"
              name="assurance"
              checked={formData.assurance}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-purple-600 rounded mt-1 focus:ring-purple-500"
            />
            <span className="ml-3 text-base font-medium text-gray-700">
              Assurance <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="inline-block"><FaInfoCircle className="inline-block ml-1 text-purple-400" /></motion.span>
              <p className="text-sm text-gray-500 font-normal mt-1">(1% de la valeur déclarée, min. 500 FCFA)</p>
            </span>
          </label>
        </motion.div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <motion.h3
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800 pb-3 border-b-2 border-purple-200 mb-6"
        >
          Préférences de Livraison
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-500" />
                Date de Livraison <span className="text-red-500">*</span>
              </div>
            </label>
            <DatePicker
              selected={dateLivraison}
              onChange={date => setDateLivraison(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy" 
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all duration-200 ease-in-out ${formErrors.dateLivraison ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.dateLivraison && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-sm text-red-600">
                {formErrors.dateLivraison}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Heure de Livraison"
              name="heureLivraison"
              value={heureLivraison}
              onChange={e => setHeureLivraison(e.target.value)}
              type="select"
              required
              error={formErrors.heureLivraison}
              placeholder="Sélectionnez une heure"
            >
              {heuresLivraison.map(heure => (
                <option key={heure} value={heure}>{heure}</option>
              ))}
            </InputField>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <InputField
              label="Instructions Spéciales (facultatif)"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Ex: Livrer à la réception, contacter avant d'arriver..."
              type="textarea"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Colis;