
import { useState, useRef, useMemo, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// Fix for default marker icon in React Leaflet
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const MapRecenter = ({ center }) => {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

export const LocationPickerModal = ({ isOpen, onClose, onSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation || null);
    const [address, setAddress] = useState("");
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Default center (Alaminos City, Pangasinan)
    const Alaminos = [16.1565, 119.9806];

    // Update position when initialLocation changes
    useEffect(() => {
        if (isOpen) {
            setPosition(initialLocation || null);
        }
    }, [isOpen, initialLocation]);

    const mapCenter = initialLocation ? [initialLocation.lat, initialLocation.lng] : Alaminos;

    useEffect(() => {
        if (position) {
            setLoadingAddress(true);
            setAddress("Fetching address...");

            // Artificial delay to prevent spamming if dragging (though it's click based now)
            const timer = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        // Prioritize Barangay (often mapped to village, neighbourhood, or hamlet in PH OSM)
                        const addr = data.address || {};
                        const barangay = addr.village || addr.neighbourhood || addr.hamlet || addr.quarter;
                        const city = addr.city || addr.town || addr.municipality;

                        if (barangay && city) {
                            setAddress(`${barangay}, ${city}`);
                        } else {
                            setAddress(data.display_name || "Address found");
                        }
                    })
                    .catch(err => {
                        console.error("Geocoding error:", err);
                        setAddress("Could not detect address");
                    })
                    .finally(() => setLoadingAddress(false));
            }, 500);

            return () => clearTimeout(timer);
        } else {
            setAddress("");
        }
    }, [position]);

    const handleConfirm = () => {
        if (position) {
            onSelect(position);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Location on Map" size="xl">
            <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mb-4 relative z-0">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapRecenter center={mapCenter} />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-col">
                    {position ? (
                        <>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {loadingAddress ? "Detecting location..." : address}
                            </span>
                            <span className="text-xs text-gray-500">
                                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                            </span>
                        </>
                    ) : (
                        <span>Click on the map to select a location</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!position}>Confirm Location</Button>
                </div>
            </div>
        </Modal>
    );
};
