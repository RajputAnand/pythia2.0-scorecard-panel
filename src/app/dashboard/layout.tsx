import Sidebar from '@/components/Sidebar/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="grow grid ml-[210px]">{children}</div>
    </>
  )
}
