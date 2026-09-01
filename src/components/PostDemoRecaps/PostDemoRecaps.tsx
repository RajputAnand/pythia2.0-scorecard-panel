'use client'

import { useState, useEffect } from 'react'
import { sendManualRecap, getRecentDemos, triggerSequenceThreeBulk, getSentRecapIds, markRecapAsSentInDB, type Demo } from '@/queries/recaps'
import { useSession } from 'next-auth/react'
import DataTable from '@/components/shared/DataTable/DataTable'
import type { DataTableColumn } from '@/types/data-table'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const recapSchema = z.object({
  recap1: z.string().min(1, 'Recap Point 1 is required'),
  recap2: z.string().min(1, 'Recap Point 2 is required'),
  recap3: z.string().optional(),
  recap4: z.string().optional(),
  recap5: z.string().optional(),
})

type RecapFormValues = z.infer<typeof recapSchema>



export default function PostDemoRecaps() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loadingDemos, setLoadingDemos] = useState(true)
  const [sentDemoIds, setSentDemoIds] = useState<Set<string>>(new Set())

  const { data: session } = useSession()
  const token = (session?.user as any)?.pythia2Token || (session?.user as any)?.token || ''

  useEffect(() => {
    async function fetchSentIds() {
      if (!token) return
      const res = await getSentRecapIds(token)
      if (res.success && res.data) {
        setSentDemoIds(new Set(res.data))
      }
    }
    if (token) {
      fetchSentIds()
    }
  }, [token])

  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [tokenHistory, setTokenHistory] = useState<string[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null)

  // Form State
  const { register, handleSubmit: hookFormSubmit, reset, formState: { errors } } = useForm<RecapFormValues>({
    resolver: zodResolver(recapSchema),
    defaultValues: { recap1: '', recap2: '', recap3: '', recap4: '', recap5: '' }
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkEmails, setBulkEmails] = useState('')
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [bulkErrorMessage, setBulkErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchDemos() {
      if (!token) return
      setLoadingDemos(true)
      const res = await getRecentDemos(token, pageToken, pageSize)
      if (!cancelled && res.success && res.demos) {
        setDemos(res.demos)
        setNextPageToken(res.nextPageToken || null)
      }
      if (!cancelled) setLoadingDemos(false)
    }
    if (token) {
      fetchDemos()
    }
    return () => {
      cancelled = true
    }
  }, [token, pageToken, pageSize])

  const handleNextPage = () => {
    if (nextPageToken) {
      setTokenHistory((prev) => [...prev, pageToken || ''])
      setPageToken(nextPageToken)
      setPage((p) => p + 1)
    }
  }

  const handlePrevPage = () => {
    if (tokenHistory.length > 0) {
      const prevToken = tokenHistory[tokenHistory.length - 1]
      setTokenHistory((prev) => prev.slice(0, -1))
      setPageToken(prevToken === '' ? undefined : prevToken)
      setPage((p) => p - 1)
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPageToken(undefined)
    setTokenHistory([])
    setPage(0)
  }

  const columns: DataTableColumn<Demo>[] = [
    {
      key: 'prospect',
      header: 'Prospect Name',
      render: (demo) => (
        <div className="flex items-center gap-[9px]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-accent">
            {demo.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-primary">{demo.name}</div>
            <div className="text-[11px] text-muted">{demo.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (demo) => {
        const isSent = sentDemoIds.has(demo.id)
        return isSent ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Sent
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFCC80]">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
            Pending
          </span>
        )
      },
    },
    {
      key: 'event',
      header: 'Event Type',
      render: (demo) => <span className="text-[12.5px] text-secondary">{demo.eventName}</span>,
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (demo) => (
        <span className="text-[12px] text-muted">
          {new Date(demo.startTime).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (demo) => {
        const isSent = sentDemoIds.has(demo.id)
        return isSent ? (
          <button disabled className="px-4 py-[6px] rounded-[8px] border text-[11.5px] font-semibold bg-surface border-border text-muted cursor-not-allowed">
            Sent
          </button>
        ) : (
          <button onClick={() => openModal(demo)} className="px-4 py-[6px] rounded-[8px] border text-[11.5px] font-semibold transition-all bg-surface border-border text-primary hover:border-accent hover:text-accent">
            Write Recap
          </button>
        )
      },
    },
  ]

  const openModal = (demo: Demo) => {
    setActiveDemo(demo)
    reset({ recap1: '', recap2: '', recap3: '', recap4: '', recap5: '' })
    setStatus('idle')
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setActiveDemo(null), 300)
  }

  const onSubmit = async (data: RecapFormValues) => {
    if (!activeDemo) return

    setStatus('loading')
    setErrorMessage('')

    const firstName = activeDemo.name.split(' ')[0]
    const result = await sendManualRecap(
      token,
      activeDemo.email,
      firstName,
      data.recap1,
      data.recap2,
      data.recap3 || '',
      data.recap4 || '',
      data.recap5 || ''
    )

    if (result.success) {
      setStatus('success')
      setSentDemoIds((prev) => new Set(prev).add(activeDemo.id))
      markRecapAsSentInDB(token, activeDemo.id)
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      setStatus('error')
      setErrorMessage(result.message || 'Failed to send recap')
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkStatus('loading')
    setBulkErrorMessage('')

    const emails = bulkEmails
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter((email) => email !== '')

    if (emails.length === 0) {
      setBulkStatus('error')
      setBulkErrorMessage('Please enter at least one valid email address.')
      return
    }

    const result = await triggerSequenceThreeBulk(token, emails)

    if (result.success) {
      setBulkStatus('success')
      setTimeout(() => {
        setIsBulkModalOpen(false)
        setBulkEmails('')
        setBulkStatus('idle')
      }, 2000)
    } else {
      setBulkStatus('error')
      setBulkErrorMessage(result.message || 'Failed to trigger flow for some emails')
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-[8px] bg-surface-alt border border-border text-secondary text-[12px] font-medium min-w-[95px] flex justify-center items-center h-[30px]">
            {loadingDemos ? (
              <div className="h-3 w-14 bg-border/60 rounded-[4px] animate-pulse" />
            ) : (
              `${nextPageToken ? `${(page * pageSize) + demos.length}+` : (page * pageSize) + demos.length} prospects`
            )}
          </span>
          <button
            onClick={() => {
              setBulkStatus('idle')
              setBulkErrorMessage('')
              setBulkEmails('')
              setIsBulkModalOpen(true)
            }}
            className="px-4 py-2 rounded-lg border font-sans text-[12.5px] font-medium cursor-pointer transition-all duration-150 bg-primary text-white border-primary hover:opacity-90 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Bulk Add Sequence
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-border rounded-[10px] shadow-sm">
        <div className="px-[22px] py-4 border-b border-border bg-surface-alt rounded-t-[10px]">
          <h3 className="text-[13.5px] font-semibold text-primary">Recent Demos</h3>
        </div>
        {loadingDemos ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Prospect Name', 'Status', 'Event Type', 'Date & Time', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`text-[10px] font-semibold text-muted uppercase tracking-[.09em] py-[10px] border-b border-border text-left whitespace-nowrap
                        ${i === 0 ? 'pl-[22px] pr-[18px]' : 'px-[18px]'} ${i === 4 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="pl-[22px] pr-[18px] py-[13px]">
                      <div className="flex items-center gap-[9px]">
                        <div className="w-8 h-8 rounded-full bg-surface-alt animate-pulse shrink-0"></div>
                        <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                          <div className="h-3 bg-surface-alt rounded animate-pulse w-full"></div>
                          <div className="h-2 bg-surface-alt rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[18px] py-[13px]">
                      <div className="h-5 w-16 bg-surface-alt rounded-[6px] animate-pulse"></div>
                    </td>
                    <td className="px-[18px] py-[13px]">
                      <div className="h-3 bg-surface-alt rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-[18px] py-[13px]">
                      <div className="h-3 bg-surface-alt rounded animate-pulse w-28"></div>
                    </td>
                    <td className="px-[18px] py-[13px] text-right">
                      <div className="h-8 w-24 bg-surface-alt rounded-[8px] animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t-0 [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&_th:first-child]:rounded-tl-none [&_th:last-child]:rounded-tr-none [&>div]:overflow-visible">
            <DataTable
              columns={columns}
              rows={demos}
              getRowKey={(demo) => demo.id}
              pagination={{
                page,
                onNext: handleNextPage,
                onPrev: handlePrevPage,
                pageSize,
                pageSizeOptions: [10, 20, 50],
                onPageSizeChange: handlePageSizeChange,
                totalPages: !nextPageToken ? page + 1 : page + 2,
                totalCount: (nextPageToken ? `${(page * pageSize) + demos.length}+` : (page * pageSize) + demos.length) as any as number,
              }}
            />
          </div>
        )}
        {demos.length === 0 && !loadingDemos && (
          <div className="px-[22px] py-[32px] text-[13px] text-muted text-center border-t border-border">
            No recent demos found.
          </div>
        )}
      </div>

      {/* Manual Recap Modal */}
      {isModalOpen && activeDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-surface rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-white/10 w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border flex items-start justify-between bg-surface-alt/50 rounded-t-[20px]">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-primary">
                  Recap for {activeDemo.name.split(' ')[0]}
                </h3>
                <p className="text-[13.5px] text-muted mt-1.5">{activeDemo.email}</p>
              </div>
              <button onClick={closeModal} className="text-muted hover:text-primary p-1.5 rounded-full hover:bg-surface transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={hookFormSubmit(onSubmit)} className="px-8 py-7 flex flex-col gap-5 overflow-y-auto">
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Recap Point 1 <span className="text-danger">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  {...register('recap1')}
                  className={`w-full bg-surface-alt border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:border-accent transition-colors ${errors.recap1 ? 'border-danger focus:ring-danger/20' : 'border-border focus:ring-accent/20'}`}
                  placeholder="e.g. Discussed the $1,500/month inventory shrinkage..."
                />
                {errors.recap1 && <p className="text-[11.5px] text-danger mt-0.5">{errors.recap1.message}</p>}
              </div>

              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Recap Point 2 <span className="text-danger">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  {...register('recap2')}
                  className={`w-full bg-surface-alt border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:border-accent transition-colors ${errors.recap2 ? 'border-danger focus:ring-danger/20' : 'border-border focus:ring-accent/20'}`}
                  placeholder="e.g. You wanted to run a pilot in one store..."
                />
                {errors.recap2 && <p className="text-[11.5px] text-danger mt-0.5">{errors.recap2.message}</p>}
              </div>

              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Recap Point 3 <span className="normal-case tracking-normal font-normal text-muted ml-1">(Optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  {...register('recap3')}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Recap Point 4 <span className="normal-case tracking-normal font-normal text-muted ml-1">(Optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  {...register('recap4')}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Recap Point 5 <span className="normal-case tracking-normal font-normal text-muted ml-1">(Optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  {...register('recap5')}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-[12.5px] text-danger font-medium">{errorMessage}</p>
                </div>
              )}

              {status === 'success' && (
                <div className="p-3 rounded-lg bg-[#E8F5E9] border border-[#A5D6A7]">
                  <p className="text-[12.5px] text-[#2E7D32] font-medium">Recap sent successfully!</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-[12px] rounded-xl border border-border bg-surface text-[14px] font-medium text-secondary hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-accent text-white font-semibold text-[14px] rounded-xl py-[12px] px-8 hover:bg-accent-mid transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] shadow-lg shadow-accent/20"
                >
                  {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Recap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Sequence 3 Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBulkModalOpen(false)} />
          <div className="relative bg-surface rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-white/10 w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border flex items-start justify-between bg-surface-alt/50 rounded-t-[20px]">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-primary">Trigger Sequence 3</h3>
                <p className="text-[13.5px] text-muted mt-1.5">Enter prospect emails below to enroll them in the sequence.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-muted hover:text-primary p-1.5 rounded-full hover:bg-surface transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleBulkSubmit} className="px-8 py-7 flex flex-col gap-5 overflow-y-auto">
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                    Email Addresses <span className="text-danger">*</span>
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  required
                  className="w-full bg-surface-alt border border-border rounded-xl px-4 py-[14px] text-[14px] text-primary font-mono placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none shadow-inner"
                  placeholder="john@example.com, jane@example.com&#10;mike@example.com"
                />
                <p className="text-[12px] text-muted mt-2">
                  These prospects will be automatically enrolled in the "Trigger Cold Prospect Flow" metric in Klaviyo.
                </p>
              </div>

              {bulkStatus === 'error' && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-[12.5px] text-danger font-medium">{bulkErrorMessage}</p>
                </div>
              )}

              {bulkStatus === 'success' && (
                <div className="p-3 rounded-lg bg-[#E8F5E9] border border-[#A5D6A7]">
                  <p className="text-[12.5px] text-[#2E7D32] font-medium">Successfully triggered flow for prospects!</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-6 py-[12px] rounded-xl border border-border bg-surface text-[14px] font-medium text-secondary hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkStatus === 'loading' || bulkStatus === 'success' || !bulkEmails.trim()}
                  className="bg-accent text-white font-semibold text-[14px] rounded-xl py-[12px] px-8 hover:bg-accent-mid transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px] shadow-lg shadow-accent/20"
                >
                  {bulkStatus === 'loading' ? 'Triggering...' : bulkStatus === 'success' ? 'Success!' : 'Trigger Sequence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
