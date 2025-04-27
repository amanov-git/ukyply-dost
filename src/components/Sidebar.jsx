// import ListItem from "shared/ListItem";
// import { useTranslation } from "react-i18next";
// import { useRef, useEffect } from "react";
// import { useWindowWidth } from '@react-hook/window-size';

// import { IoLanguageSharp } from "react-icons/io5";
// import { AiOutlineBranches } from "react-icons/ai";
// import { RxDashboard } from "react-icons/rx";
// import roles from "utils/roles";
// import { useSelector } from "react-redux";

// const Sidebar = ({ isOpenSideBar, setIsOpenSideBar }) => {
//   const ref = useRef(null);

//   const { t } = useTranslation();
//   const { user } = useSelector(s => s.userInfo)

//   const itemsList = [
//     {
//       icon: RxDashboard,
//       text: t('listItemDashboard'),
//       linkTo: '/',
//       permissions: []
//     },
//     {
//       icon: IoLanguageSharp,
//       text: t('listItemLang'),
//       linkTo: '/languages',
//       permissions: [roles.ADMIN]
//     },
//     {
//       icon: AiOutlineBranches,
//       text: t('listItemBranch'),
//       linkTo: '/branches',
//       permissions: [roles.ADMIN]
//     },
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (ref.current && !ref.current.contains(event.target)) {
//         setIsOpenSideBar(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [ref]);

//   const screenWidth = useWindowWidth()

//   return (
//     <div
//       ref={ref}
//       className={`w-48 h-fit fixed transition-all duration-500 rounded-md bg-second-light-bg-color dark:bg-second-dark-bg-color z-10 ${isOpenSideBar ? 'left-0' : '-left-full'}`}
//     >
//       {
//         screenWidth > 210 && (
//           <div className='p-2 pl-4'>
//             {
//               itemsList.map(({ icon: Icon, text, linkTo, permissions }, idx) => {
//                 if (permissions.includes(user.role_name) || permissions.length === 0) {
//                   return (
//                     <ListItem
//                       key={idx}
//                       Icon={Icon}
//                       text={text}
//                       linkTo={linkTo}
//                       isOpenSideBar={isOpenSideBar}
//                       setIsOpenSideBar={setIsOpenSideBar}
//                     />
//                   )
//                 }
//               })
//             }
//           </div>
//         )
//       }
//     </div>
//   )
// };


// export default Sidebar;