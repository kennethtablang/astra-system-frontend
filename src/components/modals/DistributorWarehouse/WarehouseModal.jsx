// src/components/modals/DistributorWarehouse/WarehouseModal.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, MapPin } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/Loading";

const warehouseSchema = z.object({
    name: z.string().min(1, "Warehouse name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, "Invalid latitude"),
    longitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, "Invalid longitude"),
    isActive: z.boolean().default(true),
});

const WarehouseModal = ({ isOpen, onClose, warehouse, onSave }) => {
    const isEditing = !!warehouse;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(warehouseSchema),
        defaultValues: {
            name: "",
            address: "",
            latitude: "",
            longitude: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (warehouse) {
                setValue("name", warehouse.name);
                setValue("address", warehouse.address || "");
                setValue("latitude", warehouse.latitude?.toString() || "");
                setValue("longitude", warehouse.longitude?.toString() || "");
                setValue("isActive", warehouse.isActive ?? true);
            } else {
                reset({
                    name: "",
                    address: "",
                    latitude: "",
                    longitude: "",
                    isActive: true,
                });
            }
        }
    }, [isOpen, warehouse, setValue, reset]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
        };
        await onSave(payload);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        {isEditing ? "Edit Warehouse" : "Add Warehouse"}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Warehouse Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Enter warehouse name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <textarea
                                                {...register("address")}
                                                rows="2"
                                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                                placeholder="Enter full address"
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                                        )}
                                    </div>

                                    {/* Location Coodinates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Latitude
                                            </label>
                                            <input
                                                type="text"
                                                {...register("latitude")}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="e.g. 14.5995"
                                            />
                                            {errors.latitude && (
                                                <p className="mt-1 text-sm text-red-500">{errors.latitude.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Longitude
                                            </label>
                                            <input
                                                type="text"
                                                {...register("longitude")}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="e.g. 120.9842"
                                            />
                                            {errors.longitude && (
                                                <p className="mt-1 text-sm text-red-500">{errors.longitude.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Active Status
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register("isActive")}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <LoadingSpinner size="sm" /> : isEditing ? "Save Changes" : "Create Warehouse"}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default WarehouseModal;
