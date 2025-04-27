import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="bg-white text-slate-600 dark:bg-gray-900 dark:text-gray-100">

      {/* Header */}
      <div>
        <Header />
      </div>

      {/* Section */}
      <div>
        <div className='pt-52 sm:pt-36 min-h-[calc(100vh-96px)]'>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div>
        <Footer />
      </div>

    </div>
  )
};


export default Layout;