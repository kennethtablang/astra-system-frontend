// src/components/modals/AdminOrder/StoreSearchModal.jsx
import { useState, useEffect } from "react";
import { Search, Store as StoreIcon, CheckCircle, MapPin } from "lucide-react";
import { Modal } from "../../ui/Modal";
import storeService from "../../../services/storeService";

export const StoreSearchModal = ({ isOpen, onClose, onSelectStore }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSearchResults([]);
    }
  }, [isOpen]);

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (term.length >= 2) {
      setLoading(true);
      try {
        const result = await storeService.getStoresForLookup(term);
        if (result.success) {
          setSearchResults(result.data || []);
        }
      } catch (error) {
        console.error("Store search error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectStore = async (store) => {
    try {
      // Get full store details
      const result = await storeService.getStoreById(store.id);
      if (result.success) {
        onSelectStore(result.data);
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
      onSelectStore(store);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Store" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by store name or owner..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchTerm.length < 2 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Type at least 2 characters to search
            </p>
          ) : loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Searching...
            </p>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No stores found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((store) => (
                <button
                  key={store.id}
                  onClick={() => selectStore(store)}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <StoreIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {store.name}
                        </p>
                        {store.ownerName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Owner: {store.ownerName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {(store.barangayName || store.cityName) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-200">
                              <MapPin className="h-3 w-3" />
                              {store.barangayName && (
                                <span>{store.barangayName}</span>
                              )}
                              {store.barangayName && store.cityName && (
                                <span>, </span>
                              )}
                              {store.cityName && <span>{store.cityName}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
