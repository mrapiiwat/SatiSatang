import Swal from 'sweetalert2';

export const showSwalAlert = (
  title: string,
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'error',
  confirmText: string = 'ตกลง',
) => {
  return Swal.fire({
    title,
    icon,
    draggable: true,
    showConfirmButton: true,
    confirmButtonText: confirmText,
    customClass: {
      popup: 'w-80 p-4 rounded-xl',
      title: 'text-lg font-medium',
      confirmButton: 'bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600',
    },
  });
};
