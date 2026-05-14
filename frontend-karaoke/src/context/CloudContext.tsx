import {

  createContext,

  useContext,

  useEffect,

  useState

} from 'react'

const CLOUD_API =
  'https://tugasakhirc14220241.up.railway.app/api'

interface CloudContextType {

  cloudOnline: boolean

  checking: boolean
}

const CloudContext =
  createContext<CloudContextType>({

    cloudOnline: false,

    checking: true
  })

export function CloudProvider({

  children

}: {

  children: React.ReactNode

}) {

  const [cloudOnline,
    setCloudOnline] =

      useState(false)

  const [checking,
    setChecking] =

      useState(true)

  useEffect(() => {

    let mounted = true

    const checkCloud =
      async () => {

      try {

        // ================= NO NETWORK
        if (!navigator.onLine) {

          if (mounted) {

            setCloudOnline(false)

            setChecking(false)
          }

          console.log(
            '📴 OFFLINE MODE'
          )

          return
        }

        const controller =
          new AbortController()

        const timeout =
          setTimeout(() => {

            controller.abort()

          }, 3000)

        const response =
          await fetch(

            `${CLOUD_API}/ping?ts=${Date.now()}`,

            {
              method: 'GET',

              cache: 'no-store',

              signal:
                controller.signal
            }
          )

        clearTimeout(timeout)

        if (mounted) {

          setCloudOnline(
            response.ok
          )

          setChecking(false)
        }

        console.log(

          response.ok
            ? '☁️ CLOUD ONLINE'
            : '📴 CLOUD OFFLINE'
        )

      } catch {

        if (mounted) {

          setCloudOnline(false)

          setChecking(false)
        }

        console.log(
          '📴 CLOUD OFFLINE'
        )
      }
    }

    // FIRST CHECK
    checkCloud()

    // AUTO CHECK
    const interval =
      setInterval(() => {

        checkCloud()

      }, 5000)

    return () => {

      mounted = false

      clearInterval(interval)
    }

  }, [])

  return (

    <CloudContext.Provider

      value={{

        cloudOnline,

        checking
      }}
    >

      {children}

    </CloudContext.Provider>
  )
}

export function useCloud() {

  return useContext(
    CloudContext
  )
}