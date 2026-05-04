'use client'

import { useState, useTransition } from 'react'

interface PantryItem {
  id: string
  name: string
  quantity: number
  unit: string | null
  category: string | null
  expiry_date: string | null
}

interface Props {
  initialItems: PantryItem[]
}

const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains & Pasta',
  'Canned & Jarred',
  'Frozen',
  'Spices & Condiments',
  'Other',
]

const BLANK_FORM = {
  name: '',
  quantity: 1,
  unit: '',
  category: 'Other',
  expiry_date: '',
}

function getExpiryStatus(expiryDate: string | null): 'expired' | 'soon' | 'ok' | null {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 7) return 'soon'
  return 'ok'
}

function formatQty(item: PantryItem) {
  return item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`
}

export function PantryClient({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<PantryItem | null>(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [quickAddText, setQuickAddText] = useState('')
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parsedItems, setParsedItems] = useState<typeof BLANK_FORM[]>([])
  const [isPending, startTransition] = useTransition()

  const grouped = CATEGORIES.reduce<Record<string, PantryItem[]>>((acc, cat) => {
    const catItems = items.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})
  const uncategorized = items.filter(i => !i.category || !CATEGORIES.includes(i.category))
  if (uncategorized.length > 0) grouped['Other'] = [...(grouped['Other'] ?? []), ...uncategorized]

  function openAdd() {
    setEditItem(null)
    setForm(BLANK_FORM)
    setParsedItems([])
    setQuickAddText('')
    setParseError('')
    setQuickAddMode(false)
    setShowAddModal(true)
  }

  function openEdit(item: PantryItem) {
    setEditItem(item)
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit ?? '',
      category: item.category ?? 'Other',
      expiry_date: item.expiry_date ?? '',
    })
    setParsedItems([])
    setQuickAddMode(false)
    setShowAddModal(true)
  }

  async function handleParse() {
    if (!quickAddText.trim()) return
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/pantry/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickAddText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setParsedItems(data.items.map((i: { name: string; quantity: number; unit: string | null; category: string | null }) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit ?? '',
        category: i.category ?? 'Other',
        expiry_date: '',
      })))
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Parse failed')
    } finally {
      setParsing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editItem) {
        const res = await fetch(`/api/pantry/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            quantity: Number(form.quantity),
            unit: form.unit || null,
            category: form.category || null,
            expiry_date: form.expiry_date || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setItems(prev => prev.map(i => i.id === editItem.id ? data.item : i))
      } else if (parsedItems.length > 0) {
        const toAdd = parsedItems.map(i => ({
          name: i.name,
          quantity: Number(i.quantity),
          unit: i.unit || null,
          category: i.category || null,
          expiry_date: i.expiry_date || null,
        }))
        const res = await fetch('/api/pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toAdd),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setItems(prev => [...prev, ...data.items])
      } else {
        const res = await fetch('/api/pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            quantity: Number(form.quantity),
            unit: form.unit || null,
            category: form.category || null,
            expiry_date: form.expiry_date || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setItems(prev => [...prev, ...data.items])
      }
      setShowAddModal(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/pantry/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
      }
    })
  }

  const expiringSoon = items.filter(i => {
    const s = getExpiryStatus(i.expiry_date)
    return s === 'expired' || s === 'soon'
  })

  return (
    <div>
      {expiringSoon.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800 mb-1">⚠️ Expiring soon</p>
          <ul className="text-sm text-amber-700 space-y-0.5">
            {expiringSoon.map(i => {
              const s = getExpiryStatus(i.expiry_date)
              return (
                <li key={i.id}>
                  {i.name} —{' '}
                  {s === 'expired'
                    ? <span className="text-red-600 font-medium">expired {i.expiry_date}</span>
                    : <span>use by {i.expiry_date}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <button onClick={openAdd} className="btn-primary text-sm mb-4">
        + Add item
      </button>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">🥫</p>
          <h2 className="font-semibold text-gray-900 mb-2">Your pantry is empty</h2>
          <p className="text-sm text-gray-500">Add items to track what you have on hand.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="card">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {catItems.map(item => {
                  const expiryStatus = getExpiryStatus(item.expiry_date)
                  return (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-800">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-1">({formatQty(item)})</span>
                        {expiryStatus === 'expired' && (
                          <span className="ml-2 text-xs text-red-600 font-medium">expired</span>
                        )}
                        {expiryStatus === 'soon' && (
                          <span className="ml-2 text-xs text-amber-600 font-medium">expiring soon</span>
                        )}
                      </span>
                      <button
                        onClick={() => openEdit(item)}
                        className="text-gray-400 hover:text-gray-600 text-xs px-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-red-500 text-xs px-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {editItem ? 'Edit item' : 'Add to pantry'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {!editItem && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => { setQuickAddMode(false); setParsedItems([]) }}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${!quickAddMode ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setQuickAddMode(true)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${quickAddMode ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    ✨ Quick add (AI)
                  </button>
                </div>
              )}

              {quickAddMode && !editItem ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Describe what you have
                    </label>
                    <textarea
                      value={quickAddText}
                      onChange={e => setQuickAddText(e.target.value)}
                      placeholder="e.g. 2 cups of flour, a dozen eggs, some olive oil"
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  {parseError && <p className="text-xs text-red-600">{parseError}</p>}
                  <button
                    onClick={handleParse}
                    disabled={parsing || !quickAddText.trim()}
                    className="btn-secondary text-sm w-full"
                  >
                    {parsing ? 'Parsing…' : 'Parse ingredients'}
                  </button>

                  {parsedItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Parsed items (edit before saving):</p>
                      {parsedItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                          <input
                            value={item.name}
                            onChange={e => {
                              const next = [...parsedItems]
                              next[idx] = { ...next[idx], name: e.target.value }
                              setParsedItems(next)
                            }}
                            className="flex-1 text-sm border-0 bg-transparent focus:outline-none"
                            placeholder="Name"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => {
                              const next = [...parsedItems]
                              next[idx] = { ...next[idx], quantity: Number(e.target.value) }
                              setParsedItems(next)
                            }}
                            className="w-16 text-sm border-0 bg-transparent focus:outline-none text-center"
                            min={0}
                          />
                          <input
                            value={item.unit}
                            onChange={e => {
                              const next = [...parsedItems]
                              next[idx] = { ...next[idx], unit: e.target.value }
                              setParsedItems(next)
                            }}
                            className="w-16 text-sm border-0 bg-transparent focus:outline-none"
                            placeholder="unit"
                          />
                          <button
                            onClick={() => setParsedItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. flour"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={form.quantity}
                        onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        min={0}
                        step={0.5}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        value={form.unit}
                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="cups, oz, …"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry date</label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (!editItem && !quickAddMode && !form.name) || (quickAddMode && parsedItems.length === 0)}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving…' : editItem ? 'Save changes' : 'Add to pantry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
