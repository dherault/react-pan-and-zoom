import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Layout from './Layout'
import FourK from './FourK'
import Dom from './PersistedState'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <Layout>
              <Outlet />
            </Layout>
          )}
        >
          <Route
            index
            element={(
              <Navigate
                replace
                to="4k"
              />
            )}
          />
          <Route
            path="4k"
            element={<FourK />}
          />
          <Route
            path="persisted-state"
            element={<Dom />}
          />
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
