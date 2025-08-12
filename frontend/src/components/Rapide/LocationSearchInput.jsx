import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const LocationSearchInput = ({ searchQuery, setSearchQuery, searchResults, selectLocation, showDropdown, setShowDropdown, error }) => {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  return (
    <motion.div 
      className="relative w-full" 
      ref={searchRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Zones de Livraison <span className="text-red-500">*</span>
      </label>
      <motion.input
        type="text"
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-100 transition-all duration-200 ease-in-out ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Rechercher une commune ou quartier"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        whileFocus={{
          scale: 1.005,
          boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.2)"
        }}
        whileHover={{ 
          scale: 1.005,
          boxShadow: "0 4px 10px rgba(249, 115, 22, 0.1)" 
        }}
      />

      <AnimatePresence>
        {showDropdown && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          >
            {searchResults.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ backgroundColor: "#fef3c7" }}
                className="px-4 py-3 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0 text-gray-800"
                onClick={() => selectLocation(item)}
              >
                <span>{item.displayName}</span>
                <motion.span
                  className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {item.price} FCFA
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LocationSearchInput;

