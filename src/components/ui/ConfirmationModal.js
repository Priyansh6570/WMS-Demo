'use client';

import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    isConfirming = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000050]">
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                <div className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                        onClick={onConfirm}
                        loading={isConfirming}
                        className="w-full sm:ml-3 sm:w-auto"
                    >
                        {confirmText}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full mt-3 sm:mt-0 sm:w-auto"
                        disabled={isConfirming}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}