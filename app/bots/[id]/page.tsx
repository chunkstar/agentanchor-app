'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

const MODELS = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
]

export default function EditBotPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 1.0,
    max_tokens: 4096,
    is_public: false,
  })

  useEffect(() => {
    loadBot()
  }, [])

  const loadBot = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setFormData({
        name: data.name,
        description: data.description || '',
        system_prompt: data.system_prompt,
        model: data.model,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
        is_public: data.is_public,
      })
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load bot')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('bots')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error

      router.push('/bots')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update bot')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/bots')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete bot')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bots"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Bot
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Modify your AI assistant's settings
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label htmlFor="name" className="label">
            Bot Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="system_prompt" className="label">
            System Prompt *
          </label>
          <textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) =>
              setFormData({ ...formData, system_prompt: e.target.value })
            }
            className="input font-mono text-sm"
            rows={8}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="model" className="label">
              Model *
            </label>
            <select
              id="model"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="input"
            >
              {MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="temperature" className="label">
              Temperature: {formData.temperature}
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="max_tokens" className="label">
              Max Tokens
            </label>
            <input
              id="max_tokens"
              type="number"
              value={formData.max_tokens}
              onChange={(e) =>
                setFormData({ ...formData, max_tokens: parseInt(e.target.value) })
              }
              className="input"
              min="1"
              max="200000"
            />
          </div>

          <div className="flex items-center">
            <input
              id="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData({ ...formData, is_public: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_public"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Make this bot public
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/bots" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
