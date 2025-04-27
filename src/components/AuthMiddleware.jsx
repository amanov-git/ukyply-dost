import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './Layout'
import Cookies from 'js-cookie'
import { RefreshAccessToken } from 'api/queries/getters'
import { GetUser } from 'api/queries/getters'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from 'stores/userInfo'
import { tokenStorage } from 'utils/storage'
import socketIOclient from 'socket.io-client';
import newMessageSound from 'assets/audio/new_message_tone-1.mp3';
import { PURE_BASE_URL } from 'api/axiosInstance';
import { AxiosError } from 'axios'
import toast from 'react-hot-toast';
import handleAxiosError from 'utils/handleAxiosError'

// Sets refresh token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

const AuthMiddleware = ({ children, withLayout = true, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.userInfo);

  async function refreshAccessToken() {
    try {
      const { data } = await RefreshAccessToken()
      tokenStorage.setToken(data.data.access_token);
      window.location.reload()
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    }
  };

  useEffect(() => {
    setLoading(true)
    const access_token = localStorage.getItem("access_token");
    const refreshToken = Cookies.get('refreshToken')
    if (refreshToken === undefined) {
      // Refresh token out of date
      localStorage.removeItem('access_token')
      navigate('/login', { replace: true })
    } else {
      // Refresh token is active
      if (isTokenExpired(access_token)) {
        localStorage.removeItem('access_token')
        refreshAccessToken()
      } else {
        getUser();
      }
    }

    setLoading(false)
  }, []);

  async function getUser() {
    try {
      const response = await GetUser()

      if (!response.data.data.is_active) {
        navigate('/not-confirmed')
      }

      dispatch(setUser(response?.data.data))
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role_name !== undefined) {
        if (allowedRoles.length > 0) {
          if (!allowedRoles.includes(user?.role_name)) {
            navigate('/')
          }
        }
      }
    }
  }, [user, allowedRoles, navigate]);

  useEffect(() => {
    const token = tokenStorage.getToken();

    if (token) {
      const socket = socketIOclient(PURE_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        secure: true
      });

      socket.on('added_new_translation', (data) => {
        if (Notification.permission === 'granted') {
          showNotification(data);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              showNotification(data);
            }
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }

    // Listener for visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Play sound when the page is visible
        console.log('Page is visible');
      } else {
        // Play sound even if the page is not visible
        console.log('Page is hidden or minimized');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const showNotification = (data) => {
    const notification = new Notification('Täze terjime geldi!', {
      // body: 'Täze terjime geldi!',
    });

    const audio = playSound();

    notification.onclose = () => {
      stopSound(audio);
    };
  };

  const playSound = () => {
    const audio = new Audio(newMessageSound);
    audio.play().catch((error) => {
      console.log('Audio playback error:', error);
    });
    return audio; // Return the audio object so it can be stopped later
  };

  const stopSound = (audio) => {
    audio.pause();
    audio.currentTime = 0; // Reset the audio to the start
  };

  return (
    <>
      {
        window.navigator.onLine ?
          user?.is_active ?
            loading ?
              <div>
                {/* <GlobalLoader /> */}
              </div>
              :
              withLayout ?
                <Layout>
                  {children}
                </Layout>
                :
                <>
                  {children}
                </>
            : null
          :
          <div className='h-screen flex justify-center items-center text-5xl'>
            Offline
          </div>
      }
    </>
  )
};


export default AuthMiddleware;