import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth, functions } from './firebase'
import Play from './pages/Play'
import InstructorDashboard from './pages/InstructorDashboard'
import Configure from './pages/Configure'
import Reports from './pages/Reports'
import { SettingsPage } from '@mygames/game-ui'

const vivoRoleLabels: Record<string, string> = {
  vivo: 'Vivo',
  ads:  'ADS',
}

const vivoInfoLinks = [
  { roleKey: 'vivo', links: [
    { key: 'vivo_sheet_url', label: 'Role sheet' },
  ]},
  { roleKey: 'ads', links: [
    { key: 'ads_sheet_url', label: 'Role sheet' },
  ]},
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Play />} />
        <Route path="/dashboard" element={<InstructorDashboard />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/reports"   element={<Reports />} />
        <Route path="/settings"  element={
          <SettingsPage
            title="Settings — Vivo"
            functions={functions}
            auth={auth}
            roleLabels={vivoRoleLabels}
            roleInfoLinks={vivoInfoLinks}
          />
        } />
      </Routes>
    </BrowserRouter>
  )
}
