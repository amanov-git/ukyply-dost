import Modal from 'react-modal';
Modal.setAppElement('#root');

const ConfirmationModal = ({ isOpenConfirmModal, setIsOpenConfirmModal, children, overlayClassName, className }) => {
  return (
    <Modal
      isOpen={isOpenConfirmModal}
      onRequestClose={() => setIsOpenConfirmModal(false)}
      contentLabel='Example Label'
      overlayClassName={`fixed top-0 left-0 w-full h-screen flex justify-center z-20 backdrop-blur-sm ${overlayClassName}`}
      className={`p-10 bg-second-light-bg-color dark:bg-slate-700 outline-none flex flex-col justify-center items-center gap-1
         z-20 rounded-xl absolute top-1/2 -translate-y-1/2 scale-75 md:scale-90 lg:scale-100 text-slate-700 dark:text-slate-300 ${className}`}
    >
      {children}
    </Modal>
  )
};


export default ConfirmationModal;