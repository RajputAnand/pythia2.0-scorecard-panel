import Header from '@/components/shared/Header/Header'
import DeviceHealthPanel from '@/components/DeviceHealthPanel/DeviceHealthPanel'

export default function DeviceHealthPage() {
  return (
    <>
      <Header title="Device Health" subtitle="Super Admin" />

      <div className="grid p-5 gap-5">
        <DeviceHealthPanel />
      </div>
    </>
  )
}
