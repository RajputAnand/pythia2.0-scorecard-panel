import Header from '@/components/shared/Header/Header'
import DeviceHealthPanel from '@/components/DeviceHealthPanel/DeviceHealthPanel'

export default function DeviceHealthPage() {
  return (
    <>
      <Header title="Device Health" subtitle="Super Admin" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <DeviceHealthPanel />
      </div>
    </>
  )
}
