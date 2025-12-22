import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Search, Store, MapPin, Plus } from "lucide-react";
import api from "../../../api/axios";
import { CreateStoreModal } from "./CreateStoreModal";

export const StoreSelectionModal = ({
    isOpen,
    onClose,
    onSelectStore,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createStoreOpen, setCreateStoreOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStores();
        }
    }, [isOpen, searchTerm]);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/store/lookup", {
                params: { searchTerm },
            });
            if (data.success) {
                setStores(data.data || []);
            }
        } catch (error) {
            console.error("Failed to load stores:", error);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStore = (store) => {
        onSelectStore(store);
        onClose();
    };

    const handleStoreCreated = (newStore) => {
        // Add new store to the list and select it
        setStores((prev) => [newStore, ...prev]);
        handleSelectStore(newStore);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Select Store"
                size="lg"
            >
                <div className="space-y-4">
                    {/* Search Input */}
                    <Input
                        placeholder="Search stores by name, location, or owner..."
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Create New Store Button */}
                    <Button
                        variant="outline"
                        onClick={() => setCreateStoreOpen(true)}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Store
                    </Button>

                    {/* Store List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Loading stores...
                                </p>
                            </div>
                        ) : stores.length > 0 ? (
                            stores.map((store) => (
                                <div
                                    key={store.id}
                                    onClick={() => handleSelectStore(store)}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {store.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {store.barangayName}, {store.cityName}
                                                </span>
                                            </div>
                                            {store.ownerName && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Owner: {store.ownerName}
                                                </p>
                                            )}
                                            {store.storeType && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                                                    {store.storeType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg
                                                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Store className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 mb-1">
                                    No stores found
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {searchTerm
                                        ? "Try a different search term"
                                        : "Create a new store to get started"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Create Store Modal */}
            <CreateStoreModal
                isOpen={createStoreOpen}
                onClose={() => setCreateStoreOpen(false)}
                onSuccess={handleStoreCreated}
            />
        </>
    );
};
