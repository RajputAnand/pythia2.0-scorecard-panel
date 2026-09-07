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
  const [customEmoji, setCustomEmoji] = useState('')
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
    setCustomEmoji('')
    setValue('emoji', emoji, { shouldValidate: true })
  }

  const handleCustomEmojiChange = (val: string) => {
    setCustomEmoji(val)
    if (val.trim()) {
      setSelectedEmoji(val.trim())
      setValue('emoji', val.trim(), { shouldValidate: true })
    }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4 overflow-y-auto py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-7 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-primary">
              {initialProduct ? 'Edit Reward Product' : 'Add New Swag Reward'}
            </h2>
            <p className="text-[12px] text-muted mt-0.5">
              Available for employees to claim using earned reward points.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary text-[20px] p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
          {/* Emoji / Icon Selector */}
          <div>
            <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em] mb-2">
              Reward Icon / Emoji
            </label>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-14 h-14 rounded-xl border border-border bg-surface-alt flex items-center justify-center text-[28px] shadow-inner">
                {selectedEmoji || '❓'}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Or type custom emoji / icon"
                  value={customEmoji}
                  onChange={(e) => handleCustomEmojiChange(e.target.value)}
                  maxLength={6}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
                <span className="text-[11px] text-muted mt-1 block">
                  Select a preset below or type any unicode emoji
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-surface-alt/60 rounded-xl border border-border/70 max-h-[90px] overflow-y-auto">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-[18px] transition-transform cursor-pointer ${
                    selectedEmoji === emoji
                      ? 'bg-accent/20 border-2 border-accent scale-105'
                      : 'hover:bg-surface border border-transparent hover:border-border'
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

          {/* Reward Name */}
          <div>
            <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
              Reward Name
            </label>
            <input
              type="text"
              placeholder="e.g. Pythia Team Fleece Hoodie"
              {...register('name')}
              className={`w-full bg-surface-alt border rounded-lg px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                errors.name ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-danger mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
              Description & Redemption Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Premium embroidered zip-up fleece. Claim size at manager office."
              {...register('desc')}
              className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none ${
                errors.desc ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.desc && (
              <p className="text-[11px] text-danger mt-1">{errors.desc.message}</p>
            )}
          </div>

          {/* Points Price & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Price in Points */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
                  Cost (Points)
                </label>
                <span className="text-[11px] font-mono text-gold font-bold">PTS ONLY</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold text-[13px] select-none font-bold">
                  🪙
                </span>
                <input
                  type="number"
                  min={10}
                  step={10}
                  placeholder="800"
                  {...register('cost', { valueAsNumber: true })}
                  className={`w-full bg-surface-alt border rounded-lg pl-8 pr-12 py-2 text-[13px] font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                    errors.cost ? 'border-danger' : 'border-border'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted text-[11px] select-none">
                  pts
                </span>
              </div>
              <span className="text-[10.5px] text-muted mt-1 block">
                Employees earn ~120 pts per shift. No real currency is charged.
              </span>
              {errors.cost && (
                <p className="text-[11px] text-danger mt-1">{errors.cost.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em] mb-1.5">
                Category
              </label>
              <Select
                value={selectedCategory}
                options={CATEGORY_OPTIONS}
                onChange={(val) => setValue('category', String(val), { shouldValidate: true })}
                ariaLabel="Reward Category"
                fullWidth
              />
              <span className="text-[10.5px] text-muted mt-1 block">
                Groups items on the employee store.
              </span>
              {errors.category && (
                <p className="text-[11px] text-danger mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Stock / Quantity Control */}
          <div className="rounded-xl border border-border bg-surface-alt/40 p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-primary">Inventory Stock</span>
                <p className="text-[11px] text-muted">
                  {isUnlimitedStock
                    ? 'Unlimited availability — employees can claim whenever points allow.'
                    : 'Finite supply — automatically stops claims when count reaches 0.'}
                </p>
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
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                <span className="ml-2 text-[11.5px] font-medium text-secondary">Unlimited</span>
              </label>
            </div>

            {!isUnlimitedStock && (
              <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-3">
                <label className="text-[11.5px] font-medium text-secondary">
                  Initial Units Available:
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="10"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-24 bg-surface border border-border rounded-lg px-2.5 py-1 text-[12px] font-mono text-primary focus:outline-none focus:border-accent"
                />
                {errors.stock && (
                  <span className="text-[11px] text-danger">{errors.stock.message}</span>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="border border-border text-secondary hover:text-primary font-medium text-[12.5px] rounded-lg px-4 py-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent hover:opacity-90 text-white font-semibold text-[12.5px] rounded-lg px-5 py-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {initialProduct ? 'Save Changes' : 'Add Reward to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
