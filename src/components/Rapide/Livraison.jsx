// import { motion } from 'framer-motion';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import LocationSearchInput from './LocationSearchInput';
// import SelectedLocationsDisplay from './SelectedLocationsDisplay';
// import InputField from './InputField';

// const Livraison = ({ 
//   searchQuery, 
//   setSearchQuery, 
//   searchResults, 
//   selectLocation, 
//   showDropdown, 
//   setShowDropdown,
//   selectedLocations,
//   removeLocation,
//   dateLivraison,
//   setDateLivraison,
//   heureLivraison,
//   setHeureLivraison,
//   formData,
//   handleInputChange,
//   formErrors
// }) => {
  
//   const heuresLivraison = Array.from({ length: 14 }, (_, i) => {
//     const heure = 8 + i;
//     return `${heure < 10 ? '0' + heure : heure}:00`;
//   });

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
//         Informations de Livraison
//       </motion.h3>

//       <motion.div variants={itemVariants}>
//         <LocationSearchInput
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           searchResults={searchResults}
//           selectLocation={selectLocation}
//           showDropdown={showDropdown}
//           setShowDropdown={setShowDropdown}
//           error={formErrors.zones}
//         />
//       </motion.div>

//       {selectedLocations.length > 0 && (
//         <motion.div variants={itemVariants}>
//           <SelectedLocationsDisplay
//             selectedLocations={selectedLocations}
//             removeLocation={removeLocation}
//           />
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <motion.div variants={itemVariants}>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Date de Livraison <span className="text-red-500">*</span>
//           </label>
//           <DatePicker
//             selected={dateLivraison}
//             onChange={date => setDateLivraison(date)}
//             minDate={new Date()}
//             dateFormat="dd/MM/yyyy"
//             className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-100 ${formErrors.dateLivraison ? 'border-red-500' : 'border-gray-300'}`}
//           />
//           {formErrors.dateLivraison && (
//             <motion.p 
//               initial={{ opacity: 0, height: 0 }} 
//               animate={{ opacity: 1, height: "auto" }} 
//               className="mt-2 text-sm text-red-600"
//             >
//               {formErrors.dateLivraison}
//             </motion.p>
//           )}
//         </motion.div>

//         <motion.div variants={itemVariants}>
//           <InputField
//             label="Heure de Livraison" 
//             name="heureLivraison" 
//             value={heureLivraison} 
//             onChange={e => setHeureLivraison(e.target.value)}
//             type="select" 
//             required 
//             error={formErrors.heureLivraison}
//           >
//             {heuresLivraison.map(heure => (
//               <option key={heure} value={heure}>{heure}</option>
//             ))}
//           </InputField>
//         </motion.div>

//         <motion.div variants={itemVariants} className="md:col-span-2">
//           <InputField
//             label="Instructions Spéciales (facultatif)" 
//             name="instructions" 
//             value={formData.instructions} 
//             onChange={handleInputChange}
//             placeholder="Ex: Livrer à la réception, contacter avant d'arriver..." 
//             type="textarea" 
//           />
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Livraison;



