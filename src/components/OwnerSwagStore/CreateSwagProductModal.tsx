'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSwagProductSchema, type CreateSwagProductSchema } from '@/schemas/swag'
import Select from '@/components/shared/Select/Select'
import type { SwagProduct } from '@/types/swagstore'
import type { SelectOption } from '@/types/select'

const PRESET_EMOJIS = [
  '☕', '🎽', '🎟️', '🧢', '🏖️', '🎮',
  '🎒', '🎧', '🍔', '⌚', '🎁', '🏆',
  '🍕', '👕', '🎫', '🥤', '💻', '👟',
]

const CATEGORIES = [
  'Apparel',
  'Food & Drink',
  'Perks',
  'Gift Cards',
  'Lifestyle',
  'Merchandise',
]

const CATEGORY_OPTIONS: SelectOption[] = CATEGORIES.map((cat) => ({
  label: cat,
  value: cat,
}))

interface CreateSwagProductModalProps {
  initialProduct?: SwagProduct | null
  onClose: () => void
  onSubmit: (data: Omit<SwagProduct, 'id' | 'createdAt' | 'status'>) => void
}

export default function CreateSwagProductModal({
  initialProduct,
  onClose,
  onSubmit,
}: CreateSwagProductModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(initialProduct?.emoji ?? '🎁')
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(initialProduct?.stock == null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSwagProductSchema>({
    resolver: zodResolver(createSwagProductSchema),
    defaultValues: {
      name: initialProduct?.name ?? '',
      desc: initialProduct?.desc ?? '',
      cost: initialProduct?.cost ?? 500,
      emoji: initialProduct?.emoji ?? '🎁',
      category: initialProduct?.category ?? 'Apparel',
      stock: initialProduct?.stock ?? null,
    },
  })

  const selectedCategory = watch('category') || 'Apparel'

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    setValue('emoji', emoji, { shouldValidate: true })
  }

  const onFormSubmit = (values: CreateSwagProductSchema) => {
    onSubmit({
      name: values.name,
      desc: values.desc,
      cost: Number(values.cost),
      emoji: values.emoji,
      category: values.category,
      stock: isUnlimitedStock ? null : values.stock ? Number(values.stock) : 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4 overflow-y-auto py-4">
      <div className="w-full max-w-[680px] bg-surface border border-border rounded-2xl shadow-xl p-5 md:p-6 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3.5">
          <div>
            <h2 className="text-[16px] font-bold text-primary">
              {initialProduct ? 'Edit Reward Product' : 'Add New Swag Reward'}
            </h2>
            <p className="text-[11.5px] text-muted mt-0.5">
              Available for employees to claim using earned reward points.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary text-[18px] p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ── Left Column: Icon & Stock ── */}
            <div className="flex flex-col gap-3">
              {/* Emoji / Icon Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                    Reward Icon
                  </label>
                  <span className="text-[11px] font-medium text-secondary bg-surface-alt border border-border rounded-md px-2 py-0.5 flex items-center gap-1.5 shadow-2xs">
                    <span className="text-muted">Active:</span>
                    <span className="text-[14px] leading-none">{selectedEmoji || '❓'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5 p-2 bg-surface-alt/60 rounded-xl border border-border/70">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`h-9 w-full flex items-center justify-center rounded-lg text-[18px] leading-none transition-all cursor-pointer ${
                        selectedEmoji === emoji
                          ? 'bg-accent/20 border-2 border-accent scale-105 shadow-2xs ring-1 ring-accent/30'
                          : 'hover:bg-surface border border-transparent hover:border-border hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {errors.emoji && (
                  <p className="text-[11px] text-danger mt-1">{errors.emoji.message}</p>
                )}
              </div>

              {/* Stock / Quantity Control */}
              <div className="rounded-xl border border-border bg-surface-alt/40 p-2.5 mt-auto min-h-[86px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11.5px] font-semibold text-primary block">Inventory Stock</span>
                    <span className="text-[10.5px] text-muted">
                      {isUnlimitedStock ? 'Unlimited supply' : 'Limited availability'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedStock}
                      onChange={(e) => {
                        setIsUnlimitedStock(e.target.checked)
                        if (e.target.checked) {
                          setValue('stock', null)
                        } else {
                          setValue('stock', 10)
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-accent" />
                    <span className="ml-2 text-[11px] font-medium text-secondary">Unlimited</span>
                  </label>
                </div>

                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between h-8">
                  {isUnlimitedStock ? (
                    <span className="text-[11px] text-muted">
                      Always available — no quantity limit
                    </span>
                  ) : (
                    <>
                      <label className="text-[11px] font-medium text-secondary">
                        Available Units:
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="10"
                        {...register('stock', { valueAsNumber: true })}
                        className="w-20 h-8 bg-surface border border-border rounded-lg px-2.5 text-[12px] font-mono text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                      />
                    </>
                  )}
                </div>
                {errors.stock && (
                  <p className="text-[10.5px] text-danger mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* ── Right Column: Details & Pricing ── */}
            <div className="flex flex-col gap-3">
              {/* Reward Name */}
              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
                  Reward Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pythia Team Fleece Hoodie"
                  {...register('name')}
                  className={`w-full h-9 bg-surface-alt border rounded-lg px-3 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                    errors.name ? 'border-danger' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-danger mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* Category & Points Price Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    options={CATEGORY_OPTIONS}
                    onChange={(val) => setValue('category', String(val), { shouldValidate: true })}
                    ariaLabel="Reward Category"
                    fullWidth
                    triggerClassName="!h-9 !py-0 !text-[12.5px]"
                  />
                  {errors.category && (
                    <p className="text-[11px] text-danger mt-0.5">{errors.category.message}</p>
                  )}
                </div>

                {/* Price in Points */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                      Cost (Pts)
                    </label>
                    <span className="text-[10px] font-mono text-gold font-bold">PTS ONLY</span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold text-[12.5px] select-none font-bold">
                      🪙
                    </span>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      placeholder="800"
                      {...register('cost', { valueAsNumber: true })}
                      className={`w-full h-9 bg-surface-alt border rounded-lg pl-8 pr-9 text-[12.5px] font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                        errors.cost ? 'border-danger' : 'border-border'
                      }`}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted text-[10.5px] select-none">
                      pts
                    </span>
                  </div>
                  {errors.cost && (
                    <p className="text-[11px] text-danger mt-0.5">{errors.cost.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Premium embroidered zip-up fleece. Claim size at manager office."
                  {...register('desc')}
                  className={`w-full flex-1 min-h-[72px] bg-surface-alt border rounded-lg px-3 py-2 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none ${
                    errors.desc ? 'border-danger' : 'border-border'
                  }`}
                />
                {errors.desc && (
                  <p className="text-[11px] text-danger mt-0.5">{errors.desc.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-3.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="border border-border text-secondary hover:text-primary font-medium text-[12px] rounded-lg px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent hover:opacity-90 text-white font-semibold text-[12px] rounded-lg px-4 py-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {initialProduct ? 'Save Changes' : 'Add Reward to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
