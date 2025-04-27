import Modal from 'react-modal'
Modal.setAppElement('#root');
import { RxCross2 } from "react-icons/rx";


// COMPONENT
const ModalVertical = ({ children, isOpenModal, setIsOpenModal, size, heading }) => {
  return (
    <Modal
      isOpen={isOpenModal}
      onRequestClose={() => setIsOpenModal(false)}
      overlayClassName='fixed top-0 left-0 w-full h-full flex justify-center z-20 backdrop-blur-sm'
      className={`${'sm:w-96' || size} h-[416px] bg-second-light-bg-color dark:bg-second-dark-bg-color outline-none flex flex-col gap-1 shadow-md z-20 rounded-xl absolute top-[50%] -translate-y-1/2 scale-75 sm:scale-100 text-black dark:text-white`}
    >
      <div className="relative">
        <button className='size-8 absolute top-4 right-4 hover:bg-red-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 dark:text-slate-300 flex items-center justify-center rounded-full text-slate-600  hover:text-red-600 transition-colors duration-200 active:bg-red-200 active:scale-90' onClick={() => setIsOpenModal(false)}>
          <RxCross2 className='size-5 ' />  
        </button>
        <div className='w-full p-8 gap-6 flex flex-col items-center'>
          <h5 className='text-slate-600 dark:text-slate-300'>
            {heading}
          </h5>
          {children}
        </div>
      </div>
    </Modal>
  )
};


export default ModalVertical;