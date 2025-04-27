import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// pages
const AuthMiddleware = lazy(() => import("components/AuthMiddleware"))

const Dashboard = lazy(() => import("pages/Dashboard"))
const Languages = lazy(() => import("pages/Languages"))
const AddNewEnquiry = lazy(() => import("pages/AddNewEnquiry"))
const Branches = lazy(() => import("pages/Branches"))
const BranchDetails = lazy(() => import("pages/BranchDetails"))
const EditUser = lazy(() => import("pages/EditUser"))
const AddNewUser = lazy(() => import("pages/AddNewUser"))
const UserProfile = lazy(() => import("pages/UserProfile"))
const UserProfileTranslations = lazy(() => import("pages/UserProfileTranslations"))
const NotConfirmed = lazy(() => import("pages/NotConfirmed"))
const CardDetails = lazy(() => import("pages/CardDetails"))
const Error404 = lazy(() => import("pages/Error404"))
const Chart = lazy(() => import("pages/Chart"))

const Login = lazy(() => import("pages/Login"))
const Register = lazy(() => import("pages/Register"))
// const Operators = lazy(() => import("pages/Operators"))
const RegisterSuccess = lazy(() => import("pages/RegisterSuccess"))

// loader
import ProgressLoader from "components/ProgressLoader";

const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware withLayout={true}>
          <Dashboard />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/languages',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <Languages />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/add-new-enquiry',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin', 'operator']}>
          <AddNewEnquiry />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/branches',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <Branches />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/branch-details',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <BranchDetails />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/edit-user/:userId',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <EditUser />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/add-new-user/:branchId',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <AddNewUser />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/user-profile',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware>
          <UserProfile />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/user-profile-translations',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware>
          <UserProfileTranslations />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/card-details/:guid',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware>
          <CardDetails />
          <Toaster position="bottom-right" />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/chart',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <AuthMiddleware allowedRoles={['admin']}>
          <Chart />
          <Toaster />
        </AuthMiddleware>
      </Suspense>
    )
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <Login />
        <Toaster />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <Register />
        <Toaster />
      </Suspense>
    )
  },
  {
    path: '/register-success',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <RegisterSuccess />
        <Toaster />
      </Suspense>
    )
  },
  {
    path: '/not-confirmed',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <NotConfirmed />
        <Toaster />
      </Suspense>
    )
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<ProgressLoader />}>
        <Error404 />
        <Toaster />
      </Suspense>
    )
  },
])


export default routes;