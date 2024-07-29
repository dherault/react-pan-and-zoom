import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Layout from './Layout'
import FourK from './FourK'
import PersistedState from './PersistedState'
import PanPadding from './PanPadding'
import Controls from './Controls'

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
            element={<PersistedState />}
          />
          <Route
            path="pan-padding"
            element={<PanPadding />}
          />
          <Route
            path="controls"
            element={<Controls />}
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
