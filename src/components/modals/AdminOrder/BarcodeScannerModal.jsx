// src/components/modals/AdminOrder/BarcodeScannerModal.jsx
import { useState, useRef, useEffect } from "react";
import { Barcode as BarcodeIcon } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import productService from "../../../services/productService";
import { toast } from "react-hot-toast";

export const BarcodeScannerModal = ({ isOpen, onClose, onProductFound }) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searching, setSearching] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isOpen]);

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    setSearching(true);
    try {
      // Try to find product by barcode
      const result = await productService.getProductByBarcode(
        barcodeInput.trim()
      );

      if (result.success && result.data) {
        onProductFound(result.data);
        setBarcodeInput("");
        toast.success("Product found!");
      } else {
        toast.error("Product not found with this barcode");
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      toast.error("Product not found with this barcode");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBarcodeScan();
    }
  };

  const handleClose = () => {
    setBarcodeInput("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan Barcode" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <BarcodeIcon className="h-24 w-24 text-gray-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter or Scan Barcode
          </label>
          <input
            ref={barcodeInputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
            placeholder="123456789"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Use a barcode scanner or type manually
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleBarcodeScan}
            disabled={searching || !barcodeInput.trim()}
            className="flex-1"
          >
            {searching ? "Searching..." : "Add Product"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
