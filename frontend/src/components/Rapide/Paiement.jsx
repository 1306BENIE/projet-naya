

// import React from 'react';

// const Paiement = ({ formData, handleInputChange, formErrors, montant, setMontant }) => {
//   return (
//     <div className="space-y-4">
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Montant total (FCFA) <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="number"
//           value={montant}
//           onChange={(e) => setMontant(Number(e.target.value))}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           min="0"
//         />
//         {formErrors.montant && (
//           <p className="mt-1 text-sm text-red-600">{formErrors.montant}</p>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Mode de paiement <span className="text-red-500">*</span>
//         </label>
//         <select
//           name="modePaiement"
//           value={formData.modePaiement}
//           onChange={handleInputChange}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md"
//         >
//           <option value="espèces">Espèces</option>
//           <option value="mobile money">Mobile Money</option>
//         </select>
//       </div>

//       {formData.modePaiement === 'mobile money' && (
//         <div className="space-y-4">
//           <InputField 
//             label="Numéro de téléphone Mobile Money"
//             name="telephoneWave"
//             value={formData.telephoneWave}
//             onChange={handleInputChange}
//             required
//             error={formErrors.telephoneWave}
//           />
          
//           <InputField 
//             label="Référence de transaction"
//             name="referenceWave"
//             value={formData.referenceWave}
//             onChange={handleInputChange}
//             required
//             error={formErrors.referenceWave}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Paiement;