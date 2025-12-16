// src/components/ConfirmDialog.tsx
import React from "react";

const ConfirmDialog: React.FC<{ title: string; message?: string; onConfirm: () => void; onCancel: () => void }> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                {message && <p className="text-gray-600 mb-4">{message}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
