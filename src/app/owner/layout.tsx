import Sidebar from '@/components/shared/Sidebar/Sidebar'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="grow grid ml-[210px]">{children}</div>
    </>
  )
}
