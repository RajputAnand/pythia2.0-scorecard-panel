import PostDemoRecaps from '@/components/PostDemoRecaps/PostDemoRecaps'
import Header from '@/components/shared/Header/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post-Demo Recaps | Pythia Scorecard',
  description: 'Manage recently completed product demonstrations and send personalized recap emails.',
}

export default function PostDemoRecapsPage() {
  return (
    <>
      <Header title="Post-Demo Recaps" subtitle="Super Admin" />
      <div className="grid px-[30px] py-[24px] gap-5">
        <PostDemoRecaps />
      </div>
    </>
  )
}
