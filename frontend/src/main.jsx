import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



//   const [showModal, setShowModal] = useState(false);

//   return (
//     <motion.main 
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden"
//     >
//       {/* Feuilles flottantes en arrière-plan */}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute text-green-300 text-4xl opacity-40"
//           style={{
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//           }}
//           animate={{
//             y: [0, -30, 0],
//             x: [0, (i % 2 === 0 ? -1 : 1) * 20, 0],
//             rotate: [0, (i % 2 === 0 ? -1 : 1) * 15, 0],
//           }}
//           transition={{
//             duration: 8 + Math.random() * 4,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         >
//           🍃
//         </motion.div>
//       ))}

//       <div className="container mx-auto py-16 px-4 flex flex-col items-center relative z-10">
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.7 }}
//           className="text-center max-w-2xl"
//         >
//           <motion.h1 
//             animate={{
//               textShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(110,231,183,0.5)", "0 0 0px rgba(0,0,0,0)"],
//               scale: [1, 1.02, 1]
//             }}
//             transition={{ 
//               duration: 1.5,
//               repeat: Infinity,
//               repeatType: "reverse"
//             }}
//             className="text-4xl md:text-5xl font-bold text-emerald-900 mb-6"
//           >
//             Livraison Chez NAYA
//           </motion.h1>
          
//           <motion.p 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4, duration: 0.7 }}
//             className="text-lg text-emerald-600 mb-4 text-center"
//           >
//             Commandez en toute simplicité avec notre formulaire intuitif
//           </motion.p>

//           {/* Icône centrée avec animation pompe */}
//           <div className="flex justify-center w-full my-4">
//             <motion.div
//               animate={{
//                 y: [0, -15, 0],
//                 scale: [1, 1.3, 1],
//                 rotate: [0, 10, 0]
//               }}
//               transition={{
//                 duration: 1.8,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//                 repeatType: "reverse"
//               }}
//               className="text-emerald-500 text-3xl"
//             >
//               <ImPointDown />
//             </motion.div>
//           </div>

//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             className="flex justify-center"
//           >
//             <motion.button
//               whileHover={{ 
//                 background: "linear-gradient(to right, rgb(187,247,208), rgb(134,239,172))",
//                 boxShadow: "0 5px 20px rgba(110,231,183,0.4)"
//               }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setShowModal(true)}
//               className="bg-gradient-to-r from-emerald-300 to-emerald-700 text-white
//                 font-bold text-lg py-4 px-10 rounded-full shadow-lg relative overflow-hidden"
//             >
//               <span className="relative z-10">Commencer une livraison</span>
              
//               {/* Effet de pompe infini */}
//               <motion.div 
//                 className="absolute inset-0 rounded-full z-0"
//                 animate={{ 
//                   opacity: [0, 0.7, 0],
//                   scale: [1, 1.5, 2],
//                 }}
//                 transition={{ 
//                   duration: 2,
//                   repeat: Infinity,
//                   ease: "easeOut"
//                 }}
//                 style={{
//                   background: "radial-gradient(circle, rgba(110,231,183,0.8) 0%, rgba(110,231,183,0) 70%)"
//                 }}
//               />
              
//               {/* Effet de particules au survol */}
//               <motion.div
//                 className="absolute inset-0"
//                 whileHover={{
//                   opacity: 1,
//                 }}
//                 initial={{ opacity: 0 }}
//               >
//                 {[...Array(12)].map((_, i) => (
//                   <motion.span
//                     key={i}
//                     className="absolute text-emerald-300 text-xl"
//                     style={{
//                       left: `${Math.random() * 100}%`,
//                       top: `${Math.random() * 100}%`,
//                     }}
//                     animate={{
//                       y: [0, -40],
//                       x: [0, (i % 2 === 0 ? -1 : 1) * 20],
//                       opacity: [1, 0],
//                       scale: [1, 0.5],
//                     }}
//                     transition={{
//                       duration: 1.5,
//                       repeat: Infinity,
//                       delay: i * 0.1,
//                     }}
//                   >
//                     ✨
//                   </motion.span>
//                 ))}
//               </motion.div>
//             </motion.button>
//           </motion.div>
//         </motion.div>       
        
//         <motion.div 
//           className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6, duration: 0.7 }}
//         >
//           {[
//             { 
//               title: "Rapide", 
//               description: "Livraison en moins de 24h dans toute la ville", 
//               icon: "⏱️" 
//             },
//             { 
//               title: "Sécurisé", 
//               description: "Assurance et suivi en temps réel", 
//               icon: "🛡️" 
//             },
//             { 
//               title: "Fiable", 
//               description: "Des milliers de clients satisfaits", 
//               icon: "⭐" 
//             }
//           ].map((feature, index) => (
//             <motion.div
//               key={index}
//               className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100"
//               whileHover={{ 
//                 y: -10, 
//                 boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
//                 borderColor: "rgb(110,231,183)"
//               }}
//               transition={{ type: "spring", stiffness: 300 }}
//               animate={{
//                 borderWidth: [1, 2, 1]
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity
//               }}
//             >
//               <motion.div
//                 className="text-4xl mb-4"
//                 whileHover={{ 
//                   scale: 1.2,
//                   rotate: [0, 10, -10, 0],
//                   transition: { duration: 0.5 }
//                 }}
//               >
//                 {feature.icon}
//               </motion.div>
//               <h3 className="text-xl font-bold text-emerald-700 mb-2">{feature.title}</h3>
//               <p className="text-gray-600">{feature.description}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>

//       {showModal && <ModalForm onClose={() => setShowModal(false)} />}
      
//       {/* Vague animée en bas de page */}
//       <motion.div 
//         className="absolute bottom-0 left-0 w-full"
//         animate={{ y: [0, 10, 0] }}
//         transition={{ duration: 5, repeat: Infinity }}
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
//           <path 
//             fill="#dcfce7" 
//             fillOpacity="0.8" 
//             d="M0,128L60,138.7C120,149,240,171,360,170.7C480,171,600,149,720,133.3C840,117,960,107,1080,112C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
//           ></path>
//         </svg>
//       </motion.div>
      
//       <motion.footer 
//         className="py-6 text-center text-emerald-800 mt-auto relative z-10"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 0.5 }}
//       >
//         © {new Date().getFullYear()} LIVVIT - Tous droits réservés
//       </motion.footer>
//     </motion.main>
//   );
// };