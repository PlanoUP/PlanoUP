import { RouterProvider } from 'react-router'
import { router } from '@/routes'
import { TenantProvider } from '@/tenant/TenantProvider'

export default function App() {
  return (
    <TenantProvider>
      <RouterProvider router={router} />
    </TenantProvider>
  )
}
