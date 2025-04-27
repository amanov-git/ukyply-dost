import ReactDOM from 'react-dom/client'
import './assets/css/index.css'
import { HelmetProvider } from 'react-helmet-async';

// for routing
import { RouterProvider } from 'react-router-dom';
import routes from 'routes';

// for global state maganement
import { Provider } from 'react-redux'
import store from 'stores'

// for translation
import i18n from "./libs/i18";
import { I18nextProvider } from "react-i18next";

// for react query
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// react query default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const helmetContext = {};

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider context={helmetContext}>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={routes} />
        </QueryClientProvider>
      </I18nextProvider>
    </Provider>
  </HelmetProvider>
)
